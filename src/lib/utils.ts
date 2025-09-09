import { useAthleteStore } from "@/store/useAthleteStore";
import { Athlete } from "@/types/athleteType";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fetcher = (url: string) => 
  fetch(url, { credentials: "include" })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });


//seteo de info de atleta en local storage y en el store

