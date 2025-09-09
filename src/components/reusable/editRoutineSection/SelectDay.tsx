import {
  Routine,
  RoutineDay,
} from "@/types/routineType";
import { Button } from "@/components/ui/button";
import { updateRoutine } from "@/app/api/protected";

const SelectDay = ({
  routine,
  setRoutine,
  selectedDay,
  setSelectedDay,
  isNewRoutine,
  athleteId,
}: {
  routine: Routine;
  setRoutine: (routine: Routine) => void;
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  isNewRoutine: boolean;
  athleteId: string;
}) => {

  const handleAddDay = async () => {
    const newRoutine = [...routine, []];
    
    if (!isNewRoutine) {
      setRoutine(newRoutine);
      try {
        const response = await updateRoutine(athleteId, newRoutine);
        if (!response.ok) {
          // Si falla, revertir el estado
          setRoutine(routine);
          console.error('Error al actualizar la rutina');
        }
      } catch (error) {
        // Si falla, revertir el estado
        setRoutine(routine);
        console.error('Error al actualizar la rutina:', error);
      }
    } else {
      setRoutine(newRoutine);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {routine.map((day: RoutineDay, index: number) => (
        <Button
          key={index}
          variant={selectedDay === index ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedDay(index)}
        >
          Día {index + 1}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAddDay()}
        className="text-xs"
      >
        Añadir día
      </Button>
    </div>
  );
};

export default SelectDay;
