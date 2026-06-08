export type ProgressionStatus =
  | "maintain_weight"
  | "ready_to_increase"
  | "review"
  | "partial_session";

export type ProgressionInfo = {
  status: ProgressionStatus;
  label: string;
  message: string;
  reasons: string[];
};

export type SessionHistoryExercise = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetReps: string;
  minReps: number;
  maxReps: number;
  expectedSets: number;
  weight: number;
  sets: number[];
  athleteNotes: string;
  isCurrentRoutineExercise: boolean;
  progression: ProgressionInfo;
};

export type SessionHistoryItem = {
  id: string;
  date: string;
  dayIndex: number;
  exercises: SessionHistoryExercise[];
};
