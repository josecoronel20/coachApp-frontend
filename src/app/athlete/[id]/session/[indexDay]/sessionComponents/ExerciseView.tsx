"use client";

import { useState } from "react";
import SetCard from "./SetCard";
import { SessionExercise } from "@/store/useAthleteSessionStore";
import ExerciseWeight from "./ExerciseWeight";
import AthleteNotes from "./AthleteNotes";

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
  const [repsTracked] = useState<boolean>(false);

  const handleSetReps = (setIndex: number, newReps: number) => {
    onSetReps(setIndex, newReps);
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

      

      <div className="grid grid-cols-2 items-center gap-2">
        {/* Información de última sesión (solo referencia visual) */}
        {exerciseDefinition.lastHistory && (
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
          <span className="font-medium text-foreground">Nota del entrenador:</span>{" "}
          {exerciseDefinition.coachNotes}
        </p>
      )}

      {/* Sets y reps */}
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

                 <AthleteNotes 
           notes={exerciseDefinition.athleteNotes} 
           onNotesChange={onSetAthleteNotes}
         />
      </div>
    </div>
  );
};

export default ExerciseView;
