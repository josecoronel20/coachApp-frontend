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
    exerciseHistory: ExerciseHistory[];
}

export type RoutineDay = Exercise[];

export type Routine = RoutineDay[];

//routine without athlete values
export type NewExercise = {
    exercise: string;
    sets: number;
    rangeMin: number;
    rangeMax: number;
    coachNotes: string;
}

export type NewRoutineDay = NewExercise[];

export type NewRoutine = NewRoutineDay[];