import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import React from "react";
import { TrainingSet } from "../types";

const SetCard = ({ 
  set, 
  index, 
  exerciseIndex, 
  onSetUpdate 
}: { 
  set: TrainingSet; 
  index: number; 
  exerciseIndex: number;
  onSetUpdate: (exerciseIndex: number, setIndex: number, isDone: boolean, reps: number) => void;
}) => {
  const handleSetDone = (isDone: boolean) => {
    onSetUpdate(exerciseIndex, index, isDone, set.reps);
  };

  const handleRepsChange = (reps: number) => {
    onSetUpdate(exerciseIndex, index, set.isDone, reps);
  };

  return (
    <div
      key={index}
      className={`flex items-center justify-between p-2 rounded-lg border 
                  ${set.isDone ? "bg-foreground/5" : "bg-background"}
                  `}
    >
      <span className="font-medium min-w-[50px] text-sm">Set {index + 1}</span>

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleRepsChange(set.reps - 1)}
            disabled={set.isDone}
          >
            <Minus />
          </Button>
          {set.reps || 0}
          <Button
            variant="outline"
            onClick={() => handleRepsChange(set.reps + 1)}
            disabled={set.isDone}
          >
            <Plus />
          </Button>
        </div>
      </div>

      <Button
        size="sm"
        onClick={() => handleSetDone(!set.isDone)}
        variant={set.isDone ? "secondary" : "default"}
        className="h-9 px-3"
      >
        {set.isDone ? "✓" : "OK"}
      </Button>
    </div>
  );
};

export default SetCard;
