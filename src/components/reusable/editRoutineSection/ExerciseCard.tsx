import React, { useState } from "react";
import {
  Exercise,
  NewExercise,
  NewRoutine,
  Routine,
} from "@/types/routineType";
import DialogExerciseCard from "./DialogExerciseCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { DeleteButton } from "../DeleteButton";

interface ExerciseCardProps {
  exercise: Exercise | NewExercise;
  indexExercise: number;
  indexDay: number;
  isNewRoutine: boolean;
  idAthlete: string;
  routine: Routine | NewRoutine;
  handleDeleteExercise: () => void;
}

const ExerciseCard = ({
  exercise,
  indexExercise,
  indexDay,
  isNewRoutine,
  idAthlete,
  routine,
  handleDeleteExercise,
}: ExerciseCardProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const lastSession =
    "exerciseHistory" in exercise && exercise.exerciseHistory.length > 0
      ? exercise.exerciseHistory[exercise.exerciseHistory.length - 1]
      : null;

  return (
    <div
      key={`${indexDay}-${indexExercise}`}
      className="p-3 border rounded-lg bg-muted/50"
    >
      <div className="flex items-center justify-between">
        <div className="w-full flex flex-col text-sm">
          <div className="flex items-center justify-between w-full text-base">
            {/* exercise name */}
            <h4 className="font-medium">{exercise.exercise}</h4>

            <div className="flex items-center gap-2">
              {/* delete button */}
              <DeleteButton label="ejercicio" handleDelete={handleDeleteExercise} />

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

          {/* Weights only if it is no a new routine */}
          { lastSession && lastSession.weight && (
              <p className=" text-muted-foreground">
                <span className="font-medium">peso actual:</span> {lastSession.weight + " kg"}
              </p>
            )}

          {/* reps only if history exists */}
          { lastSession && lastSession.sets && (
              <p className=" text-muted-foreground">
                <span className="font-medium">reps actuales:</span> {lastSession.sets.join(" - ")}
              </p>
            )}

          {/* Coach notes */}
          {exercise.coachNotes && (
            <p className="text-blue-400">
              <span className="font-medium">Nota del profe:</span>{" "}
              {exercise.coachNotes}
            </p>
          )}

          {/* Athlete notes only if it exists */}
          { "athleteNotes" in exercise && exercise.athleteNotes && (
              <p className="text-red-400">
                <span className="font-medium">Nota del atleta:</span>{" "}
                {exercise.athleteNotes}
              </p>
            )}
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
              idAthlete={idAthlete}
              exercise={exercise}
              indexExercise={indexExercise}
              indexDay={indexDay}
              isNewRoutine={isNewRoutine}
              setIsEditing={setIsEditing}
              routine={routine}
              closeDialog={() => setIsEditing(false)}
            />
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ExerciseCard;
