"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Calendar } from "lucide-react";
import EditRoutineSection from "@/components/reusable/editRoutineSection/EditRoutineSection";
import type { ExerciseHistory, Routine } from "@/types/routineType";
import { normalizeRoutine } from "@/lib/routineExercise";

interface RoutineEditorCardProps {
  athleteId: string;
  initialRoutine: Routine;
  latestHistoryByExerciseId?: Map<string, ExerciseHistory>;
}

const isRoutineEmpty = (routine: Routine) =>
  routine.length === 0 ||
  routine.every((day) => day.length === 0);

/**
 * Card contenedor para editar la rutina del atleta.
 */
const RoutineEditorCard = ({
  athleteId,
  initialRoutine,
  latestHistoryByExerciseId,
}: RoutineEditorCardProps) => {
  const [routine, setRoutine] = useState<Routine>(() =>
    normalizeRoutine(initialRoutine)
  );

  // ⚠️ NO sincronizar desde initialRoutine en cada revalidación de SWR.
  //
  // El componente se desmonta cuando el coach cambia de pestaña
  // ({activeTab === "routine" ? <RoutineEditorCard /> : null}), por lo que
  // useState() ya captura los datos frescos al montar.
  //
  // Agregar useEffect([initialRoutine]) causaba una race condition:
  // SWR revalidaba en background → nueva referencia de athlete.routine →
  // efecto pisaba la rutina local → coach hacía otra acción → updateRoutine
  // se llamaba con datos stale → backend borraba los días/ejercicios que
  // no estaban en ese payload.
  //
  // La única fuente de verdad del estado local es la respuesta de updateRoutine
  // (setRoutine(body.routine)), no las revalidaciones de SWR.

  const showEmptyHint = isRoutineEmpty(routine);

  return (
    <Card variant="elevated" className="rounded-app-2xl py-0">
      <CardHeader className="space-y-2 px-4 pb-3 pt-4 sm:px-5">
        <CardTitle className="flex items-center gap-3 text-base text-text-primary sm:text-lg">
          <span className="flex size-9 items-center justify-center rounded-app-xl border border-purple-primary/25 bg-purple-primary/15 text-purple-soft">
            <Calendar className="size-5" />
          </span>
          Rutina de entrenamiento
        </CardTitle>
        <p className="text-sm text-text-secondary">
          Selecciona un dia para revisar o editar los ejercicios asignados.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-5 sm:px-5">
        {showEmptyHint ? (
          <EmptyState
            title="Todavia no hay rutina guardada"
            description="Agrega el primer dia de entrenamiento para que el atleta pueda entrenar desde su link."
            className="py-8"
          />
        ) : null}
        <EditRoutineSection
          routine={routine}
          setRoutine={setRoutine}
          athleteId={athleteId}
          isNewRoutine={false}
          latestHistoryByExerciseId={latestHistoryByExerciseId}
        />
      </CardContent>
    </Card>
  );
};

export default RoutineEditorCard;
