import useSWR from "swr";
import { fetcher } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useCoachInfo = () => {
    const { data, error, isLoading } = useSWR(`${API_URL}/api/coach/info`, fetcher);
    return { data, error, isLoading };
};