// store/athleteStore.ts
import { create } from "zustand";
import { Athlete } from "@/types/athleteType";

interface AthleteState {
  // athlete data
  athlete: Athlete | null;
  // set athlete data
  setAthlete: (data: Athlete) => void;
}

export const useAthleteStore = create<AthleteState>((set) => ({
  athlete: null,
  setAthlete: (data) => set({ athlete: data }),
}));
