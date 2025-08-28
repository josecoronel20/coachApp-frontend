import { Exercise } from "@/types/routineType";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAthleteById = async (id: string) => {
  const response = await fetch(`${API_URL}/api/athletes/${id}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const updateExercise = async (id: string, dayIndex: number, exerciseIndex: number, updatedExercise: Exercise) => {
    const response = await fetch(`${API_URL}/api/athletes/exerciseUpdate`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, dayIndex, exerciseIndex, updatedExercise }),
    });
    return response;
}