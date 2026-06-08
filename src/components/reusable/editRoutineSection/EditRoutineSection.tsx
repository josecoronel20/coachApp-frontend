import { Routine, Exercise, ExerciseHistory } from "@/types/routineType";
import { useCallback, useState } from "react";
import ExerciseCard from "./ExerciseCard";
import WeeklyRoutineSelector from "./SelectDay";
import DialogExerciseCard from "./DialogExerciseCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { updateRoutine } from "@/app/api/protected";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

const EditRoutineSection = ({
  routine,
  setRoutine,
  isNewRoutine,
  athleteId,
  latestHistoryByExerciseId,
}: {
  routine: Routine;
  setRoutine: (routine: Routine) => void;
  isNewRoutine: boolean;
  athleteId: string;
  latestHistoryByExerciseId?: Map<string, ExerciseHistory>;
}) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isReorderingExercises, setIsReorderingExercises] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const persistRoutineChange = useCallback(
    async (nextRoutine: Routine) => {
      if (isNewRoutine) {
        setRoutine(nextRoutine);
        return;
      }

      const previousRoutine = routine.map((day) =>
        day.map((exercise) => ({ ...exercise }))
      );
      setReorderError(null);
      setRoutine(nextRoutine);
      setIsReorderingExercises(true);

      try {
        const response = await updateRoutine(athleteId, nextRoutine);
        if (!response.ok) {
          setRoutine(previousRoutine);
          setReorderError("No se pudo guardar el nuevo orden. Se restauro el orden anterior.");
          console.error("Error al actualizar la rutina", response.statusText);
        } else {
          const body = (await response.json()) as { routine?: Routine };
          setRoutine(body.routine || nextRoutine);
        }
      } catch (error) {
        setRoutine(previousRoutine);
        setReorderError("No se pudo guardar el nuevo orden. Se restauro el orden anterior.");
        console.error("Error al actualizar la rutina:", error);
      } finally {
        setIsReorderingExercises(false);
      }
    },
    [athleteId, isNewRoutine, routine, setRoutine]
  );

  const getSortableExerciseId = useCallback(
    (exercise: Exercise, index: number) =>
      exercise.id ?? `exercise-${selectedDay}-${index}`,
    [selectedDay]
  );

  const handleExerciseDragEnd = (event: DragEndEvent) => {
    if (isReorderingExercises) return;

    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = routine[selectedDay].findIndex(
        (exercise, idx) => getSortableExerciseId(exercise, idx) === active.id
      );
      const newIndex = routine[selectedDay].findIndex(
        (exercise, idx) => getSortableExerciseId(exercise, idx) === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const nextRoutine = routine.map((routineDay, dIdx) => {
          if (dIdx !== selectedDay) return routineDay;
          return arrayMove(routineDay, oldIndex, newIndex);
        });

        void persistRoutineChange(nextRoutine);
      }
    }
  };

  const selectedDayExercises = routine[selectedDay] || [];

  return (
    <div className="space-y-4">
      <WeeklyRoutineSelector
        routine={routine}
        setRoutine={setRoutine}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        isNewRoutine={isNewRoutine}
        athleteId={athleteId}
      />

      <div className="flex flex-col gap-1 border-t border-border-subtle pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
            Dia {selectedDay + 1} · {selectedDayExercises.length} ejercicio
            {selectedDayExercises.length === 1 ? "" : "s"}
          </h3>
        </div>
      </div>

      {selectedDayExercises.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleExerciseDragEnd}
        >
          <SortableContext
            items={selectedDayExercises.map((exercise, idx) =>
              getSortableExerciseId(exercise, idx)
            )}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2.5">
              {selectedDayExercises.map((exercise, index) => (
                <SortableExerciseItem
                  key={exercise.id ?? `${selectedDay}-${index}`}
                  id={getSortableExerciseId(exercise, index)}
                  exercise={exercise}
                  index={index}
                  routine={routine}
                  setRoutine={setRoutine}
                  selectedDay={selectedDay}
                  athleteId={athleteId}
                  isNewRoutine={isNewRoutine}
                  disabled={isReorderingExercises}
                  latestHistoryByExerciseId={latestHistoryByExerciseId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="rounded-app-xl border border-dashed border-border-subtle bg-bg-surface-2/70 p-4 text-center text-sm text-text-secondary">
          No hay ejercicios en este dia, puedes agregar uno para empezar.
        </div>
      )}
      {reorderError ? (
        <p className="text-xs text-destructive">{reorderError}</p>
      ) : null}

      <div className="pt-1">
        <Dialog open={isAddingExercise} onOpenChange={setIsAddingExercise}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-11 w-full rounded-app-xl border-dashed border-purple-primary/35 bg-purple-primary/10 text-purple-soft hover:bg-purple-primary/15 hover:text-text-primary"
              onClick={() => setIsAddingExercise(true)}
            >
              <Plus className="size-4" />
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

function SortableExerciseItem({
  id,
  exercise,
  index,
  routine,
  setRoutine,
  selectedDay,
  athleteId,
  isNewRoutine,
  disabled,
  latestHistoryByExerciseId,
}: {
  id: string;
  exercise: Exercise;
  index: number;
  routine: Routine;
  setRoutine: (routine: Routine) => void;
  selectedDay: number;
  athleteId: string;
  isNewRoutine: boolean;
  disabled: boolean;
  latestHistoryByExerciseId?: Map<string, ExerciseHistory>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <div
        {...attributes}
        {...listeners}
        className={
          disabled
            ? "cursor-not-allowed touch-none opacity-50"
            : "cursor-grab touch-none active:cursor-grabbing"
        }
        aria-label={`Arrastrar ejercicio ${index + 1}`}
      >
        <GripVertical className="size-5 shrink-0 text-text-muted" />
      </div>
      <ExerciseCard
        routine={routine}
        setRoutine={setRoutine}
        exercise={exercise}
        indexExercise={index}
        indexDay={selectedDay}
        athleteId={athleteId}
        isNewRoutine={isNewRoutine}
        latestHistoryByExerciseId={latestHistoryByExerciseId}
      />
    </div>
  );
}

export default EditRoutineSection;
