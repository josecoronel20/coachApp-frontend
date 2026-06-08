import { requireApiUrl } from "@/config/env";
import type { ExerciseCatalogItem } from "@/types/exerciseCatalogType";

export async function listExerciseCatalog({
  query,
  muscleGroup,
}: {
  query?: string;
  muscleGroup?: string;
}): Promise<ExerciseCatalogItem[]> {
  const API_URL = requireApiUrl();
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (muscleGroup) params.set("muscleGroup", muscleGroup);

  const response = await fetch(
    `${API_URL}/api/exercise-catalog?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as {
    exercises?: ExerciseCatalogItem[];
  };
  return data.exercises || [];
}

export async function createCustomExerciseCatalogItem({
  name,
  muscleGroup,
}: {
  name: string;
  muscleGroup: string;
}): Promise<ExerciseCatalogItem | null> {
  const API_URL = requireApiUrl();
  const response = await fetch(`${API_URL}/api/exercise-catalog`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, muscleGroup }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    exercise?: ExerciseCatalogItem;
  };
  return data.exercise || null;
}
