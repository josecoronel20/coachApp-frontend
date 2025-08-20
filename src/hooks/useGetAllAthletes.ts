import useSWR from "swr";
import { fetcher } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useGetAllAthletes = () => {
  const { data, error, isLoading, mutate } = useSWR(`${API_URL}/api/coach/getAllAthletes`, fetcher);

  return {
    athletes: data,
    isLoading,
    error,
    mutate
  };
};
