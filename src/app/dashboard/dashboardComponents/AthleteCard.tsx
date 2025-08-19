"use client";

import type React from "react";
import type { Athlete } from "@/types/athleteType";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AthleteCard({ athlete }: { athlete: Athlete }) {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-foreground flex-1">
          {athlete.name}
        </h3>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <Link href={`/dashboard/athlete/${athlete.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              Ver Detalle
            </Button>
          </Link>
          <Button size="sm" className="w-full">
            Enviar Rutina
          </Button>
        </div>
      </div>
    </div>
  );
}
