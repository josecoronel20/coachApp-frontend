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
import { Exercise, ExerciseHistory, Routine } from "@/types/routineType";
import { updateRoutine } from "@/app/api/protected";

interface DialogExerciseCardProps {
  exercise: Exercise | null;
  indexExercise: number | null;
  indexDay: number;
  lastSession: ExerciseHistory | null;
  routine: Routine;
  setRoutine: (routine: Routine) => void;
  setIsEditing: (isEditing: boolean) => void;
  closeDialog: () => void;
  athleteId: string;
  isNewRoutine: boolean;
}

const DialogExerciseCard = ({
  exercise,
  indexExercise,
  indexDay,
  routine,
  lastSession,
  setRoutine,
  closeDialog,
  setIsEditing,
  athleteId,
  isNewRoutine,
}: DialogExerciseCardProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [messageError, setMessageError] = useState("");

  const onSubmit = async (data: FieldValues) => {
    const exerciseUpdate: Exercise = {
      exercise: data.exercise,
      sets: data.sets,
      rangeMin: data.rangeMin,
      rangeMax: data.rangeMax,
      coachNotes: data.coachNotes,
      athleteNotes: exercise?.athleteNotes || "",
      exerciseHistory: exercise?.exerciseHistory || null, // Preservar el historial existente
    };

    let newRoutine: Routine;

    //si es un nuevo ejercicio se agrega al final del dia
    if (indexExercise === null) {
      newRoutine = routine.map((day, dIdx) =>
        dIdx === indexDay ? [...day, exerciseUpdate] : day
      );
    } else {
      //si es un ejercicio existente se actualiza en el indice indicado
      newRoutine = routine.map((day, dIdx) =>
        dIdx === indexDay
          ? day.map((ex, eIdx) =>
              eIdx === indexExercise ? exerciseUpdate : ex
            )
          : day
      );
    }

    // Actualizar en la base de datos primero si no es una rutina nueva
    if (!isNewRoutine) {
      try {
        const response = await updateRoutine(athleteId, newRoutine);
        if (!response.ok) {
          // Si falla, no actualizar el estado y mostrar error
          setMessageError("Error al guardar el ejercicio");
          return;
        }
        // Si es exitoso, actualizar el estado local
        setRoutine(newRoutine);
      } catch (error) {
        // Si falla, no actualizar el estado y mostrar error
        console.error("Error al actualizar la rutina:", error);
        setMessageError("Error al guardar el ejercicio");
        return;
      }
    } else {
      // Si es rutina nueva, solo actualizar el estado local
      setRoutine(newRoutine);
    }

    // Cerrar el diálogo solo después de actualizar exitosamente
    setIsEditing(false);
    closeDialog();
  };

  const handleAthleteNote = () => {
    setRoutine(
      routine.map((day, dIdx) =>
        dIdx === indexDay
          ? day.map((ex, eIdx) =>
              eIdx === indexExercise
                ? { ...ex, athleteNotes: ex.athleteNotes }
                : ex
            )
          : day
      )
    );
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
          {exercise ? "Editar ejercicio" : "Agregar nuevo ejercicio"}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Exercise name */}
        <div>
          <label className="text-sm font-medium">Ejercicio</label>
          <Input
            defaultValue={exercise?.exercise}
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
              defaultValue={exercise?.sets}
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
                defaultValue={exercise?.rangeMin}
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
                defaultValue={exercise?.rangeMax}
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
        {exercise && (
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
            defaultValue={exercise?.coachNotes || ""}
            className="text-sm min-h-[60px]"
            {...register("coachNotes")}
            placeholder="Agregar notas o instrucciones especiales..."
          />
        </div>

        {exercise && (
          <div>
            <p className="text-sm font-medium">Nota del atleta</p>
            {exercise?.athleteNotes !== "" ? (
              <div className="text-sm text-red-400 border border-red-400 rounded-md p-2 flex justify-between items-center">
                <p>{exercise?.athleteNotes}</p>
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
          <Button
            type="submit"
            className="h-8 text-sm"
          >
            <Save className="h-4 w-4 mr-1" />
            {indexExercise === null ? "Agregar" : "Guardar"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default DialogExerciseCard;
