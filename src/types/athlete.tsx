import { Routine } from "./routine";

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