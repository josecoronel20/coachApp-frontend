import React, { useState } from "react";
import { Exercise, Routine } from "@/types/routineType";
import DialogExerciseCard from "./DialogExerciseCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { DeleteButton } from "../DeleteButton";
import { updateRoutine } from "@/app/api/protected";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: Exercise;
  indexExercise: number;
  indexDay: number;
  routine: Routine;
  setRoutine: (routine: Routine) => void;
  athleteId: string;
  isNewRoutine: boolean;
}

const ExerciseCard = ({
  exercise,
  indexExercise,
  routine,
  setRoutine,
  indexDay,
  athleteId,
  isNewRoutine,
}: ExerciseCardProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const lastSession =
    exercise.exerciseHistory !== null && exercise.exerciseHistory.length > 0
      ? exercise.exerciseHistory[exercise.exerciseHistory.length - 1]
      : null;

  const handleDeleteExercise = async () => {
    if (!isNewRoutine) {
      const response = await updateRoutine(athleteId, routine);
      if (response.ok) {
        setRoutine(
          routine.map((day, dIdx) =>
            dIdx === indexDay
              ? day.filter((ex, eIdx) => eIdx !== indexExercise)
              : day
          )
        );
      }
    } else {
      setRoutine(
        routine.map((day, dIdx) =>
          dIdx === indexDay
            ? day.filter((ex, eIdx) => eIdx !== indexExercise)
            : day
        )
      );
    }
  };

  

  return (
    <div
      key={`${indexDay}-${indexExercise}`}
      className="p-3 border rounded-lg bg-muted/50 flex-1 cursor-move"
    >
      <div className="flex items-center justify-between">
        <div className="w-full flex flex-col text-sm">
          <div className="flex items-center justify-between w-full text-base">
            {/* exercise name */}
            <h4 className="font-medium">{exercise.exercise}</h4>

              <div className="flex items-center gap-2">
                {/* delete button */}
                <DeleteButton
                  label="ejercicio"
                  handleDelete={() => handleDeleteExercise()}
                />

                {/* edit button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground">
              <span className="font-medium">series:</span> {exercise.sets}
            </p>

            <p className="text-muted-foreground">
              <span className="font-medium">rango:</span> entre{" "}
              {exercise.rangeMin} y {exercise.rangeMax}
            </p>

            {/* Weights only if it has history */}
            {lastSession !== null && lastSession.weight && (
              <p className=" text-muted-foreground">
                <span className="font-medium">peso actual:</span>{" "}
                {lastSession.weight + " kg"}
              </p>
            )}

            {/* reps only if history exists */}
            {lastSession !== null && lastSession.sets && (
              <p className=" text-muted-foreground">
                <span className="font-medium">reps actuales:</span>{" "}
                {lastSession.sets.join(" - ")}
              </p>
            )}

            {/* Coach notes */}
            <p className="text-blue-400">
              <span className="font-medium">Nota del entrenador:</span>{" "}
              {exercise.coachNotes !== ""
                ? exercise.coachNotes
                : "Sin nota del entrenador"}
            </p>

            {/* Athlete notes only if it exists */}
            {exercise.athleteNotes !== "" && (
              <p className="text-red-400">
                <span className="font-medium">Nota del atleta:</span>{" "}
                {exercise.athleteNotes}
              </p>
            )}
          </div>
        </div>

        {/* dialog */}
        {isEditing && (
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>

            <DialogExerciseCard
              exercise={exercise}
              indexExercise={indexExercise}
              indexDay={indexDay}
              setIsEditing={setIsEditing}
              routine={routine}
              lastSession={lastSession}
              setRoutine={setRoutine}
              closeDialog={() => setIsEditing(false)}
              athleteId={athleteId}
              isNewRoutine={isNewRoutine}
            />
          </Dialog>
        )}
    </div>
  );
};

export default ExerciseCard;
