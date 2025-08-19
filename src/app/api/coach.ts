import { NewAthlete } from "@/types/athleteType";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const createNewAthlete = async (data: NewAthlete) => {
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

export default createNewAthlete;