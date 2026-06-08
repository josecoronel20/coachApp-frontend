import { requireApiUrl } from "@/config/env";
import type { SavedRoutinePayload } from "@/types/savedRoutineType";

export const listSavedRoutines = async () => {
  const API_URL = requireApiUrl();
  return fetch(`${API_URL}/api/coach/saved-routines`, {
    method: "GET",
    credentials: "include",
  });
};

export const createSavedRoutine = async (payload: SavedRoutinePayload) => {
  const API_URL = requireApiUrl();
  return fetch(`${API_URL}/api/coach/saved-routines`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const updateSavedRoutine = async (
  id: string,
  payload: SavedRoutinePayload
) => {
  const API_URL = requireApiUrl();
  return fetch(`${API_URL}/api/coach/saved-routines/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const deleteSavedRoutine = async (id: string) => {
  const API_URL = requireApiUrl();
  return fetch(`${API_URL}/api/coach/saved-routines/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
};

export const assignSavedRoutine = async (
  id: string,
  payload: { athleteId: string; replaceExisting?: boolean }
) => {
  const API_URL = requireApiUrl();
  return fetch(`${API_URL}/api/coach/saved-routines/${id}/assign`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};
