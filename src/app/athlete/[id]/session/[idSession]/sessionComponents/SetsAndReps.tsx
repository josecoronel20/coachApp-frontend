import React from "react";
import SetCard from "./SetCard";
import { TrainingSet } from "../types";

const SetsAndReps = ({ 
  sets, 
  exerciseIndex, 
  onSetUpdate 
}: { 
  sets: TrainingSet[]; 
  exerciseIndex: number;
  onSetUpdate: (exerciseIndex: number, setIndex: number, isDone: boolean, reps: number) => void;
}) => {
  return (
    <div className="space-y-2 w-full">
      <div className="grid grid-cols-3 items-center justify-between w-full">
        <h3 className="font-medium text-sm">Series</h3>
        <p className="font-medium text-sm text-center">Repeticiones</p>
      </div>
      {sets.map((set, index) => (
        <SetCard 
          key={`${exerciseIndex}-${index}`} 
          set={set} 
          index={index} 
          exerciseIndex={exerciseIndex}
          onSetUpdate={onSetUpdate}
        />
      ))}
    </div>
  );
};

export default SetsAndReps;
