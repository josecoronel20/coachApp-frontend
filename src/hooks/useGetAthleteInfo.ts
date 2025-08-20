import useSWR from "swr";
import { fetcher } from "@/lib/utils";

export const useGetAthleteInfo = (id: string) => {
    const {data,mutate,isLoading,error} = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/api/coach/getAthleteInfo/${id}`, fetcher)
    return {data,mutate,isLoading,error}
}
