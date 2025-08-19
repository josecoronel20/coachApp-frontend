import { Athlete } from "@/types/athleteType";
import { Coach } from "@/types/coachType";
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



