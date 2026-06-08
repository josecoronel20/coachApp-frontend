import { Routine } from "@/types/routineType";
import { requireApiUrl } from "@/config/env";
import { normalizeRoutine, routineExerciseForApi } from "@/lib/routineExercise";

export const updatePaymentDate = async (id: string, paymentDate: string) => {
  const API_URL = requireApiUrl();
  const response = await fetch(`${API_URL}/api/protected/updatePaymentDate`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentDate, id }),
  });
  return response;
};


export const deleteAthlete = async (id: string) => {
  const API_URL = requireApiUrl();
  const response = await fetch(`${API_URL}/api/protected/deleteAthlete`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  return response;
};

export const updateAthleteBasicInfo = async (id: string, name: string, email: string, phone: string, notes: string) => {
  const API_URL = requireApiUrl();
  const response = await fetch(`${API_URL}/api/protected/updateAthleteBasicInfo`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, name, email, phone, notes }),
  });
  return response;
};

export const updateAthleteDiet = async (id: string, diet: string) => {
  const API_URL = requireApiUrl();
  const response = await fetch(`${API_URL}/api/protected/updateAthleteDiet`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, diet }),
  });
  return response;
};

export const updateRoutine = async (idAthlete: string, routine: Routine) => {
  const API_URL = requireApiUrl();
  const response = await fetch(`${API_URL}/api/protected/updateRoutine`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },  
    body: JSON.stringify({
      idAthlete,
      routine: normalizeRoutine(routine).map((day) =>
        day.map((ex, order) => ({ ...routineExerciseForApi(ex), order }))
      ),
    }),
  });
  return response;
};
