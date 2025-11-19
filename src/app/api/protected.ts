import { Routine } from "@/types/routineType";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const updatePaymentDate = async (id: string, paymentDate: string) => {
  const response = await fetch(`${API_URL}/api/protected/updatePaymentDate`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ paymentDate, id }),
  });
  return response;
};


export const deleteAthlete = async (id: string) => {
  const response = await fetch(`${API_URL}/api/protected/deleteAthlete`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ id }),
  });
  return response;
};

export const updateAthleteBasicInfo = async (id: string, name: string, email: string, phone: string, notes: string) => {
  const response = await fetch(`${API_URL}/api/protected/updateAthleteBasicInfo`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ id, name, email, phone, notes }),
  });
  return response;
};

export const updateAthleteDiet = async (id: string, diet: string) => {
  const response = await fetch(`${API_URL}/api/protected/updateAthleteDiet`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ id, diet }),
  });
  return response;
};

export const updateRoutine = async (idAthlete: string, routine: Routine) => {
  const response = await fetch(`${API_URL}/api/protected/updateRoutine`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },  
    body: JSON.stringify({ idAthlete, routine }),
  });
  return response;
};