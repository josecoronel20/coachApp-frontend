// store/athleteStore.ts
import { create } from "zustand";
import { Athlete } from "@/types/athleteType";

interface AthleteState {
  // athlete data
  athlete: Athlete | null;
  // current session data
  infoCurrentSession: {
    date: string;
    weight: number;
    sets: number[];
  }[];
  // set athlete data
  setAthlete: (data: Athlete) => void;
  // set current session data
  setInfoCurrentSession: (
    indexExercise: number,
    data: {
      date: string;
      weight: number;
      sets: number[];
    }
  ) => void;
  // update one exercise when go next or previous exercise for persist data
 
}

export const useAthleteStore = create<AthleteState>((set, get) => ({
  athlete: null,
  // current session data
  infoCurrentSession: [],
  // set athlete data
  setAthlete: (data) => set({ athlete: data }),
  // set current session data
  setInfoCurrentSession: (indexExercise, data) =>
    set((state) => {
      const newInfoCurrentSession = [...state.infoCurrentSession];
      newInfoCurrentSession[indexExercise] = data;
      return { infoCurrentSession: newInfoCurrentSession };
    }),

}));
