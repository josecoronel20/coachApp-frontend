export type BuilderSet = {
  id: string;
  weight: number | "";
  reps: number | "";
  minReps: number | "";
  maxReps: number | "";
};

export type RepRangeMode = "simple" | "range";

export type BuilderExercise = {
  id: string;
  name: string;
  gifUrl?: string | null;
  targetMuscle?: string | null;
  secondaryMuscles?: string[];
  sets: BuilderSet[];
  coachNotes: string;
  notesOpen: boolean;
  repRangeMode: RepRangeMode;
};

export type BuilderDay = {
  id: string;
  dayIndex: number;
  name: string;
  exercises: BuilderExercise[];
};

export type BuilderRoutine = {
  __builderFormat: "days-v2";
  days: BuilderDay[];
};

export type LegacyFlatBuilderRoutine = {
  __builderFormat: true;
  exercises: BuilderExercise[];
};

export type ExerciseSearchResult = {
  id: string;
  name: string;
  gifUrl: string | null;
  targetMuscle: string | null;
  secondaryMuscles: string[];
};
