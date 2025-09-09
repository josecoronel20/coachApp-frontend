import { Button } from "@/components/ui/button";
import { Minus } from "lucide-react";
import { Plus } from "lucide-react";
import React, { useState, useEffect } from "react";

interface ExerciseWeightProps {
  weight: number;
  onWeightChange: (weight: number) => void;
}

const ExerciseWeight = ({ weight, onWeightChange }: ExerciseWeightProps) => {
  const [weightInput, setWeightInput] = useState(weight);

  // Actualizar el estado local cuando cambie el prop weight
  useEffect(() => {
    setWeightInput(weight);
  }, [weight]);

  const handleWeightChange = (newWeight: number) => {
    setWeightInput(newWeight);
    onWeightChange(newWeight);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <p className="text-sm text-muted-foreground text-center">Peso actual</p>
      <div className="flex items-center gap-2 justify-around">
        <Button
          variant="outline"
          onClick={() => handleWeightChange(weightInput - 2.5)}
        >
          <Minus />
        </Button>
        <span>{weightInput} kg</span>
        <Button
          variant="outline"
          onClick={() => handleWeightChange(weightInput + 2.5)}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
};

export default ExerciseWeight;
