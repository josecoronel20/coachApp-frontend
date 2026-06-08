import { CreateAthleteBody } from "@/types/athleteType";
import { requireApiUrl } from "@/config/env";

const createNewAthlete = async (data: CreateAthleteBody) => {
    const API_URL = requireApiUrl();
    const response = await fetch(`${API_URL}/api/coach/newAthlete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
    });
    return response;
};

const getAthleteInfo = async (id: string) => {
    const API_URL = requireApiUrl();
    const response = await fetch(`${API_URL}/api/coach/getAthleteInfo/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response;
};

const getAllAthletes = async () => {
    const API_URL = requireApiUrl();
    const response = await fetch(`${API_URL}/api/coach/getAllAthletes`, {
        method: "GET",
        credentials: "include",
    });
    return response;
};

export { createNewAthlete, getAthleteInfo, getAllAthletes };
