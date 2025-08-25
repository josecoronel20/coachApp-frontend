import { useForm, FieldValues } from "react-hook-form";
import { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, Save } from "lucide-react";
import { updateRoutine } from "@/app/api/protected";
import { useGetAllAthletes } from "@/hooks/useGetAllAthletes";
import { useGetAthleteInfo } from "@/hooks/useGetAthleteInfo";
import {
  Exercise,
  NewExercise,
  Routine,
  NewRoutine,
} from "@/types/routineType";

interface DialogExerciseCardProps {
  idAthlete: string;
  exercise: Exercise | NewExercise;
  isNewRoutine: boolean;
  indexExercise: number;
  indexDay: number;
  setIsEditing: (isEditing: boolean) => void;
  routine: Routine | NewRoutine;
  closeDialog: () => void;
  isAddingNew?: boolean; // New prop to indicate if we're adding a new exercise
}

const DialogExerciseCard = ({
  idAthlete,
  exercise,
  isNewRoutine,
  indexExercise,
  indexDay,
  routine,
  closeDialog,
  setIsEditing,
  isAddingNew = false,
}: DialogExerciseCardProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [messageError, setMessageError] = useState("");
  const { mutate: mutateAllAthletes } = useGetAllAthletes();
  const { mutate: mutateCurrentAthlete } = useGetAthleteInfo(idAthlete);
  const [routineUpdate, setRoutineUpdate] = useState<Routine | NewRoutine>(
    routine
  );
  const [athleteNote, setAthleteNote] = useState(
    "athleteNotes" in exercise ? exercise.athleteNotes : ""
  );

  const lastSession =
    "exerciseHistory" in exercise
      ? exercise.exerciseHistory[exercise.exerciseHistory.length - 1]
      : null;

  const handleAthleteNote = () => {
    setAthleteNote("");
    const exerciseUpdateWithCurrentAthleteNote = {
      ...exercise,
      athleteNotes: "",
    };
    setRoutineUpdate(
      routineUpdate.map((day, dIdx) =>
        dIdx === indexDay
          ? day.map((ex, eIdx) =>
              eIdx === indexExercise
                ? { ...ex, ...exerciseUpdateWithCurrentAthleteNote }
                : ex
            )
          : day
      )
    );
  };

  const onSubmit = async (data: FieldValues) => {
    const newExerciseData = {
      ...data,
      exercise: data.exercise.trim(),
      sets: Number(data.sets),
      rangeMin: Number(data.rangeMin),
      rangeMax: Number(data.rangeMax),
      coachNotes: data.coachNotes?.trim() || null,
    };

    if (isAddingNew) {
      // Add new exercise to the end of the current day
      setRoutineUpdate(
        routine.map((day, dIdx) =>
          dIdx === indexDay ? [...day, newExerciseData] : day
        )
      );
    } else {
      // Update existing exercise
      setRoutineUpdate(
        routineUpdate.map((day, dIdx) =>
          dIdx === indexDay
            ? day.map((ex, eIdx) =>
                eIdx === indexExercise ? { ...ex, ...newExerciseData } : ex
              )
            : day
        )
      );
    }

    const response = await updateRoutine(idAthlete, routineUpdate as Routine);
    console.log("routineUpdate", routineUpdate);
    if (response.status === 200) {
      console.log(newExerciseData);
      console.log("rutina actualizada con éxito", routineUpdate);
      mutateAllAthletes();
      mutateCurrentAthlete();
      closeDialog();
    } else {
      const data = await response.json();
      setMessageError(data.message);
    }
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto p-4">
      {messageError && (
        <div className="text-red-500 text-sm text-center mb-2">
          {messageError}
        </div>
      )}

      <DialogHeader>
        <DialogTitle className="text-base">
          {isAddingNew ? "Agregar nuevo ejercicio" : "Editar ejercicio"}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Exercise name */}
        <div>
          <label className="text-sm font-medium">Ejercicio</label>
          <Input
            defaultValue={exercise.exercise}
            type="text"
            className={`h-8 text-sm ${errors.exercise ? "border-red-500" : ""}`}
            {...register("exercise", { required: true })}
            placeholder="Nombre del ejercicio"
          />
        </div>

        {/* Range and sets */}
        <div className="flex gap-7">
          <div>
            <label className="text-sm font-medium">Series</label>
            <Input
              defaultValue={exercise.sets}
              type="number"
              className={`h-8 w-14 text-sm text-center ${
                errors.sets ? "border-red-500" : ""
              }`}
              {...register("sets", { required: true })}
              placeholder="3"
              min="1"
            />
          </div>
          <div className="w-full">
            <label className="text-sm font-medium">Rango de repeticiones</label>
            <div className="flex justify-between items-center text-sm w-full">
              <span>Entre</span>
              <Input
                defaultValue={exercise.rangeMin}
                type="number"
                className={`h-8 w-14 text-sm text-center ${
                  errors.rangeMin ? "border-red-500" : ""
                }`}
                {...register("rangeMin", { required: true })}
                placeholder="8"
                min="1"
              />
              <span>y</span>
              <Input
                defaultValue={exercise.rangeMax}
                type="number"
                className={`h-8 w-14 text-sm text-center ${
                  errors.rangeMax ? "border-red-500" : ""
                }`}
                {...register("rangeMax", { required: true })}
                placeholder="12"
                min="1"
              />
              <span>reps</span>
            </div>
          </div>
        </div>

        {/* Weight and reps*/}
        {!isNewRoutine && (
          <div className="flex flex-col">
            <p className="text-sm font-medium">
              Info editable solo por el atleta
            </p>
            <div className="flex justify-between items-center gap-2 text-sm text-muted-foreground border rounded-md p-2">
              <p>
                último peso:{" "}
                {lastSession && lastSession.weight !== 0
                  ? lastSession.weight + " kg"
                  : "Aún sin registrar peso"}
              </p>
              <p>
                últimas reps:{" "}
                {lastSession && lastSession.sets.length > 0
                  ? lastSession.sets.join("-")
                  : "Aún sin registrar reps"}
              </p>
            </div>
          </div>
        )}

        {/* Coach notes */}
        <div>
          <label className="text-sm font-medium">Nota del entrenador</label>
          <Textarea
            defaultValue={exercise.coachNotes || ""}
            className="text-sm min-h-[60px]"
            {...register("coachNotes")}
            placeholder="Agregar notas o instrucciones especiales..."
          />
        </div>

        {!isNewRoutine && (
          <div>
            <p className="text-sm font-medium">Nota del atleta</p>
            {athleteNote !== "" ? (
              <div className="text-sm text-red-400 border border-red-400 rounded-md p-2 flex justify-between items-center">
                <p>{athleteNote}</p>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={handleAthleteNote}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground border rounded-md p-2 flex justify-between items-center">
                <p>Sin notas por corregir</p>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            type="button"
            className="h-8 text-sm"
            onClick={() => closeDialog()}
          >
            Cancelar
          </Button>
          <Button type="submit" className="h-8 text-sm">
            <Save className="h-4 w-4 mr-1" />
            {isAddingNew ? "Agregar" : "Guardar"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default DialogExerciseCard;
