"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SetCard from "./SetCard";
import { SessionExercise } from "@/store/useAthleteSessionStore";

interface ExerciseDefinition {
  name: string;
  setsCount: number;
  rangeMin?: number;
  rangeMax?: number;
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
}

/**
 * Componente que renderiza la vista de un ejercicio individual
 * Maneja la edición de peso y reps para cada set
 */
const ExerciseView = ({
  exerciseIndex,
  exerciseDefinition,
  sessionExercise,
  onSetReps,
  onSetWeight,
}: ExerciseViewProps) => {
  const [weightInput, setWeightInput] = useState(sessionExercise.weight.toString());

  const handleWeightChange = (value: string) => {
    setWeightInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onSetWeight(numValue);
    }
  };

  const handleSetReps = (setIndex: number, newReps: number) => {
    onSetReps(setIndex, newReps);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Título del ejercicio */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {exerciseDefinition.name}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Ejercicio {exerciseIndex + 1} • {exerciseDefinition.setsCount} series
        </p>
      </div>

      {/* Campo de peso */}
      <div className="space-y-2">
        <Label htmlFor="weight" className="text-sm font-medium">
          Peso (kg)
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="weight"
            type="number"
            value={weightInput}
            onChange={(e) => handleWeightChange(e.target.value)}
            className="w-24"
            min="0"
            step="0.5"
          />
          <span className="text-sm text-gray-500">kg</span>
        </div>
      </div>

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
      </div>

      {/* Información de última sesión (solo referencia visual) */}
      {exerciseDefinition.lastHistory && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Última sesión (referencia)
          </h4>
          <div className="text-sm text-gray-600">
            <p>Peso: {exerciseDefinition.lastHistory.weight} kg</p>
            <p>Reps: {exerciseDefinition.lastHistory.sets.join(", ")}</p>
          </div>
        </div>
      )}

      {/* Información de rango objetivo */}
      {exerciseDefinition.rangeMin && exerciseDefinition.rangeMax && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Objetivo:</strong> {exerciseDefinition.rangeMin}-{exerciseDefinition.rangeMax} reps por serie
          </p>
        </div>
      )}
    </div>
  );
};

export default ExerciseView;
