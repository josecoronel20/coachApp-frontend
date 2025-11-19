"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllAthletes } from "@/app/api/coach";
import type { Athlete } from "@/types/athleteType";
import AthleteCard from "./AthleteCard";

interface AthleteGridProps {
  /** Texto usado para filtrar atletas por nombre */
  searchQuery: string;
}

/**
 * Obtiene la lista de atletas del coach y los muestra en un grid filtrable.
 */
const AthleteGrid = ({ searchQuery }: AthleteGridProps) => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const response = await getAllAthletes();
        const data = await response.json();
        setAthletes(data);
      } catch (error) {
        console.error("Fallo al obtener atletas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAthletes();
  }, []);

  const filteredAthletes = useMemo(() => {
    if (!searchQuery) return athletes;

    const normalizedQuery = searchQuery.toLowerCase();
    return athletes.filter((athlete) =>
      athlete.name.toLowerCase().includes(normalizedQuery)
    );
  }, [athletes, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10 text-muted-foreground">
        Cargando atletas...
      </div>
    );
  }

  if (!filteredAthletes.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
        <span className="text-sm">No encontramos atletas que coincidan con la búsqueda.</span>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredAthletes.map((athlete) => (
        <AthleteCard key={athlete.id} athlete={athlete} />
      ))}
    </section>
  );
};

export default AthleteGrid;
