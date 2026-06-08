"use client";

import { useMemo } from "react";
import AthleteCard from "./AthleteCard";
import { useGetAllAthletes } from "@/hooks/useGetAllAthletes";
import { AthleteCardSkeleton } from "@/components/loading/AthleteCardSkeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

interface AthleteGridProps {
  /** Texto usado para filtrar atletas por nombre */
  searchQuery: string;
}

/**
 * Obtiene la lista de atletas del coach y los muestra en un grid filtrable.
 */
const AthleteGrid = ({ searchQuery }: AthleteGridProps) => {
  const { athletes, isLoading, error } = useGetAllAthletes();

  const filteredAthletes = useMemo(() => {
    if (!athletes) return [];
    if (!searchQuery) return athletes;

    const normalizedQuery = searchQuery.toLowerCase();
    return athletes.filter((athlete) =>
      athlete.name.toLowerCase().includes(normalizedQuery)
    );
  }, [athletes, searchQuery]);

  if (isLoading) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-text-secondary">
            Mis atletas
          </h2>
          <span className="text-sm text-text-muted">Cargando...</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <AthleteCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="No pudimos cargar tus atletas"
        description="Revisa tu conexion e intenta nuevamente en unos segundos."
      />
    );
  }

  if (!filteredAthletes.length) {
    const hasAthletes = (athletes?.length ?? 0) > 0;

    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-text-secondary">
            Mis atletas
          </h2>
          <span className="text-sm text-text-muted">
            {athletes?.length ?? 0} activos
          </span>
        </div>
        <EmptyState
          title={
            hasAthletes
              ? "No encontramos atletas"
              : "Todavia no hay atletas"
          }
          description={
            hasAthletes
              ? "Proba con otro nombre o limpia la busqueda."
              : "Crea el primero para empezar a cargar rutinas y compartir el link."
          }
        />
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-text-secondary">
          Mis atletas
        </h2>
        <span className="text-sm text-text-muted">
          {filteredAthletes.length}
          {filteredAthletes.length === 1 ? " atleta" : " atletas"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredAthletes.map((athlete) => (
          <AthleteCard key={athlete.id} athlete={athlete} />
        ))}
      </div>
    </section>
  );
};

export default AthleteGrid;
