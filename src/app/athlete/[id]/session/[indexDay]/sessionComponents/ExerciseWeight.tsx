import { Button } from "@/components/ui/button";
import { Minus } from "lucide-react";
import { Plus } from "lucide-react";
import React, { useState } from "react";

interface ExerciseWeightProps {
  weight: number;
}

const ExerciseWeight = ({weight}: ExerciseWeightProps) => {
  const [weightInput, setWeightInput] = useState(weight);

  return (
    <div className="w-full flex flex-col gap-2">
      <p className="text-sm text-muted-foreground  text-center">Peso actual</p>
      <div className="flex items-center gap-2 justify-around">
        <Button
          variant="outline"
          onClick={() => setWeightInput(weightInput - 2.5)}
        >
          <Minus />
        </Button>
        <span>{weightInput} kg</span>
        <Button
          variant="outline"
          onClick={() => setWeightInput(weightInput + 2.5)}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
};

export default ExerciseWeight;
