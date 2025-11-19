import { useCallback, useState } from "react";
import { GripVertical, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateRoutine } from "@/app/api/protected";
import { Routine, RoutineDay } from "@/types/routineType";
import { cn } from "@/lib/utils";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const WEEKDAY_LABELS = [
  "L",
  "M",
  "M",
  "J",
  "V",
  "S",
  "D",
];

const MAX_WEEK_DAYS = WEEKDAY_LABELS.length;

type WeeklyRoutineSelectorProps = {
  routine: Routine;
  setRoutine: (routine: Routine) => void;
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  isNewRoutine: boolean;
  athleteId: string;
};

const cloneRoutine = (routine: Routine): Routine =>
  routine.map((day) => day.map((exercise) => ({ ...exercise })));

const WeeklyRoutineSelector = ({
  routine,
  setRoutine,
  selectedDay,
  setSelectedDay,
  isNewRoutine,
  athleteId,
}: WeeklyRoutineSelectorProps) => {
  const canAddDay = routine.length < MAX_WEEK_DAYS;
  const [animateIndex, setAnimateIndex] = useState<number | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isReorderingDays, setIsReorderingDays] = useState(false);

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

  const applyRoutineChange = useCallback(
    async (nextRoutine: Routine, onSuccess?: () => void) => {
      if (isNewRoutine) {
        setRoutine(nextRoutine);
        onSuccess?.();
        return;
      }

      const previousRoutine = cloneRoutine(routine);
      setRoutine(nextRoutine);

      try {
        const response = await updateRoutine(athleteId, nextRoutine);
        if (!response.ok) {
          setRoutine(previousRoutine);
          console.error("Error al actualizar la rutina", response.statusText);
          return;
        }
        onSuccess?.();
      } catch (error) {
        setRoutine(previousRoutine);
        console.error("Error al actualizar la rutina:", error);
      }
    },
    [athleteId, isNewRoutine, routine, setRoutine]
  );

  const handleDayDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = routine.findIndex((_, idx) => `day-${idx}` === active.id);
      const newIndex = routine.findIndex((_, idx) => `day-${idx}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Calcular el nuevo estado pero no actualizarlo aún
        const nextRoutine = arrayMove(routine, oldIndex, newIndex);

        if (isNewRoutine) {
          setRoutine(nextRoutine);
          setAnimateIndex(newIndex);
          setSelectedDay(newIndex);
          setTimeout(() => setAnimateIndex(null), 280);
          return;
        }

        // Mostrar estado de carga
        setIsReorderingDays(true);

        // Hacer la request y actualizar solo cuando sea exitosa
        updateRoutine(athleteId, nextRoutine)
          .then((response) => {
            if (response.ok) {
              // Actualizar el estado solo cuando la request sea exitosa
              setRoutine(nextRoutine);
              setAnimateIndex(newIndex);
              setSelectedDay(newIndex);
              setTimeout(() => setAnimateIndex(null), 280);
            } else {
              console.error("Error al actualizar la rutina", response.statusText);
            }
          })
          .catch((error) => {
            console.error("Error al actualizar la rutina:", error);
          })
          .finally(() => {
            setIsReorderingDays(false);
          });
      }
    }
  };

  const handleDeleteDay = (index: number) => {
    const nextRoutine = routine.filter((_, dayIndex) => dayIndex !== index);
    const nextSelected = Math.max(
      0,
      index === selectedDay
        ? Math.min(index, nextRoutine.length - 1)
        : selectedDay > index
        ? selectedDay - 1
        : selectedDay
    );

    if (nextRoutine.length === 0) {
      applyRoutineChange(nextRoutine, () => setSelectedDay(0));
      setAnimateIndex(null);
      return;
    }

    setAnimateIndex(nextSelected);
    applyRoutineChange(nextRoutine, () => {
      setSelectedDay(nextSelected);
      setTimeout(() => setAnimateIndex(null), 280);
    });
  };

  const handleAddDay = () => {
    if (!canAddDay) return;

    const nextRoutine = [...routine, []];
    const targetIndex = nextRoutine.length - 1;
    setAnimateIndex(targetIndex);
    applyRoutineChange(nextRoutine, () => {
      setSelectedDay(targetIndex);
      setTimeout(() => setAnimateIndex(null), 280);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span>Semana</span>
          <span className="text-xs">{`${routine.length}/${MAX_WEEK_DAYS}`}</span>
        </div>

        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Settings2 className="mr-2 h-4 w-4" />
              Configurar días
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar días de la rutina</DialogTitle>
              <DialogDescription>
                Cambia el orden, agrega o elimina días de entrenamiento. Los cambios se guardan automáticamente.
              </DialogDescription>
            </DialogHeader>

            <DndContext
              sensors={isReorderingDays ? [] : sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDayDragEnd}
            >
              <SortableContext
                items={routine.map((_, idx) => `day-${idx}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {routine.length > 0 ? (
                    routine.map((day, index) => (
                    <SortableDayItem
                      key={index}
                      id={`day-${index}`}
                      day={day}
                      index={index}
                      animateIndex={animateIndex}
                      onDelete={handleDeleteDay}
                    />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hay días configurados todavía.
                    </p>
                  )}
                </div>
              </SortableContext>
            </DndContext>

            <DialogFooter className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {canAddDay
                  ? "Puedes añadir nuevos días hasta completar la semana."
                  : "Ya se asignaron todos los días de la semana."}
              </p>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleAddDay}
                disabled={!canAddDay}
              >
                Añadir día
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex w-full items-center gap-2 overflow-x-auto pb-1">
          {routine.map((day, index) => {
            const isSelected = selectedDay === index;
            const label = `Día ${index + 1}`;
            const previewNames = day
              .slice(0, 2)
              .map((exercise) => exercise.exercise)
              .join(", ");

            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedDay(index)}
                className={cn(
                  "flex h-10 min-w-[64px] shrink-0 items-center justify-center rounded-full border px-3 text-sm font-semibold",
                  "transition-all duration-200",
                  animateIndex === index && "animate-day-bump",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                )}
                title={previewNames || "Sin ejercicios"}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Sortable Day Item Component
function SortableDayItem({
  id,
  day,
  index,
  animateIndex,
  onDelete,
}: {
  id: string;
  day: RoutineDay;
  index: number;
  animateIndex: number | null;
  onDelete: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const previewNames = day
    .slice(0, 3)
    .map((exercise) => exercise.exercise)
    .join(", ");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm transition-all",
        animateIndex === index && "animate-day-bump",
        isDragging && "border-primary bg-primary/5"
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-foreground">Día {index + 1}</span>
          <span
            className="text-[10px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px] block"
            title={previewNames || "Sin ejercicios"}
          >
            {previewNames ? (
              previewNames
            ) : (
              <span className="italic text-muted-foreground">Sin ejercicios</span>
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(index)}
          aria-label={`Eliminar día ${index + 1}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default WeeklyRoutineSelector;
