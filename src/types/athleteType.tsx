import { Routine } from "./routineType";

export type Athlete = {
    id: string;
    coachId: string;
    repsTracked: boolean;
    paymentDate: string;
    notes: string;
    bodyWeight: number;
    name: string;
    email: string;
    phone: string;
    diet: string;
    routine: Routine;
}

export type NewAthlete = {
    coachId: string;
    repsTracked: boolean;
    paymentDate: string;
    notes: string;
    bodyWeight: number;
    name: string;
    email: string;
    phone: string;
    diet: string;
    routine: Routine;
}