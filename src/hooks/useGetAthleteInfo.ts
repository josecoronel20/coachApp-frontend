import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { requireApiUrl } from "@/config/env";

export const useGetAthleteInfo = (id: string) => {
    const API_URL = requireApiUrl();
    const {data,mutate,isLoading,error} = useSWR(`${API_URL}/api/coach/getAthleteInfo/${id}`, fetcher)
    return {data,mutate,isLoading,error}
}
