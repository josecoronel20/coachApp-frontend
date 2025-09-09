"use client";

import { useState } from "react";
import SetCard from "./SetCard";
import { SessionExercise } from "@/store/useAthleteSessionStore";
import ExerciseWeight from "./ExerciseWeight";
import AthleteNotes from "./AthleteNotes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateRepsTracked } from "@/app/api/athlete";
import { useAthleteStore } from "@/store/useAthleteStore";
import { useParams } from "next/navigation";

interface ExerciseDefinition {
  name: string;
  setsCount: number;
  rangeMin?: number;
  rangeMax?: number;
  coachNotes?: string;
  athleteNotes?: string;
  weight?: number;
  lastHistory?: {
    weight: number;
    sets: number[];
  };
}

interface ExerciseViewProps {
  exerciseIndex: number;
  exerciseDefinition: ExerciseDefinition;
  sessionExercise: SessionExercise;
  onSetReps: (setIndex: number, reps: number) => void;
  onSetWeight: (weight: number) => void;
  onSetAthleteNotes: (notes: string) => void;
}

/**
 * Componente que renderiza la vista de un ejercicio individual
 * Maneja la edición de peso y reps para cada set
 */
const ExerciseView = ({
  exerciseDefinition,
  sessionExercise,
  onSetReps,
  onSetWeight,
  onSetAthleteNotes,
}: ExerciseViewProps) => {
  const { athlete } = useAthleteStore();
  const [repsTracked, setRepsTracked] = useState<boolean>(
    athlete?.repsTracked || false
  );
  const idFromParams = useParams().id as string;

  const handleSetReps = (setIndex: number, newReps: number) => {
    onSetReps(setIndex, newReps);
  };

  const handleSetRepsTracked = async () => {
    const response = await updateRepsTracked(idFromParams, !repsTracked);
    if (response.status === 200) {
      setRepsTracked(!repsTracked);
    }
  };

  const recommendations = [
    `Tu objetivo es mantenerte entre ${exerciseDefinition.rangeMin} y ${exerciseDefinition.rangeMax} repeticiones; si no alcanzás el mínimo reducí el peso, y si superás el máximo aumentalo, siempre priorizando la técnica.`,
    `Cada semana anotá las repeticiones que logres en cada serie con el peso actual. El objetivo es ir sumando repeticiones progresivamente en todas las series hasta llegar a ${exerciseDefinition.rangeMax} reps. Cuando alcances ese número, aumentá el peso y volvés a trabajar desde ${exerciseDefinition.rangeMin} reps.`,
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Título del ejercicio */}

      <div className="flex justify-between items-center gap-2">
        <h1 className="text-2xl text-center font-bold text-foreground">
          {exerciseDefinition.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {exerciseDefinition.setsCount} series de {exerciseDefinition.rangeMin}{" "}
          a {exerciseDefinition.rangeMax} reps
        </p>
      </div>

      <details className="w-full flex flex-col bg-muted rounded-lg p-2">
        <summary className="text-sm text-foreground">
          Como progresar en el ejercicio?
        </summary>
        <p className="text-sm text-muted-foreground">
          {repsTracked ? recommendations[1] : recommendations[0]}
        </p>
      </details>

      <div className={`${repsTracked ? "grid grid-cols-2 items-center gap-2" : "grid grid-cols-1 items-center gap-2"}`}>
        {/* Información de última sesión (solo referencia visual) */}
        {exerciseDefinition.lastHistory && repsTracked && (
          <div className=" p-4 bg-muted rounded-lg col-span-1">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Última sesión (referencia)
            </h4>
            <div className="flex flex-col text-sm text-muted-foreground">
              <p>
                Peso:{" "}
                <span className="font-semibold text-foreground">
                  {exerciseDefinition.lastHistory.weight} kg
                </span>
              </p>

              <p>
                Reps:{" "}
                <span className="font-semibold text-foreground">
                  {exerciseDefinition.lastHistory.sets.join(" - ")}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Campo de peso */}
        <ExerciseWeight weight={exerciseDefinition.weight || 0} />
      </div>

      {exerciseDefinition.coachNotes && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            Nota del entrenador:
          </span>{" "}
          {exerciseDefinition.coachNotes}
        </p>
      )}

      {/* Toggle para modo de registro */}
      <div className="flex items-center gap-3 p-2 rounded-lg border bg-muted">
        <Switch
          id="repsTracked"
          checked={repsTracked}
          onCheckedChange={handleSetRepsTracked}
          className="data-[state=checked]:bg-green-500"
        />
        <Label
          htmlFor="repsTracked"
          className="cursor-pointer text-sm font-medium"
        >
          {repsTracked
            ? "Modo detallado (anotar todas las series)"
            : "Modo simple (rango de repeticiones)"}
        </Label>
      </div>

      {/* Sets y reps */}
      {repsTracked ? (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Series y Repeticiones</h3>
          <div className="space-y-2">
            {sessionExercise.sets.map((reps, setIndex) => (
              <SetCard
                key={setIndex}
                value={reps}
                onInc={() => handleSetReps(setIndex, reps + 1)}
                onDec={() => handleSetReps(setIndex, reps - 1)}
                min={exerciseDefinition.rangeMin || 0}
                max={exerciseDefinition.rangeMax || 20}
                label={`Serie ${setIndex + 1}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">
            Intentá realizar entre {exerciseDefinition.rangeMin} y{" "}
            {exerciseDefinition.rangeMax} repeticiones cada serie
          </h3>
        </div>
      )}

      <AthleteNotes
        notes={exerciseDefinition.athleteNotes}
        onNotesChange={onSetAthleteNotes}
      />
    </div>
  );
};

export default ExerciseView;
