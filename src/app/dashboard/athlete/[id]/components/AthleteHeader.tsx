"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SendWppRutine from "@/components/reusable/SendWppRutine";
import type { Athlete } from "@/types/athleteType";

interface AthleteHeaderProps {
  /** Información completa del atleta para mostrar nombre y compartir rutina */
  athlete: Athlete;
}

/**
 * Encabezado fijo para la vista de detalles de un atleta.
 * Incluye botón de regreso y acción para compartir la rutina.
 */
const AthleteHeader = ({ athlete }: AthleteHeaderProps) => {
  return (
    <header className="border-b border-border bg-card p-3 shadow-sm">
      <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
        <div className="flex w-full items-center justify-between gap-4 md:w-auto">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>

          <h1 className="text-lg font-semibold text-foreground md:text-xl">
            {athlete.name}
          </h1>
        </div>

        <SendWppRutine athlete={athlete} />
      </div>
    </header>
  );
};

export default AthleteHeader;
