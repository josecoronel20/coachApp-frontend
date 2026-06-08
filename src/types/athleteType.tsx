import { Routine } from "./routineType";

/**
 * Respuesta de GET /api/coach/getAllAthletesLite (select Prisma, sin rutina).
 */
export type AthleteLite = {
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
};

export type Athlete = AthleteLite & {
    routine: Routine;
};

/** Body de POST /api/coach/newAthlete (solo datos básicos; rutina en ficha vía updateRoutine). */
export type CreateAthleteBody = {
    name: string;
    email: string;
    phone: string;
    diet: string;
};
