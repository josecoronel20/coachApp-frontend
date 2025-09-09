//routine with athlete values
export type ExerciseHistory = {
    date: string;
    weight: number;
    sets: number[];
}

export type Exercise = {
    exercise: string;
    sets: number;
    rangeMin: number;
    rangeMax: number;
    coachNotes: string;
    athleteNotes: string;
    exerciseHistory: ExerciseHistory[] | null;
}

export type RoutineDay = Exercise[];

export type Routine = RoutineDay[];