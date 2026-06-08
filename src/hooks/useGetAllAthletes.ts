import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import type { AthleteLite } from "@/types/athleteType";
import { requireApiUrl } from "@/config/env";

export const useGetAllAthletes = () => {
  const API_URL = requireApiUrl();
  const key = `${API_URL}/api/coach/getAllAthletesLite`;
  const { data, error, isLoading, mutate } = useSWR<AthleteLite[]>(
    key,
    fetcher
  );

  return {
    athletes: data,
    isLoading,
    error,
    mutate
  };
};
