"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import SendWppRutine from "@/components/reusable/SendWppRutine";
import type { Athlete } from "@/types/athleteType";

interface AthleteCardProps {
  /** Información del atleta que se mostrará en el dashboard */
  athlete: Athlete;
}

/**
 * Tarjeta compacta con acciones rápidas para cada atleta en el dashboard.
 */
const AthleteCard = ({ athlete }: AthleteCardProps) => {
  return (
    <article className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
      <header className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-foreground flex-1">
          {athlete.name}
        </h3>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <Link href={`/dashboard/athlete/${athlete.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              Ver detalle
            </Button>
          </Link>

          <SendWppRutine athlete={athlete} />
        </div>
      </header>
    </article>
  );
};

export default AthleteCard;
