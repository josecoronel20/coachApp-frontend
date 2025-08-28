import { Routine, NewRoutine, NewExercise } from "@/types/routineType";
import { useState } from "react";
import ExerciseCard from "./ExerciseCard";
import SelectDay from "./SelectDay";
import DialogExerciseCard from "./DialogExerciseCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { updateRoutine } from "@/app/api/protected";
import { useGetAllAthletes } from "@/hooks/useGetAllAthletes";
import { useGetAthleteInfo } from "@/hooks/useGetAthleteInfo";
import { DeleteButton } from "../DeleteButton";

const EditRoutineSection = ({
  routine,
  isNewRoutine,
  athleteId,
}: {
  routine: NewRoutine | Routine;
  isNewRoutine: boolean;
  athleteId: string;
}) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const { mutate: mutateAllAthletes } = useGetAllAthletes();
  const { mutate: mutateCurrentAthlete } = useGetAthleteInfo(athleteId);
  // Create a new exercise template
  const newExerciseTemplate: NewExercise = {
    exercise: "",
    sets: 3,
    rangeMin: 8,
    rangeMax: 12,
    coachNotes: "",
  };

  const handleDeleteExercise = async (indexExercise: number,athleteId: string) => {
    const routineWithoutExercise = routine.map((day, index) =>
      index === selectedDay ? day.filter((_, i) => i !== indexExercise) : day
    );

    const response = await updateRoutine(
      athleteId,
      routineWithoutExercise as Routine
    );
    if (response.status === 200) {
      mutateAllAthletes();
      mutateCurrentAthlete();
    }
  };

  const handleDeleteDay = async () => {

    const routineWithoutDay = routine.filter((_, i) => i !== selectedDay);
    const response = await updateRoutine(athleteId, routineWithoutDay as Routine);
    if (response.status === 200) {
      mutateAllAthletes();
      mutateCurrentAthlete();
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector de días */}
      <SelectDay
        routine={routine}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        athleteId={athleteId}
      />
      <DeleteButton label="día" handleDelete={handleDeleteDay} />

      {/* Lista de ejercicios del día seleccionado */}
      {routine[selectedDay]?.length > 0 ? (
      <div className="space-y-2">
        {routine[selectedDay]?.map((exercise, index) => (
          <ExerciseCard
            key={index}
            idAthlete={athleteId}
            exercise={exercise}
            indexExercise={index}
            indexDay={selectedDay}
            isNewRoutine={isNewRoutine}
            routine={routine}
            handleDeleteExercise={() => handleDeleteExercise(index,athleteId)}
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
            idAthlete={athleteId}
            exercise={newExerciseTemplate}
            indexExercise={-1} // -1 indicates this is a new exercise
            indexDay={selectedDay}
            isNewRoutine={isNewRoutine}
            setIsEditing={setIsAddingExercise}
            routine={routine}
            closeDialog={() => setIsAddingExercise(false)}
            isAddingNew={true}
          />
        </Dialog>
      </div>
    </div>
  );
};

export default EditRoutineSection;
