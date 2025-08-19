import { Athlete, NewAthlete } from "@/types/athleteType";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const newAthlete = async (athlete: NewAthlete) => {
    const response = await fetch(`${API_URL}/athletes`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(athlete),
    });

    return response.json();
};

export const getAthletes = async (coachId: string) => {
    const response = await fetch(`${API_URL}/athletes/coach/${coachId}`, {
        credentials: "include",
    });

    return response.json();
};

export const getAthlete = async (athleteId: string) => {
    const response = await fetch(`${API_URL}/athletes/${athleteId}`, {
        credentials: "include",
    });

    return response.json();
};
