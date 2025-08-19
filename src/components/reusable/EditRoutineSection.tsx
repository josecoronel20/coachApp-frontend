import { Routine, NewRoutine } from "@/types/routineType";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import AthleteNotesEdit from "./AthleteNotesEdit";

const EditRoutineSection = ({
  routine,
  isNewRoutine,
}: {
  routine: NewRoutine | Routine;
  isNewRoutine: boolean;
}) => {
  const [selectedDay, setSelectedDay] = useState(0);
  console.log(routine);

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
            <div key={index} className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{exercise.exercise}</h4>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {exercise.sets.length} series | Rango: {exercise.range[0]}
                      -{exercise.range[1]} reps
                    </p>
                    {!isNewRoutine &&
                      "weight" in exercise &&
                      exercise.weight && (
                        <p className="text-sm text-muted-foreground">
                          Peso actual: {exercise.weight}kg
                        </p>
                      )}

                    {!isNewRoutine &&
                      "exerciseHistory" in exercise &&
                      exercise.exerciseHistory &&
                      exercise.exerciseHistory.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          reps actuales:{" "}
                          {exercise.exerciseHistory[0].sets.join(" - ")}
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

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Editar Ejercicio {exercise.exercise}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                      <div className="grid grid-cols-4 gap-2">
                        <div className="space-y-2 col-span-3">
                          <label className="text-sm font-medium">
                            Nombre del ejercicio
                          </label>
                          <Input type="text" defaultValue={exercise.exercise} />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Series</label>
                          <Input
                            type="number"
                            defaultValue={exercise.sets.length || 0}
                            placeholder="Ej: 8"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Rango de repeticiones
                        </label>

                        <div className="flex gap-2 items-center">
                          <p>Entre</p>
                          <Input
                            type="number"
                            defaultValue={exercise.range[0]}
                            placeholder="ej: 8"
                          />
                          <p>y</p>
                          <Input
                            type="number"
                            defaultValue={exercise.range[1]}
                            placeholder="ej: 10"
                          />
                          <p>repeticiones</p>
                        </div>
                      </div>

                      {/* values that can be modified onlyby the athlete */}
                      {!isNewRoutine &&
                        "exerciseHistory" in exercise &&
                        exercise.exerciseHistory &&
                        exercise.exerciseHistory.length > 0 && (
                          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <p>Datos modificables por el atleta:</p>
                            <div className="flex justify-between">
                              <p>
                                peso actual:{" "}
                                {exercise.exerciseHistory[0].weight}kg
                              </p>
                              <p>
                                reps en cada serie:{" "}
                                {exercise.exerciseHistory[0].sets.join("-")}
                              </p>
                            </div>
                          </div>
                        )}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Nota del entrenador
                        </label>
                        <Input
                          type="text"
                          defaultValue={exercise.coachNotes || ""}
                        />
                      </div>
                    </div>

                    {/* athlete notes*/}
                    {!isNewRoutine &&
                      "athleteNotes" in exercise &&
                      exercise.athleteNotes && (
                        <AthleteNotesEdit notes={exercise.athleteNotes} />
                      )}

                    {/* save button */}
                    <div className="flex justify-end">
                      <Button type="submit">Guardar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditRoutineSection;
