// Tipos adicionales para la sesión de entrenamiento
// Estos tipos pueden ser útiles para futuras integraciones

export interface SessionConfig {
  autoSave: boolean;
  showHistory: boolean;
  enableSound: boolean;
}

export interface SessionStats {
  totalExercises: number;
  completedExercises: number;
  totalSets: number;
  completedSets: number;
  sessionDuration: number; // en minutos
}

export interface SessionValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Tipos para integración con backend
export interface SessionSubmission {
  athleteId: string;
  dayIndex: number;
  date: string;
  exercises: {
    exerciseId: string;
    weight: number;
    sets: number[];
    notes?: string;
  }[];
}

// Tipos para persistencia local
export interface SessionBackup {
  id: string;
  athleteId: string;
  dayIndex: number;
  timestamp: number;
  data: any; // sessionProgress
}
