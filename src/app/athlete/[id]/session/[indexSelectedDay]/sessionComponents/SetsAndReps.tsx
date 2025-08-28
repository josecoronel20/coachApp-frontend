import React from "react";
import SetCard from "./SetCard";
import { ExerciseHistory } from "@/types/routineType";

const SetsAndReps = ({ 
  minReps,
  maxReps,
  infoCurrentExercise,
  indexExercise,
}: { 
  minReps: number;
  maxReps: number;
  infoCurrentExercise: ExerciseHistory;
  indexExercise: number;
}) => {

  return (
    <div className="space-y-2 w-full">
      <div className="grid grid-cols-3 items-center justify-between w-full">
        <h3 className="font-medium text-sm">Series</h3>
        <p className="font-medium text-sm text-center">Repeticiones</p>
      </div>
      {infoCurrentExercise?.sets.map((reps, index) => (
        <SetCard 
          key={`${index}`} 
          reps={reps} 
          indexRep={index} 
          indexExercise={indexExercise}
          minReps={minReps}
          maxReps={maxReps}
        />
      ))}
    </div>
  );
};

export default SetsAndReps;
