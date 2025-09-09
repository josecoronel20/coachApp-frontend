import { Routine } from "@/types/routineType";
import { useState } from "react";
import ExerciseCard from "./ExerciseCard";
import SelectDay from "./SelectDay";
import DialogExerciseCard from "./DialogExerciseCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { DeleteButton } from "../DeleteButton";

const EditRoutineSection = ({
  routine,
  setRoutine,
  isNewRoutine,
  athleteId,
}: {
  routine: Routine;
  setRoutine: (routine: Routine) => void;
  isNewRoutine: boolean;
  athleteId: string;
}) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [isAddingExercise, setIsAddingExercise] = useState(false);

  const handleDeleteDay = () => {
    setRoutine(routine.filter((_, index) => index !== selectedDay));
  };


  return (
    <div className="space-y-4">
      {/* Selector de días */}
      <SelectDay
        routine={routine}
        setRoutine={setRoutine}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        isNewRoutine={isNewRoutine}
        athleteId={athleteId}
      />

      {/*Delete day button*/}
      {routine.length > 1 && (
      <DeleteButton label="día" handleDelete={() => handleDeleteDay()} />
      )}
      
      {/* Lista de ejercicios del día seleccionado */}
      {routine[selectedDay]?.length > 0 ? (
        <div className="space-y-2">
          {routine[selectedDay]?.map((exercise, index) => (
            <ExerciseCard
              key={index}
              routine={routine}
              setRoutine={setRoutine}
              exercise={exercise}
              indexExercise={index}
              indexDay={selectedDay}
              athleteId={athleteId}
              isNewRoutine={isNewRoutine}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-sm text-muted-foreground">
          No hay ejercicios en este día, puedes agregar uno para empezar.
        </div>
      )}

      {/* Add Exercise Button */}
      <div className="pt-2">
        <Dialog open={isAddingExercise} onOpenChange={setIsAddingExercise}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setIsAddingExercise(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Ejercicio
            </Button>
          </DialogTrigger>

          <DialogExerciseCard
            exercise={null}
            indexDay={selectedDay}
            indexExercise={null}
            setIsEditing={setIsAddingExercise}
            lastSession={null}
            routine={routine}
            setRoutine={setRoutine}
            closeDialog={() => setIsAddingExercise(false)}
            athleteId={athleteId}
            isNewRoutine={isNewRoutine}
          />
        </Dialog>
      </div>
    </div>
  );
};

export default EditRoutineSection;
