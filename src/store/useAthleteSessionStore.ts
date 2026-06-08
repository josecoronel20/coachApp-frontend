import { create } from "zustand";
import type { SessionProgressEntryDTO } from "@coachapp/shared";

export type SessionExercise = SessionProgressEntryDTO;

export interface SessionMeta {
  dayIndex: number | null;
  currentExerciseIndex: number;
  sessionActive: boolean;
}

export interface ExerciseDef {
  exerciseId: string;
  setsCount: number;
  minReps: number;
  maxReps: number;
  weight?: number;
  coachNotes?: string;
  athleteNotes?: string;
  lastHistory?: { weight: number; sets: number[] };
}

export interface SessionSnapshot {
  dayIndex: number;
  date: string;
  sessionProgress: SessionExercise[];
}

interface AthleteSessionState {
  sessionProgress: SessionExercise[];
  sessionMeta: SessionMeta;
  initSession: (dayIndex: number, dayExercises: ExerciseDef[]) => void;
  restoreSession: (
    dayIndex: number,
    sessionProgress: SessionExercise[],
    currentExerciseIndex?: number
  ) => void;
  setReps: (exIndex: number, setIndex: number, reps: number) => void;
  setWeight: (exIndex: number, weight: number) => void;
  updateAthleteNotes: (exIndex: number, notes: string) => void;
  nextExercise: () => void;
  prevExercise: () => void;
  cancelSession: () => void;
  finalizeSession: () => SessionSnapshot;
}

export const useAthleteSessionStore = create<AthleteSessionState>((set, get) => ({
  sessionProgress: [],
  sessionMeta: {
    dayIndex: null,
    currentExerciseIndex: 0,
    sessionActive: false,
  },

  initSession: (dayIndex, dayExercises) => {
    const date = new Date().toISOString().split("T")[0];
    const sessionProgress: SessionExercise[] = dayExercises.map((ex) => {
      const sets = Array.from({ length: ex.setsCount }, (_, i) =>
        ex.lastHistory?.sets?.[i] ?? ex.minReps
      );
      return {
        exerciseId: ex.exerciseId,
        date,
        weight: ex.lastHistory?.weight ?? ex.weight ?? 0,
        sets,
        athleteNotes: ex.athleteNotes || "",
      };
    });
    set({
      sessionProgress,
      sessionMeta: { dayIndex, currentExerciseIndex: 0, sessionActive: true },
    });
  },

  restoreSession: (dayIndex, sessionProgress, currentExerciseIndex = 0) => {
    const safeExerciseIndex = Math.min(
      Math.max(currentExerciseIndex, 0),
      Math.max(sessionProgress.length - 1, 0)
    );

    set({
      sessionProgress: sessionProgress.map((entry) => ({
        ...entry,
        sets: [...entry.sets],
        athleteNotes: entry.athleteNotes || "",
      })),
      sessionMeta: {
        dayIndex,
        currentExerciseIndex: safeExerciseIndex,
        sessionActive: true,
      },
    });
  },

  setReps: (exIndex, setIndex, reps) => {
    const { sessionProgress } = get();
    const row = sessionProgress[exIndex];
    if (!row || setIndex < 0 || setIndex >= row.sets.length) return;

    set((state) => {
      const sessionProgress = [...state.sessionProgress];
      sessionProgress[exIndex] = {
        ...sessionProgress[exIndex],
        sets: [...sessionProgress[exIndex].sets],
      };
      sessionProgress[exIndex].sets[setIndex] = reps;
      return { sessionProgress };
    });
  },

  setWeight: (exIndex, weight) => {
    if (!get().sessionProgress[exIndex]) return;
    set((state) => {
      const sessionProgress = [...state.sessionProgress];
      sessionProgress[exIndex] = { ...sessionProgress[exIndex], weight };
      return { sessionProgress };
    });
  },

  updateAthleteNotes: (exIndex, notes) => {
    if (!get().sessionProgress[exIndex]) return;
    set((state) => {
      const sessionProgress = [...state.sessionProgress];
      sessionProgress[exIndex] = {
        ...sessionProgress[exIndex],
        athleteNotes: notes || "",
      };
      return { sessionProgress };
    });
  },

  nextExercise: () => {
    const { sessionProgress, sessionMeta } = get();
    const i = sessionMeta.currentExerciseIndex;
    if (i >= sessionProgress.length - 1) return;
    set((s) => ({
      sessionMeta: { ...s.sessionMeta, currentExerciseIndex: i + 1 },
    }));
  },

  prevExercise: () => {
    const i = get().sessionMeta.currentExerciseIndex;
    if (i <= 0) return;
    set((s) => ({
      sessionMeta: { ...s.sessionMeta, currentExerciseIndex: i - 1 },
    }));
  },

  cancelSession: () => {
    set({
      sessionProgress: [],
      sessionMeta: {
        dayIndex: null,
        currentExerciseIndex: 0,
        sessionActive: false,
      },
    });
  },

  finalizeSession: () => {
    const { sessionProgress, sessionMeta } = get();
    if (!sessionMeta.sessionActive || sessionMeta.dayIndex === null) {
      throw new Error("No hay sesión activa para finalizar");
    }
    const snapshot: SessionSnapshot = {
      dayIndex: sessionMeta.dayIndex,
      date: sessionProgress[0]?.date || new Date().toISOString().split("T")[0],
      sessionProgress,
    };
    set((s) => ({
      sessionMeta: { ...s.sessionMeta, sessionActive: false },
    }));
    return snapshot;
  },
}));
