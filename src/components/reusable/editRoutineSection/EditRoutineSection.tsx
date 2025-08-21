import { Routine, NewRoutine, Exercise } from "@/types/routineType";
import React, { useState } from "react";
import { Button } from "../../ui/button";

import ExerciseCard from "./ExerciseCard";

const EditRoutineSection = ({
  routine,
  isNewRoutine,
}: {
  routine: NewRoutine | Routine;
  isNewRoutine: boolean;
}) => {
  const [selectedDay, setSelectedDay] = useState(0);

  return (
    <div className="space-y-4">
      {/* Selector de días */}
      <div className="flex gap-2 flex-wrap">
        {routine.map((day, index) => (
          <Button
            key={index}
            variant={selectedDay === index ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDay(index)}
          >
            Día {index + 1}
          </Button>
        ))}
      </div>

      {/* Lista de ejercicios del día seleccionado */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Ejercicios - Día {selectedDay + 1}
        </label>
        <div className="space-y-2">
          {routine[selectedDay]?.map((exercise, index) => (
            <ExerciseCard
              key={index}
              exercise={exercise}
              index={index}
              selectedDay={selectedDay}
              isNewRoutine={isNewRoutine}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditRoutineSection;
