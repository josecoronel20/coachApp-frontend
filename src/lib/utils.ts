import { useAthleteStore } from "@/store/useAthleteStore";
import { Athlete } from "@/types/athleteType";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fetcher = (url: string) => fetch(url, { credentials: "include" }).then(res => res.json());


//seteo de info de atleta en local storage y en el store
