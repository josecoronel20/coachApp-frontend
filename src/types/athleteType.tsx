import { Routine } from "./routineType";

export type Athlete = {
    id: string;
    coachId: string;
    paymentDate: string;
    notes: string;
    bodyWeight?: number;
    name: string;
    email?: string;
    phone: string;
    routine: Routine;
}

export type NewAthlete = {
    coachId: string;
    paymentDate: string;
    notes: string;
    bodyWeight?: number;
    name: string;
    email?: string;
    phone: string;
    routine: Routine;
}