"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import EditRoutineSection from "@/components/reusable/editRoutineSection/EditRoutineSection";
import type { Routine } from "@/types/routineType";

interface RoutineEditorCardProps {
  athleteId: string;
  initialRoutine: Routine;
}

/**
 * Card contenedor para editar la rutina del atleta.
 */
const RoutineEditorCard = ({ athleteId, initialRoutine }: RoutineEditorCardProps) => {
  const [routine, setRoutine] = useState<Routine>(initialRoutine);

  useEffect(() => {
    setRoutine(initialRoutine);
  }, [initialRoutine]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-5 w-5" /> Rutina de entrenamiento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EditRoutineSection
          routine={routine}
          setRoutine={setRoutine}
          athleteId={athleteId}
          isNewRoutine={false}
        />
      </CardContent>
    </Card>
  );
};

export default RoutineEditorCard;
