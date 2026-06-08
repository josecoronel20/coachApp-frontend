import type {
  SessionHistoryExercise,
  SessionHistoryItem,
} from "@/types/sessionHistoryType";

export type HistoryProgressStatus =
  | "ready_to_increase"
  | "progressing"
  | "stable"
  | "down"
  | "insufficient_data";

export type ExerciseHistoryRecord = {
  sessionId: string;
  date: string;
  dayIndex: number;
  exerciseId: string;
  exerciseName: string;
  targetReps: string;
  minReps: number;
  maxReps: number;
  expectedSets: number;
  weight: number;
  sets: number[];
  totalReps: number;
  volume: number;
  reachedMaxReps: boolean;
  athleteNotes: string;
  source: SessionHistoryExercise;
};

export type ExerciseHistoryMetrics = {
  key: string;
  exerciseId: string;
  exerciseName: string;
  dayIndex: number;
  dayLabel: string;
  sessionsAvailable: number;
  records: ExerciseHistoryRecord[];
  firstRecord: ExerciseHistoryRecord | null;
  previousRecord: ExerciseHistoryRecord | null;
  lastRecord: ExerciseHistoryRecord | null;
  bestRecord: ExerciseHistoryRecord | null;
  weightDeltaFirstToLast: number | null;
  totalRepsDeltaPreviousToLast: number | null;
  volumeDeltaPreviousToLast: number | null;
  status: HistoryProgressStatus;
};

const DELETED_EXERCISE_NAME = "Ejercicio eliminado";

function parseSessionTime(session: SessionHistoryItem): number {
  const dateTime = new Date(session.date).getTime();
  return Number.isNaN(dateTime) ? 0 : dateTime;
}

function getExerciseKey(
  session: SessionHistoryItem,
  exercise: SessionHistoryExercise
): string {
  if (exercise.exerciseName === DELETED_EXERCISE_NAME) {
    return `deleted-day-${session.dayIndex}`;
  }

  return exercise.exerciseId || `${session.dayIndex}-${exercise.exerciseName}`;
}

function sumReps(sets: number[]): number {
  return sets.reduce((total, reps) => total + Number(reps || 0), 0);
}

function hasReachedMaxReps(exercise: SessionHistoryExercise): boolean {
  const maxReps = Number(exercise.maxReps);

  if (
    !Number.isInteger(maxReps) ||
    maxReps < 1 ||
    !Array.isArray(exercise.sets) ||
    exercise.sets.length === 0
  ) {
    return false;
  }

  return exercise.sets.every((reps) => Number(reps) >= maxReps);
}

function toRecord(
  session: SessionHistoryItem,
  exercise: SessionHistoryExercise
): ExerciseHistoryRecord {
  const weight = Number(exercise.weight);
  const safeWeight = Number.isFinite(weight) ? weight : 0;
  const totalReps = sumReps(exercise.sets);

  return {
    sessionId: session.id,
    date: session.date,
    dayIndex: session.dayIndex,
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.exerciseName,
    targetReps: exercise.targetReps,
    minReps: exercise.minReps,
    maxReps: exercise.maxReps,
    expectedSets: exercise.expectedSets,
    weight: safeWeight,
    sets: exercise.sets,
    totalReps,
    volume: safeWeight * totalReps,
    reachedMaxReps: hasReachedMaxReps(exercise),
    athleteNotes: exercise.athleteNotes,
    source: exercise,
  };
}

function pickBestRecord(
  records: ExerciseHistoryRecord[]
): ExerciseHistoryRecord | null {
  if (records.length === 0) return null;

  return records.reduce((best, current) => {
    if (current.volume !== best.volume) {
      return current.volume > best.volume ? current : best;
    }

    if (current.weight !== best.weight) {
      return current.weight > best.weight ? current : best;
    }

    return current.totalReps > best.totalReps ? current : best;
  }, records[0]);
}

function resolveProgressStatus(
  lastRecord: ExerciseHistoryRecord | null,
  previousRecord: ExerciseHistoryRecord | null
): HistoryProgressStatus {
  if (!lastRecord) return "insufficient_data";

  if (lastRecord.reachedMaxReps) {
    return "ready_to_increase";
  }

  if (!previousRecord) {
    return "insufficient_data";
  }

  if (
    lastRecord.weight > previousRecord.weight ||
    lastRecord.totalReps > previousRecord.totalReps
  ) {
    return "progressing";
  }

  if (
    lastRecord.weight < previousRecord.weight ||
    lastRecord.totalReps < previousRecord.totalReps
  ) {
    return "down";
  }

  return "stable";
}

export function buildExerciseHistoryMetrics(
  sessions: SessionHistoryItem[]
): ExerciseHistoryMetrics[] {
  const chronologicalSessions = [...sessions].sort(
    (first, second) => parseSessionTime(first) - parseSessionTime(second)
  );
  const recordsByExercise = new Map<string, ExerciseHistoryRecord[]>();

  chronologicalSessions.forEach((session) => {
    session.exercises.forEach((exercise) => {
      if (exercise.isCurrentRoutineExercise === false) {
        return;
      }

      const key = getExerciseKey(session, exercise);
      const currentRecords = recordsByExercise.get(key) ?? [];

      recordsByExercise.set(key, [...currentRecords, toRecord(session, exercise)]);
    });
  });

  return Array.from(recordsByExercise.entries())
    .map(([key, records]) => {
      const firstRecord = records[0] ?? null;
      const lastRecord = records[records.length - 1] ?? null;
      const previousRecord =
        records.length > 1 ? records[records.length - 2] : null;
      const bestRecord = pickBestRecord(records);

      return {
        key,
        exerciseId: firstRecord?.exerciseId || "",
        exerciseName: firstRecord?.exerciseName || DELETED_EXERCISE_NAME,
        dayIndex: firstRecord?.dayIndex ?? 0,
        dayLabel: `Dia ${(firstRecord?.dayIndex ?? 0) + 1}`,
        sessionsAvailable: records.length,
        records,
        firstRecord,
        previousRecord,
        lastRecord,
        bestRecord,
        weightDeltaFirstToLast:
          firstRecord && lastRecord ? lastRecord.weight - firstRecord.weight : null,
        totalRepsDeltaPreviousToLast:
          previousRecord && lastRecord
            ? lastRecord.totalReps - previousRecord.totalReps
            : null,
        volumeDeltaPreviousToLast:
          previousRecord && lastRecord
            ? lastRecord.volume - previousRecord.volume
            : null,
        status: resolveProgressStatus(lastRecord, previousRecord),
      } satisfies ExerciseHistoryMetrics;
    })
    .sort((first, second) => {
      const byName = first.exerciseName.localeCompare(second.exerciseName);
      if (byName !== 0) return byName;
      return first.dayIndex - second.dayIndex;
    });
}
