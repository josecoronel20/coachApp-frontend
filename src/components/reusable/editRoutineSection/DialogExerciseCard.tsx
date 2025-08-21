import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Edit, Save } from "lucide-react";
import { Input } from "../../ui/input";
import AthleteNotesEdit from "../editRoutineSection/AthleteNotesEdit";
import { Exercise } from "@/types/routineType";

interface DialogExerciseCardProps {
  exercise: Exercise;
  index: number;
  selectedDay: number;
  editingExercise: {
    dayIndex: number;
    exerciseIndex: number;
    data: Exercise;
  } | null;
  setEditingExercise: (
    exercise: {
      dayIndex: number;
      exerciseIndex: number;
      data: Exercise;
    } | null
  ) => void;
  handleEditExercise: (
    dayIndex: number,
    exerciseIndex: number,
    exercise: Exercise
  ) => void;
  handleInputChange: (
    field: string,
    value: string | number | [number, number] | number[]
  ) => void;
  handleSaveExercise: () => void;
  isUpdating: boolean;
  isNewRoutine: boolean;
}

const DialogExerciseCard = ({
  exercise,
  index,
  selectedDay,
  editingExercise,
  setEditingExercise,
  handleEditExercise,
  handleInputChange,
  handleSaveExercise,
  isUpdating,
  isNewRoutine,
}: DialogExerciseCardProps) => {
  return (
    <Dialog
      open={
        editingExercise?.dayIndex === selectedDay &&
        editingExercise?.exerciseIndex === index
      }
      onOpenChange={(open) => !open && setEditingExercise(null)}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEditExercise(selectedDay, index, exercise)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Ejercicio {exercise.exercise}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="grid grid-cols-4 gap-2">
            <div className="space-y-2 col-span-3">
              <label className="text-sm font-medium">
                Nombre del ejercicio
              </label>
              <Input
                type="text"
                value={editingExercise?.data.exercise || ""}
                onChange={(e) => handleInputChange("exercise", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Series</label>
              <Input
                type="number"
                value={editingExercise?.data.sets?.length || 0}
                onChange={(e) =>
                  handleInputChange(
                    "sets",
                    Array(parseInt(e.target.value) || 0).fill(0)
                  )
                }
                placeholder="Ej: 8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rango de repeticiones</label>
            <div className="flex gap-2 items-center">
              <p>Entre</p>
              <Input
                type="number"
                value={editingExercise?.data.range?.[0] || 0}
                onChange={(e) =>
                  handleInputChange("range", [
                    parseInt(e.target.value) || 0,
                    editingExercise?.data.range?.[1] || 0,
                  ])
                }
                placeholder="ej: 8"
              />
              <p>y</p>
              <Input
                type="number"
                value={editingExercise?.data.range?.[1] || 0}
                onChange={(e) =>
                  handleInputChange("range", [
                    editingExercise?.data.range?.[0] || 0,
                    parseInt(e.target.value) || 0,
                  ])
                }
                placeholder="ej: 10"
              />
              <p>repeticiones</p>
            </div>
          </div>

          {!isNewRoutine &&
            "exerciseHistory" in exercise &&
            exercise.exerciseHistory &&
            exercise.exerciseHistory.length > 0 && (
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>Datos modificables por el atleta:</p>
                <div className="flex justify-between">
                  <p>peso actual: {exercise.exerciseHistory[0].weight}kg</p>
                  <p>
                    reps en cada serie:{" "}
                    {exercise.exerciseHistory[0].sets.join("-")}
                  </p>
                </div>
              </div>
            )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Nota del entrenador</label>
            <Input
              type="text"
              value={editingExercise?.data.coachNotes || ""}
              onChange={(e) => handleInputChange("coachNotes", e.target.value)}
            />
          </div>
        </div>

        {!isNewRoutine &&
          "athleteNotes" in exercise &&
          exercise.athleteNotes && (
            <AthleteNotesEdit notes={exercise.athleteNotes} />
          )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEditingExercise(null)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveExercise} disabled={isUpdating}>
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogExerciseCard;
