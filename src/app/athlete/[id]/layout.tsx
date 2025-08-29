"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAthleteById } from "@/app/api/athlete";
import { useAthleteStore } from "@/store/useAthleteStore";
import { Athlete } from "@/types/athleteType";

/**
 * Layout que maneja la carga del atleta
 * - Verifica si existe en localStorage
 * - Si no existe, lo obtiene del backend
 * - Guarda en localStorage y store
 */
const AthleteLayout = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const { setAthlete } = useAthleteStore();

  useEffect(() => {
    const fetchAthlete = async () => {
      const response = await getAthleteById(params.id as string);
      const data = await response.json();
      setAthlete(data);
      localStorage.setItem("athlete", JSON.stringify(data));
    };

    if (localStorage.getItem("athlete")) {
      setAthlete(JSON.parse(localStorage.getItem("athlete") || ""));
    } else {
      fetchAthlete();
    }
  }, [params.id]);

  // Renderizar children cuando el atleta esté cargado
  return <>{children}</>;
};

export default AthleteLayout;
