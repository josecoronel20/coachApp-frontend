// Routine with athlete values.
export type ExerciseHistory = {
  date: string;
  weight: number;
  sets: number[];
};

export type Exercise = {
  id?: string;
  exercise: string;
  sets: number;
  minReps: number;
  maxReps: number;
  order?: number;
  /** @deprecated Compat temporal/visual. El editor usa minReps/maxReps. */
  targetReps: string;
  /** @deprecated Solo compat TS / modulos legacy. No usar en editor ni enviar al BE. */
  rangeMin?: number;
  /** @deprecated Solo compat TS / modulos legacy. No usar en editor ni enviar al BE. */
  rangeMax?: number;
  coachNotes: string;
  athleteNotes: string;
  exerciseHistory: ExerciseHistory[] | null;
};

export type RoutineDay = Exercise[];

export type Routine = RoutineDay[];
