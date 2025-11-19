import { Routine, Exercise } from "@/types/routineType";
import { useState } from "react";
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
  DragEndEvent
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
}: {
  routine: Routine;
  setRoutine: (routine: Routine) => void;
  isNewRoutine: boolean;
  athleteId: string;
}) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isReorderingExercises, setIsReorderingExercises] = useState(false);

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

  const handleExerciseDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = routine[selectedDay].findIndex((_, idx) => `exercise-${idx}` === active.id);
      const newIndex = routine[selectedDay].findIndex((_, idx) => `exercise-${idx}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Calcular el nuevo estado pero no actualizarlo aún
        const newRoutine = routine.map((day, dIdx) => {
          if (dIdx !== selectedDay) return day;
          return arrayMove(day, oldIndex, newIndex);
        });

        if (isNewRoutine) {
          setRoutine(newRoutine);
          return;
        }

        // Mostrar estado de carga
        setIsReorderingExercises(true);

        // Hacer la request y actualizar solo cuando sea exitosa
        updateRoutine(athleteId, newRoutine)
          .then((response) => {
            if (response.ok) {
              // Actualizar el estado solo cuando la request sea exitosa
              setRoutine(newRoutine);
            } else {
              console.error("Error al actualizar la rutina", response.statusText);
            }
          })
          .catch((error) => {
            console.error("Error al actualizar la rutina:", error);
          })
          .finally(() => {
            setIsReorderingExercises(false);
          });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector y ordenamiento de días */}
      <WeeklyRoutineSelector
        routine={routine}
        setRoutine={setRoutine}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        isNewRoutine={isNewRoutine}
        athleteId={athleteId}
      />

      {/* Lista de ejercicios del día seleccionado */}
      {routine[selectedDay]?.length > 0 ? (
        <DndContext
          sensors={isReorderingExercises ? [] : sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleExerciseDragEnd}
        >
          <SortableContext
            items={routine[selectedDay].map((_, idx) => `exercise-${idx}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {routine[selectedDay]?.map((exercise, index) => (
                <SortableExerciseItem
                  key={index}
                  id={`exercise-${index}`}
                  exercise={exercise}
                  index={index}
                  routine={routine}
                  setRoutine={setRoutine}
                  selectedDay={selectedDay}
                  athleteId={athleteId}
                  isNewRoutine={isNewRoutine}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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

// Sortable Exercise Item Component
function SortableExerciseItem({
  id,
  exercise,
  index,
  routine,
  setRoutine,
  selectedDay,
  athleteId,
  isNewRoutine,
}: {
  id: string;
  exercise: Exercise;
  index: number;
  routine: Routine;
  setRoutine: (routine: Routine) => void;
  selectedDay: number;
  athleteId: string;
  isNewRoutine: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
      </div>
      <ExerciseCard
        routine={routine}
        setRoutine={setRoutine}
        exercise={exercise}
        indexExercise={index}
        indexDay={selectedDay}
        athleteId={athleteId}
        isNewRoutine={isNewRoutine}
      />
    </div>
  );
}

export default EditRoutineSection;
