"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import SendWppRutine from "@/components/reusable/SendWppRutine";
import type { AthleteLite } from "@/types/athleteType";
import { ArrowUpRight, ClipboardList, Dumbbell, StickyNote } from "lucide-react";

interface AthleteCardProps {
  /** Información del atleta que se mostrará en el dashboard */
  athlete: AthleteLite;
}

/**
 * Tarjeta compacta con acciones rápidas para cada atleta en el dashboard.
 */
const AthleteCard = ({ athlete }: AthleteCardProps) => {
  const initials = athlete.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const hasNotes = athlete.notes?.trim().length > 0;
  const bodyWeight = Number(athlete.bodyWeight);
  const hasBodyWeight = Number.isFinite(bodyWeight) && bodyWeight > 0;
  const statusBadges = [
    athlete.repsTracked ? (
      <Badge key="reps" variant="success">
        <ClipboardList className="size-3" />
        Reps
      </Badge>
    ) : null,
    hasNotes ? (
      <Badge key="notes" variant="warning">
        <StickyNote className="size-3" />
        Notas
      </Badge>
    ) : null,
  ].filter(Boolean);

  return (
    <Card
      variant="interactive"
      className="group py-0 shadow-elevation-1"
    >
      <CardContent className="flex flex-col gap-4 p-4">
        
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-app-xl border border-purple-primary/25 bg-purple-primary/15 text-base font-bold text-purple-soft">
              {initials || "AT"}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-bold leading-tight text-text-primary">
                {athlete.name}
              </h3>
              <p className="mt-1 truncate text-sm text-text-secondary">
                {athlete.phone || athlete.email || "Sin contacto cargado"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-app-lg border border-border-subtle bg-bg-base/40 p-2 text-sm">
            <div>
              <p className="text-xs text-text-muted">Peso</p>
              <p className="mt-0.5 flex items-center gap-1.5 font-semibold text-text-primary">
                <Dumbbell className="size-3.5 text-purple-soft" />
                {hasBodyWeight ? `${bodyWeight.toFixed(1)} kg` : "Sin dato"}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Seguimiento</p>
              <p className="mt-0.5 font-semibold text-text-primary">
                {athlete.repsTracked ? "Activo" : "Basico"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex min-h-7 flex-wrap gap-2">
            {statusBadges.length > 0 ? (
              statusBadges
            ) : (
              <Badge variant="neutral">Sin alertas</Badge>
            )}
          </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Link href={`/dashboard/athlete/${athlete.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-full rounded-app-full sm:w-auto"
            >
              Detalle
              <ArrowUpRight className="size-4" />
            </Button>
          </Link>

          <SendWppRutine athlete={athlete} />
        </div>
      </CardContent>
    </Card>
  );
};

export default AthleteCard;
