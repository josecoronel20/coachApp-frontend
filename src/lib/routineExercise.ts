import type { Exercise, Routine } from "@/types/routineType";

export const MAX_REPS_LIMIT = 100;
export const DEFAULT_MIN_REPS = 8;
export const DEFAULT_MAX_REPS = 12;

export type RepRange = {
  minReps: number;
  maxReps: number;
  usedFallback?: boolean;
};

type ExerciseInput = Partial<Exercise> & {
  rangeMin?: number;
  rangeMax?: number;
};

function normalizePositiveInteger(raw: unknown): number | null {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  return i >= 1 ? i : null;
}

export function parseRepRange(raw: unknown): RepRange | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;

  const single = value.match(/^(\d+)$/);
  if (single) {
    const reps = normalizePositiveInteger(single[1]);
    if (reps === null || reps > MAX_REPS_LIMIT) return null;
    return { minReps: reps, maxReps: reps };
  }

  const range = value.match(/^(\d+)\s*-\s*(\d+)$/);
  if (range) {
    const minReps = normalizePositiveInteger(range[1]);
    const maxReps = normalizePositiveInteger(range[2]);
    if (
      minReps === null ||
      maxReps === null ||
      maxReps < minReps ||
      maxReps > MAX_REPS_LIMIT
    ) {
      return null;
    }
    return { minReps, maxReps };
  }

  return null;
}

export function formatTargetReps({
  minReps,
  maxReps,
}: Pick<RepRange, "minReps" | "maxReps">): string {
  return minReps === maxReps ? `${minReps}` : `${minReps}-${maxReps}`;
}

export function formatRepRangeLabel(exercise: Pick<Exercise, "minReps" | "maxReps">): string {
  return exercise.minReps === exercise.maxReps
    ? `${exercise.minReps} reps`
    : `${exercise.minReps}-${exercise.maxReps} reps`;
}

export function resolveRepRangeFromExercise(ex: ExerciseInput): RepRange {
  const minReps = normalizePositiveInteger(ex.minReps);
  const maxReps = normalizePositiveInteger(ex.maxReps);

  if (
    minReps !== null &&
    maxReps !== null &&
    maxReps >= minReps &&
    maxReps <= MAX_REPS_LIMIT
  ) {
    return { minReps, maxReps };
  }

  const fromTarget = parseRepRange(ex.targetReps);
  if (fromTarget) return fromTarget;

  const rangeMin = normalizePositiveInteger(ex.rangeMin);
  const rangeMax = normalizePositiveInteger(ex.rangeMax);
  if (
    rangeMin !== null &&
    rangeMax !== null &&
    rangeMax >= rangeMin &&
    rangeMax <= MAX_REPS_LIMIT
  ) {
    return { minReps: rangeMin, maxReps: rangeMax };
  }

  return {
    minReps: DEFAULT_MIN_REPS,
    maxReps: DEFAULT_MAX_REPS,
    usedFallback: true,
  };
}

export function normalizeExerciseForEditor(ex: ExerciseInput): Exercise {
  const repRange = resolveRepRangeFromExercise(ex);
  const rest: Partial<ExerciseInput> = { ...ex };
  delete rest.rangeMin;
  delete rest.rangeMax;

  return {
    id: rest.id,
    exercise: rest.exercise ?? "",
    sets: Math.max(1, Number(rest.sets) || 1),
    minReps: repRange.minReps,
    maxReps: repRange.maxReps,
    order: rest.order,
    targetReps: formatTargetReps(repRange),
    coachNotes: rest.coachNotes ?? "",
    athleteNotes: rest.athleteNotes ?? "",
    exerciseHistory: rest.exerciseHistory ?? null,
  };
}

export function normalizeRoutine(routine: Routine): Routine {
  return routine.map((day) => day.map((ex) => normalizeExerciseForEditor(ex)));
}

/** Clon para duplicar ejercicio/dia: sin `id` ni historial (nuevo registro al persistir). */
export function stripExerciseForDuplicate(exercise: Exercise): Exercise {
  const normalized = normalizeExerciseForEditor(exercise);
  return {
    exercise: normalized.exercise,
    sets: normalized.sets,
    minReps: normalized.minReps,
    maxReps: normalized.maxReps,
    order: normalized.order,
    targetReps: formatTargetReps(normalized),
    coachNotes: normalized.coachNotes,
    athleteNotes: normalized.athleteNotes,
    exerciseHistory: null,
  };
}

/** Duplicar serie = +1 en contador (mismo ejercicio, conserva `id`). */
export function incrementExerciseSets(exercise: Exercise): Exercise {
  return {
    ...normalizeExerciseForEditor(exercise),
    sets: Math.max(1, Number(exercise.sets) || 1) + 1,
  };
}

export function insertExerciseAfter(
  routine: Routine,
  dayIndex: number,
  exerciseIndex: number,
  clone: Exercise
): Routine {
  const next = routine.map((day, dIdx) => {
    if (dIdx !== dayIndex) return day;
    const insertAt = exerciseIndex + 1;
    return [...day.slice(0, insertAt), clone, ...day.slice(insertAt)];
  });
  assertNoDuplicateExerciseIds(next);
  return next;
}

export function insertDayAfter(
  routine: Routine,
  dayIndex: number,
  cloneDay: Exercise[]
): Routine {
  const insertAt = dayIndex + 1;
  const next = [
    ...routine.slice(0, insertAt),
    cloneDay,
    ...routine.slice(insertAt),
  ];
  assertNoDuplicateExerciseIds(next);
  return next;
}

/** Defensivo: dos ejercicios no deben compartir el mismo `id` persistido. */
export function assertNoDuplicateExerciseIds(routine: Routine): void {
  const seen = new Set<string>();
  for (const day of routine) {
    for (const ex of day) {
      const id = ex.id?.trim();
      if (!id) continue;
      if (seen.has(id)) {
        console.warn(
          "[routineExercise] Rutina con ids de ejercicio duplicados:",
          id
        );
        return;
      }
      seen.add(id);
    }
  }
}

/** Payload de escritura: minReps/maxReps son fuente de verdad; targetReps va derivado por compat. */
export function routineExerciseForApi(exercise: Exercise): Exercise {
  const normalized = normalizeExerciseForEditor(exercise);
  return {
    id: normalized.id,
    exercise: normalized.exercise,
    sets: normalized.sets,
    minReps: normalized.minReps,
    maxReps: normalized.maxReps,
    order: normalized.order,
    targetReps: formatTargetReps(normalized),
    coachNotes: normalized.coachNotes,
    athleteNotes: normalized.athleteNotes,
    exerciseHistory: normalized.exerciseHistory,
  };
}
