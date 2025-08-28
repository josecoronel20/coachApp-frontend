import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAthleteStore } from "@/store/useAthleteStore";

const SetCard = ({
  reps,
  indexRep,
  indexExercise,
  minReps,
  maxReps,
}: {
  reps: number;
  indexRep: number;
  indexExercise: number;
  minReps: number;
  maxReps: number;
}) => {
  const [currentReps, setCurrentReps] = useState(reps);
  const { infoCurrentSession, setInfoCurrentSession } = useAthleteStore();

  useEffect(() => {
    setInfoCurrentSession(indexExercise, {
      ...infoCurrentSession[indexExercise],
      sets: infoCurrentSession[indexExercise].sets.map((set, i) => i === indexRep ? currentReps : set),
    });
    console.log("infoCurrentSession", infoCurrentSession);
  }, [currentReps]);

  const handlePlusReps = () => {
    if (currentReps < maxReps) {
      setCurrentReps(currentReps + 1);
    }
  };

  const handleMinusReps = () => {
    if (currentReps > minReps) {
      setCurrentReps(currentReps - 1);
    }
  };

  return (
    <div
      key={indexRep}
      className={`flex items-center justify-between p-2 rounded-lg border bg-background
                  ${currentReps === maxReps && "border-green-300"}
                  `}
    >
      <span className="font-medium min-w-[50px] text-sm">
        Serie {indexRep + 1}
      </span>

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleMinusReps}>
            <Minus />
          </Button>
          {currentReps || 0}
          <Button variant="outline" onClick={handlePlusReps}>
            <Plus />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SetCard;
