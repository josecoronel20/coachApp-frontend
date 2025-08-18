//routine with athlete values
export type ExerciseHistory = {
    date: string;
    weight: number;
    sets: number[];
}

export type Exercise = {
    exercise: string;
    sets: number[];
    range:[number,number];
    weight: number;
    coachNotes: string | null;
    athleteNotes: string | null;
    exerciseHistory: ExerciseHistory[];
}

export type RoutineDay = Exercise[];

export type Routine = RoutineDay[];

//routine without athlete values
export type NewExercise = {
    exercise: string;
    sets: number[];
    range:[number,number];
    coachNotes: string | null;
}

export type NewRoutineDay = NewExercise[];

export type NewRoutine = NewRoutineDay[];