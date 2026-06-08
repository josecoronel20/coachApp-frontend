import type { SessionProgressEntryDTO } from "@coachapp/shared";
import { requireApiUrl } from "@/config/env";

export const getAthleteById = async (id: string) => {
  const API_URL = requireApiUrl();
  const response = await fetch(`${API_URL}/api/athletes/${id}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
};

// export const updateExercise = async (id: string, dayIndex: number, exerciseIndex: number, updatedExercise: Exercise) => {
//     const response = await fetch(`${API_URL}/api/athletes/exerciseUpdate`, {
//         method: "PUT",
//         credentials: "include",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ id, dayIndex, exerciseIndex, updatedExercise }),
//     });
//     return response;
//}

export const saveSession = async (
    id: string,
    dayIndex: number,
    sessionProgress: SessionProgressEntryDTO[],
    clientSessionId?: string
) => {
    const API_URL = requireApiUrl();
    const body = clientSessionId
        ? { id, dayIndex, clientSessionId, sessionProgress }
        : { id, dayIndex, sessionProgress };
    const response = await fetch(`${API_URL}/api/athletes/saveSession`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    return response
}

export const updateBodyWeight = async (id: string, bodyWeight: number) => {
    const API_URL = requireApiUrl();
    const response = await fetch(`${API_URL}/api/athletes/updateBodyWeight`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, bodyWeight }),
    });
    return response;
}

export const updateRepsTracked = async (id: string, repsTracked: boolean) => {
    const API_URL = requireApiUrl();
    const response = await fetch(`${API_URL}/api/athletes/updateRepsTracked`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, repsTracked }),
    });
    return response;
}
