"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Athlete } from "@/types/athleteType";

interface AthleteHeaderProps {
  /** Informacion completa del atleta para mostrar nombre. */
  athlete: Athlete;
}

/**
 * Encabezado fijo para la vista de detalles de un atleta.
 * Incluye boton de regreso y nombre del atleta.
 */
const AthleteHeader = ({ athlete }: AthleteHeaderProps) => {
  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle bg-bg-base/90 py-3 backdrop-blur-xl">
      <div className="app-container flex max-w-[1120px] items-center justify-between gap-4 pt-2">
        <div className="flex min-w-0 items-center">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-9 w-fit rounded-app-full px-0 text-text-secondary hover:bg-transparent hover:text-text-primary sm:px-3"
          >
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              Atletas
            </Link>
          </Button>
        </div>

        <div className="min-w-0 text-left md:text-center">
          <h1 className="truncate text-xl font-bold leading-tight text-text-primary md:text-2xl">
            {athlete.name}
          </h1>
        </div>

        <div className="hidden md:block" aria-hidden="true" />
      </div>
    </header>
  );
};

export default AthleteHeader;
