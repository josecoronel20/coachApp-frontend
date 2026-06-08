import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import type { Athlete } from "@/types/athleteType";
import { requireApiUrl } from "@/config/env";

/**
 * Listado con rutina (GET /api/coach/getAllAthletes). Más pesado: usar solo donde haga falta `routine`.
 * @param enabled — si false, SWR no dispara fetch (lazy-load, p. ej. al abrir Feedback).
 */
export const useGetAllAthletesWithRoutine = (enabled = false) => {
  const API_URL = requireApiUrl();
  const key = enabled ? `${API_URL}/api/coach/getAllAthletes` : null;
  const { data, error, isLoading, mutate } = useSWR<Athlete[]>(key, fetcher, {
    keepPreviousData: true,
  });

  return {
    athletes: data,
    isLoading,
    error,
    mutate,
  };
};
