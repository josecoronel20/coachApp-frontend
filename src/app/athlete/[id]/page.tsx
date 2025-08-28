"use client";

import { Loader2 } from "lucide-react";
import { AthleteView } from "./athleteComponent/Athlete-view";
import { useAthleteStore } from "@/store/useAthleteStore";

export default function AthletePage() {
  const { athlete } = useAthleteStore();

  if (!athlete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-900">Cargando rutina...</span>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-gray-600">
        <p>No se pudo cargar la rutina del atleta.</p>
      </div>
    );
  }

  return <AthleteView />;
}
