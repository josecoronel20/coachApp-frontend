import { Athlete } from "@/types/athlete";
import { Coach } from "@/types/coach";
import { create } from "zustand";

type CoachStore = {
  coachInfo: Coach | null;
  setCoachInfo: (coachInfo: Coach) => void;
  athletesInfo: Athlete[] | null;
  setAthletesInfo: (athletesInfo: Athlete[]) => void;
};

export const useCoachStore = create<CoachStore>((set) => ({
  coachInfo: null,
  setCoachInfo: (coachInfo) => set({ coachInfo }),
  athletesInfo: null,
  setAthletesInfo: (athletesInfo) => set({ athletesInfo }),
}));



