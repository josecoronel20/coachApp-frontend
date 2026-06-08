import { requireApiUrl } from "@/config/env";
import type { BuilderDay, BuilderExercise, ExerciseSearchResult } from "@/types/routineBuilderType";

export async function getRoutine(id: string) {
  const API_URL = requireApiUrl();
  return fetch(`${API_URL}/api/coach/routines/${id}`, { credentials: "include" });
}

export async function patchRoutineName(id: string, name: string) {
  const API_URL = requireApiUrl();
  return fetch(`${API_URL}/api/coach/routines/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export async function patchRoutineExercises(id: string, exercises: BuilderExercise[]) {
  const API_URL = requireApiUrl();
  return fetch(`${API_URL}/api/coach/routines/${id}/exercises`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exercises }),
  });
}

export async function patchRoutineDays(id: string, days: BuilderDay[]) {
  const API_URL = requireApiUrl();
  return fetch(`${API_URL}/api/coach/routines/${id}/exercises`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ days }),
  });
}

export async function searchExercises(params: {
  search?: string;
  muscle?: string;
  equipment?: string;
  limit?: number;
  offset?: number;
}): Promise<{ exercises: ExerciseSearchResult[]; total: number }> {
  const API_URL = requireApiUrl();
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.muscle) q.set("muscle", params.muscle);
  if (params.equipment) q.set("equipment", params.equipment);
  if (params.limit) q.set("limit", String(params.limit));
  if (params.offset) q.set("offset", String(params.offset));

  const res = await fetch(`${API_URL}/api/exercises?${q}`, { credentials: "include" });
  if (!res.ok) return { exercises: [], total: 0 };
  return res.json() as Promise<{ exercises: ExerciseSearchResult[]; total: number }>;
}

export async function saveAsTemplate(id: string, name: string) {
  const API_URL = requireApiUrl();
  return fetch(`${API_URL}/api/coach/routines/${id}/save-as-template`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export async function getMuscleGroups(): Promise<string[]> {
  const API_URL = requireApiUrl();
  const res = await fetch(`${API_URL}/api/exercises/muscles`, { credentials: "include" });
  if (!res.ok) return [];
  const data = (await res.json()) as { muscles: string[] };
  return data.muscles;
}
