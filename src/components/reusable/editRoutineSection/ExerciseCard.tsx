import React, { useState } from "react";
import { Exercise } from "@/types/routineType";
import DialogExerciseCard from "./DialogExerciseCard";

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  selectedDay: number;
  isNewRoutine: boolean;
}

const ExerciseCard = ({
  exercise,
  index,
  selectedDay,
  isNewRoutine,
}: ExerciseCardProps) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div key={index} className="p-3 border rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{exercise.exercise}</h4>
          <div>
            <p className="text-sm text-muted-foreground">
              {exercise.sets.length} series | Rango: {exercise.range[0]}-
              {exercise.range[1]} reps
            </p>
            {!isNewRoutine && "weight" in exercise && exercise.weight && (
              <p className="text-sm text-muted-foreground">
                Peso actual: {exercise.weight}kg
              </p>
            )}
            {!isNewRoutine &&
              "exerciseHistory" in exercise &&
              exercise.exerciseHistory &&
              exercise.exerciseHistory.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  reps actuales: {exercise.exerciseHistory[0].sets.join(" - ")}
                </p>
              )}
          </div>
          {exercise.coachNotes && (
            <p className="text-xs text-blue-600">
              Nota del profe: {exercise.coachNotes}
            </p>
          )}
          {!isNewRoutine &&
            "athleteNotes" in exercise &&
            exercise.athleteNotes && (
              <p className="text-xs text-red-600">
                Nota del atleta: {exercise.athleteNotes}
              </p>
            )}
        </div>

        {/* dialog */}
        {isEditing && (
          <DialogExerciseCard
            exercise={exercise}
            index={index}
            selectedDay={selectedDay}
            isNewRoutine={isNewRoutine}
          />
        )}
      </div>
    </div>
  );
};

export default ExerciseCard;
