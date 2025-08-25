import {
  Routine,
  NewRoutine,
  RoutineDay,
  NewRoutineDay,
} from "@/types/routineType";
import { Button } from "@/components/ui/button";
import { updateRoutine } from "@/app/api/protected";
import { useGetAllAthletes } from "@/hooks/useGetAllAthletes";
import { useGetAthleteInfo } from "@/hooks/useGetAthleteInfo";

const SelectDay = ({
  routine,
  selectedDay,
  setSelectedDay,
  athleteId,
}: {
  routine: NewRoutine | Routine;
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  athleteId: string;
}) => {
  const { mutate: mutateAllAthletes } = useGetAllAthletes();
  const { mutate: mutateCurrentAthlete } = useGetAthleteInfo(athleteId);

  const handleAddDay = async () => {
if (routine.length === 7) {
  return;
}

    const routineWithNewDay = [...routine, []];
    const response = await updateRoutine(athleteId, routineWithNewDay as Routine);
    if (response.status === 200) {
      mutateAllAthletes();
      mutateCurrentAthlete();
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {routine.map((day: NewRoutineDay | RoutineDay, index: number) => (
        <Button
          key={index}
          variant={selectedDay === index ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedDay(index)}
        >
          Día {index + 1}
        </Button>
      ))}


      <Button variant="outline" size="sm" onClick={handleAddDay} className="text-xs">
        Añadir día
      </Button>
    </div>
  );
};

export default SelectDay;
