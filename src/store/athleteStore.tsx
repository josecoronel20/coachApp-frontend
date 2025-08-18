import { Athlete } from "@/types/athlete";
import { create } from "zustand";

type AthleteStore = {
  athleteInfo: Athlete | null;
  setAthleteInfo: (athleteInfo: Athlete) => void;
};

export const useAthleteStore = create<AthleteStore>((set) => ({
  athleteInfo: null,
  setAthleteInfo: (athleteInfo) => set({ athleteInfo }),
}));
