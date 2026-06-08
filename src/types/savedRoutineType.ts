import type { Routine } from "./routineType";

export type SavedRoutine = {
  id: string;
  name: string;
  routine: Routine;
  daysCount: number;
  exercisesCount: number;
  createdAt: string;
  updatedAt: string;
};

export type SavedRoutinePayload = {
  name: string;
  routine: Routine;
};
