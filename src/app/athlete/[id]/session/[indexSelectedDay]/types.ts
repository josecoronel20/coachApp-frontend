// Types for training session state management
export type TrainingSet = {
  isDone: boolean;
  reps: number;
  targetReps: number;
};

export type TrainingExercise = {
  exercise: string;
  sets: TrainingSet[];
  range: [number, number];
  weight: number;
  coachNotes: string | null;
  athleteNotes: string | null;
  exerciseHistory: { date: string; weight: number; sets: number[] }[];
};

export type TrainingSession = TrainingExercise[];
