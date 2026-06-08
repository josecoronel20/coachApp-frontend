import type { Exercise, ExerciseHistory } from "@/types/routineType";
import type { SessionHistoryItem } from "@/types/sessionHistoryType";

type LatestHistoryEntry = ExerciseHistory & {
  timestamp: number;
};

const parseSessionTimestamp = (date: string) => {
  const timestamp = new Date(date).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export function buildLatestExerciseHistoryByExerciseId(
  sessions: SessionHistoryItem[]
): Map<string, ExerciseHistory> {
  const latestByExerciseId = new Map<string, LatestHistoryEntry>();

  sessions.forEach((session) => {
    const timestamp = parseSessionTimestamp(session.date);

    session.exercises.forEach((exercise) => {
      if (!exercise.exerciseId) return;

      const current = latestByExerciseId.get(exercise.exerciseId);
      if (current && current.timestamp >= timestamp) return;

      latestByExerciseId.set(exercise.exerciseId, {
        date: session.date,
        weight: exercise.weight,
        sets: exercise.sets,
        timestamp,
      });
    });
  });

  return new Map(
    Array.from(latestByExerciseId.entries()).map(([exerciseId, history]) => [
      exerciseId,
      {
        date: history.date,
        weight: history.weight,
        sets: history.sets,
      },
    ])
  );
}

export function getLatestExerciseHistory(
  exercise: Exercise,
  latestByExerciseId?: Map<string, ExerciseHistory>
): ExerciseHistory | null {
  if (exercise.id) {
    const fromSessionHistory = latestByExerciseId?.get(exercise.id);
    if (fromSessionHistory) return fromSessionHistory;
  }

  const history = exercise.exerciseHistory;
  if (!history || history.length === 0) return null;

  return history[history.length - 1] ?? null;
}
