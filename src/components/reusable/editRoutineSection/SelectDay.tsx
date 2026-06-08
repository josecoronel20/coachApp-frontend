import { useCallback, useState } from "react";
import { Copy, GripVertical, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateRoutine } from "@/app/api/protected";
import { Routine, RoutineDay } from "@/types/routineType";
import { cn } from "@/lib/utils";
import {
  insertDayAfter,
  stripExerciseForDuplicate,
} from "@/lib/routineExercise";
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
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [dayFeedback, setDayFeedback] = useState<{ message: string; tone: "success" | "error" } | null>(null);

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
          setDayFeedback({ message: "No se pudo guardar el cambio. Intentá de nuevo.", tone: "error" });
          console.error("Error al actualizar la rutina", response.statusText);
          return;
        }
        const body = (await response.json()) as { routine?: Routine };
        setRoutine(body.routine || nextRoutine);
        onSuccess?.();
      } catch (error) {
        setRoutine(previousRoutine);
        setDayFeedback({ message: "Error de conexión al guardar. Intentá de nuevo.", tone: "error" });
        console.error("Error al actualizar la rutina:", error);
      }
    },
    [athleteId, isNewRoutine, routine, setRoutine]
  );

  const handleDayDragEnd = (event: DragEndEvent) => {
    if (isReorderingDays) return;

    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = routine.findIndex((_, idx) => `day-${idx}` === active.id);
      const newIndex = routine.findIndex((_, idx) => `day-${idx}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const nextRoutine = arrayMove(routine, oldIndex, newIndex);
        const previousRoutine = cloneRoutine(routine);
        const previousSelectedDay = selectedDay;
        const nextSelectedDay =
          selectedDay === oldIndex
            ? newIndex
            : oldIndex < selectedDay && selectedDay <= newIndex
            ? selectedDay - 1
            : newIndex <= selectedDay && selectedDay < oldIndex
            ? selectedDay + 1
            : selectedDay;

        setReorderError(null);
        setRoutine(nextRoutine);
        setAnimateIndex(nextSelectedDay);
        setSelectedDay(nextSelectedDay);
        setTimeout(() => setAnimateIndex(null), 280);

        if (isNewRoutine) {
          return;
        }

        setIsReorderingDays(true);

        updateRoutine(athleteId, nextRoutine)
          .then(async (response) => {
            if (!response.ok) {
              setRoutine(previousRoutine);
              setSelectedDay(previousSelectedDay);
              setAnimateIndex(null);
              setReorderError("No se pudo guardar el nuevo orden. Se restauro el orden anterior.");
              console.error("Error al actualizar la rutina", response.statusText);
              return;
            }
            const body = (await response.json()) as { routine?: Routine };
            setRoutine(body.routine || nextRoutine);
          })
          .catch((error) => {
            setRoutine(previousRoutine);
            setSelectedDay(previousSelectedDay);
            setAnimateIndex(null);
            setReorderError("No se pudo guardar el nuevo orden. Se restauro el orden anterior.");
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
      setIsConfigOpen(false);
      applyRoutineChange(nextRoutine, () => setSelectedDay(0));
      setAnimateIndex(null);
      return;
    }

    setAnimateIndex(nextSelected);
    setSelectedDay(nextSelected);
    setIsConfigOpen(false);
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
    setSelectedDay(targetIndex);
    setDayFeedback(null);
    applyRoutineChange(nextRoutine, () => {
      setSelectedDay(targetIndex);
      setDayFeedback({ message: `Día ${targetIndex + 1} agregado.`, tone: "success" });
      setTimeout(() => setAnimateIndex(null), 280);
      window.setTimeout(() => setDayFeedback(null), 2400);
    });
  };

  const handleDuplicateDay = (index: number) => {
    if (!canAddDay) return;

    const cloneDay = routine[index].map(stripExerciseForDuplicate);
    const nextRoutine = insertDayAfter(routine, index, cloneDay);
    const targetIndex = index + 1;
    setAnimateIndex(targetIndex);
    setSelectedDay(targetIndex);
    setIsConfigOpen(false);
    applyRoutineChange(nextRoutine, () => {
      setSelectedDay(targetIndex);
      setTimeout(() => setAnimateIndex(null), 280);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary sm:flex-col sm:items-start sm:gap-1">
          <span>Semana</span>
          <span className="text-xs">{`${routine.length}/${MAX_WEEK_DAYS} dias configurados`}</span>
        </div>

        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit rounded-app-full"
            >
              <Settings2 className="size-4" />
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
              sensors={sensors}
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
                        canDuplicate={canAddDay}
                        disabled={isReorderingDays}
                        onDelete={handleDeleteDay}
                        onDuplicate={handleDuplicateDay}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-text-secondary">
                      No hay días configurados todavía.
                    </p>
                  )}
                </div>
              </SortableContext>
            </DndContext>
            {reorderError ? (
              <p className="text-xs text-destructive">{reorderError}</p>
            ) : null}
            {dayFeedback ? (
              <p className={`text-xs ${dayFeedback.tone === "error" ? "text-destructive" : "text-emerald-600"}`}>
                {dayFeedback.message}
              </p>
            ) : null}

            <DialogFooter className="flex items-center justify-between">
              <p className="text-xs text-text-secondary">
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
                  "flex h-10 min-w-[64px] shrink-0 items-center justify-center rounded-app-full border px-4 text-sm font-semibold",
                  "transition-all duration-200",
                  animateIndex === index && "animate-day-bump",
                  isSelected
                    ? "border-purple-primary bg-purple-primary text-white shadow-purple-glow"
                    : "border-border-subtle bg-bg-surface-2 text-text-secondary hover:bg-bg-surface-3 hover:text-text-primary"
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
  canDuplicate,
  disabled,
  onDelete,
  onDuplicate,
}: {
  id: string;
  day: RoutineDay;
  index: number;
  animateIndex: number | null;
  canDuplicate: boolean;
  disabled: boolean;
  onDelete: (index: number) => void;
  onDuplicate: (index: number) => void;
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const previewNames = day
    .slice(0, 3)
    .map((exercise) => exercise.exercise)
    .join(", ");

  const exerciseCount = day.length;

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
        "flex items-center justify-between rounded-app-xl border border-border-subtle bg-bg-surface-1 px-3 py-2 text-sm transition-all",
        animateIndex === index && "animate-day-bump",
        isDragging && "border-purple-primary bg-purple-primary/10"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className={
            disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-grab active:cursor-grabbing"
          }
        >
          <GripVertical className="size-4 shrink-0 text-text-muted" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="font-medium text-text-primary">Día {index + 1}</span>
          <span
            className="block max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-text-secondary"
            title={previewNames || "Sin ejercicios"}
          >
            {previewNames ? (
              previewNames
            ) : (
              <span className="italic text-text-muted">Sin ejercicios</span>
            )}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-app-full"
          title="Duplicar día"
          aria-label={`Duplicar día ${index + 1}`}
          disabled={!canDuplicate}
          onClick={() => onDuplicate(index)}
        >
          <Copy className="size-4" />
        </Button>

        {/* ── Dialog de confirmación para borrar día ── */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-app-full text-danger hover:text-danger"
              aria-label={`Eliminar día ${index + 1}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Eliminar Día {index + 1}?</DialogTitle>
              <DialogDescription>
                {exerciseCount > 0
                  ? `Este día tiene ${exerciseCount} ejercicio${exerciseCount === 1 ? "" : "s"}. Se eliminarán permanentemente junto con su historial.`
                  : "El día está vacío. Se eliminará permanentemente."}
                {" "}Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setIsDeleteOpen(false);
                  onDelete(index);
                }}
              >
                Eliminar día
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default WeeklyRoutineSelector;
