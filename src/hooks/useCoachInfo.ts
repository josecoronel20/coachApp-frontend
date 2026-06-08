import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { requireApiUrl } from "@/config/env";

export const useCoachInfo = () => {
    const API_URL = requireApiUrl();
    const { data, error, isLoading } = useSWR(`${API_URL}/api/coach/info`, fetcher);
    return { data, error, isLoading };
};
