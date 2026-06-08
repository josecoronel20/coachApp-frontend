import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getApiErrorMessage } from "@/lib/apiError"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then(async (res) => {
    if (!res.ok) {
      const message = await getApiErrorMessage(res);
      throw new Error(message);
    }
    return res.json();
  });


//seteo de info de atleta en local storage y en el store

