import { create } from "zustand";

// Tipos para la sesión de entrenamiento
export interface SessionExercise {
  date: string;
  weight: number;
  sets: number[];
  athleteNotes?: string;
}

export interface SessionMeta {
  dayIndex: number | null;
  currentExerciseIndex: number;
  sessionActive: boolean;
}

export interface ExerciseDef {
  setsCount: number;
  weight?: number;
  rangeMin?: number;
  coachNotes?: string;
  athleteNotes?: string;
  lastHistory?: {
    weight: number;
    sets: number[];
  };
}

export interface SessionSnapshot {
  dayIndex: number;
  date: string;
  sessionProgress: SessionExercise[];
}

interface AthleteSessionState {
  // Estado de la sesión actual
  sessionProgress: SessionExercise[];
  sessionMeta: SessionMeta;
  
  // Acciones
  // Inicializar sesión
  initSession: (dayIndex: number, dayExercises: ExerciseDef[]) => void;
  setReps: (exIndex: number, setIndex: number, reps: number) => void;
  setWeight: (exIndex: number, weight: number) => void;
  updateAthleteNotes: (exIndex: number, notes: string) => void;
  // Navegar entre ejercicios
  nextExercise: () => void;
  prevExercise: () => void;
  // Finalizar sesión
  finalizeSession: () => SessionSnapshot;
}

export const useAthleteSessionStore = create<AthleteSessionState>((set, get) => ({
  // Estado inicial
  sessionProgress: [],
  sessionMeta: {
    dayIndex: null,
    currentExerciseIndex: 0,
    sessionActive: false,
  },

  // Inicializar sesión para un día específico
  initSession: (dayIndex: number, dayExercises: ExerciseDef[]) => {
    const currentDate = new Date().toISOString().split("T")[0];
    
    const sessionProgress: SessionExercise[] = dayExercises.map((exercise) => {
      // Inicializar sets con valores del historial o rango mínimo
      const sets = Array(exercise.setsCount).fill(0).map((_, index) => {
        return exercise.lastHistory?.sets?.[index] ?? exercise.rangeMin ?? 0;
      });

      return {
        date: currentDate,
        weight: exercise.lastHistory?.weight ?? exercise.weight ?? 0,
        sets,
        athleteNotes: exercise.athleteNotes || "",
      };
    });

    set({
      sessionProgress,
      sessionMeta: {
        dayIndex,
        currentExerciseIndex: 0,
        sessionActive: true,
      },
    });

    console.log("Sesión iniciada:", { dayIndex, sessionProgress });
  },

  // Actualizar reps de un set específico
  setReps: (exIndex: number, setIndex: number, reps: number) => {
    const { sessionProgress } = get();
    
    // Validar índices
    if (exIndex < 0 || exIndex >= sessionProgress.length) {
      console.warn("Índice de ejercicio fuera de rango:", exIndex);
      return;
    }
    
    if (setIndex < 0 || setIndex >= sessionProgress[exIndex].sets.length) {
      console.warn("Índice de set fuera de rango:", setIndex);
      return;
    }

    set((state) => {
      const newSessionProgress = [...state.sessionProgress];
      newSessionProgress[exIndex] = {
        ...newSessionProgress[exIndex],
        sets: [...newSessionProgress[exIndex].sets],
      };
      newSessionProgress[exIndex].sets[setIndex] = reps;
      
      return { sessionProgress: newSessionProgress };
    });
  },

  // Actualizar peso de un ejercicio
  setWeight: (exIndex: number, weight: number) => {
    const { sessionProgress } = get();
    
    if (exIndex < 0 || exIndex >= sessionProgress.length) {
      console.warn("Índice de ejercicio fuera de rango:", exIndex);
      return;
    }

    set((state) => {
      const newSessionProgress = [...state.sessionProgress];
      newSessionProgress[exIndex] = {
        ...newSessionProgress[exIndex],
        weight,
      };
      
      return { sessionProgress: newSessionProgress };
    });
  },

  // Actualizar notas del atleta
  updateAthleteNotes: (exIndex: number, notes: string) => {
    const { sessionProgress } = get();
    
    if (exIndex < 0 || exIndex >= sessionProgress.length) {
      console.warn("Índice de ejercicio fuera de rango:", exIndex);
      return;
    }

    set((state) => {
      const newSessionProgress = [...state.sessionProgress];
      newSessionProgress[exIndex] = {
        ...newSessionProgress[exIndex],
        athleteNotes: notes || "",
      };
      
      return { sessionProgress: newSessionProgress };
    });
  },

  // Navegar al siguiente ejercicio
  nextExercise: () => {
    const { sessionProgress, sessionMeta } = get();
    
    if (sessionMeta.currentExerciseIndex < sessionProgress.length - 1) {
      set((state) => ({
        sessionMeta: {
          ...state.sessionMeta,
          currentExerciseIndex: state.sessionMeta.currentExerciseIndex + 1,
        },
      }));
    }
  },

  // Navegar al ejercicio anterior
  prevExercise: () => {
    const { sessionMeta } = get();
    
    if (sessionMeta.currentExerciseIndex > 0) {
      set((state) => ({
        sessionMeta: {
          ...state.sessionMeta,
          currentExerciseIndex: state.sessionMeta.currentExerciseIndex - 1,
        },
      }));
    }
  },

  // Finalizar sesión y retornar snapshot
  finalizeSession: (): SessionSnapshot => {
    const { sessionProgress, sessionMeta } = get();
    
    if (!sessionMeta.sessionActive || sessionMeta.dayIndex === null) {
      throw new Error("No hay sesión activa para finalizar");
    }

    const snapshot: SessionSnapshot = {
      dayIndex: sessionMeta.dayIndex,
      date: sessionProgress[0]?.date || new Date().toISOString().split("T")[0],
      sessionProgress,
    };

    // Marcar sesión como inactiva
    set((state) => ({
      sessionMeta: {
        ...state.sessionMeta,
        sessionActive: false,
      },
    }));

    console.log("Sesión finalizada. Snapshot:", snapshot);
    
    // TODO: Enviar snapshot al backend
    // TODO: Persistir en localStorage
    
    return snapshot;
  },
}));
