import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, Minus, Plus, Save } from "lucide-react";
import { Exercise, ExerciseHistory, Routine } from "@/types/routineType";
import { updateRoutine } from "@/app/api/protected";
import {
  formatTargetReps,
  MAX_REPS_LIMIT,
  resolveRepRangeFromExercise,
} from "@/lib/routineExercise";
import { getApiErrorMessage } from "@/lib/apiError";
import { searchExerciseMedia, type ExerciseSuggestion } from "@/app/api/exerciseMedia";

const MAX_EXERCISE_SUGGESTIONS = 5;

type NumberFieldName = "sets" | "minReps" | "maxReps";

type NumberPickerState = {
  field: NumberFieldName;
  title: string;
  min: number;
  max: number;
} | null;

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
  const initialRepRange = resolveRepRangeFromExercise(exercise ?? {});
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      exercise: exercise?.exercise || "",
      sets: exercise?.sets || 3,
      minReps: initialRepRange.minReps,
      maxReps: initialRepRange.maxReps,
      coachNotes: exercise?.coachNotes || "",
    },
  });
  const [messageError, setMessageError] = useState("");
  const isSubmittingRef = useRef(false);
  const [isClearingAthleteNote, setIsClearingAthleteNote] = useState(false);
  const [athleteNoteValue, setAthleteNoteValue] = useState(
    exercise?.athleteNotes || ""
  );
  const [athleteNoteFeedback, setAthleteNoteFeedback] = useState("");
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseSuggestion[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isExerciseSearchOpen, setIsExerciseSearchOpen] = useState(false);
  const [numberPicker, setNumberPicker] = useState<NumberPickerState>(null);

  const exerciseName = String(watch("exercise") || "");
  const setsValue = Number(watch("sets") || 1);
  const minRepsValue = Number(watch("minReps") || 1);
  const maxRepsValue = Number(watch("maxReps") || minRepsValue);
  const shouldShowLibrary = indexExercise === null;
  const filteredExerciseOptions = useMemo(() => {
    const normalized = exerciseName.trim().toLowerCase();
    const filtered = normalized
      ? exerciseOptions.filter((option) =>
          option.name.toLowerCase().includes(normalized)
        )
      : exerciseOptions;
    return filtered.slice(0, MAX_EXERCISE_SUGGESTIONS);
  }, [exerciseName, exerciseOptions]);

  useEffect(() => {
    if (!shouldShowLibrary || !isExerciseSearchOpen) return;

    const timeout = window.setTimeout(async () => {
      setIsLoadingOptions(true);
      const options = await searchExerciseMedia(exerciseName);
      setExerciseOptions(options);
      setIsLoadingOptions(false);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [exerciseName, isExerciseSearchOpen, shouldShowLibrary]);

  const handleSelectExercise = (item: ExerciseSuggestion) => {
    setValue("exercise", item.name, { shouldDirty: true, shouldValidate: true });
    setIsExerciseSearchOpen(false);
  };

  const handleNumberChange = (
    field: NumberFieldName,
    nextValue: number,
    min: number,
    max: number
  ) => {
    const safeValue = Math.min(max, Math.max(min, nextValue));
    setValue(field, safeValue, { shouldDirty: true, shouldValidate: true });
  };

  const openNumberPicker = (picker: NumberPickerState) => {
    setNumberPicker(picker);
  };

  const getNumberPickerValue = () => {
    if (!numberPicker) return 0;
    if (numberPicker.field === "sets") return setsValue;
    if (numberPicker.field === "minReps") return minRepsValue;
    return maxRepsValue;
  };

  const onSubmit = (data: Record<string, unknown>) => {
    if (isSubmittingRef.current) return;

    const exerciseLabel = String(data.exercise || "").trim();
    const sets = Number(data.sets);
    const minReps = Number(data.minReps);
    const maxReps = Number(data.maxReps);

    if (!exerciseLabel) {
      setMessageError("Ingresa el nombre del ejercicio.");
      return;
    }

    if (
      !Number.isFinite(sets) || !Number.isInteger(sets) || sets < 1 ||
      !Number.isFinite(minReps) || !Number.isInteger(minReps) || minReps < 1 ||
      !Number.isFinite(maxReps) || !Number.isInteger(maxReps) ||
      maxReps < minReps || maxReps > MAX_REPS_LIMIT
    ) {
      setMessageError("Revisa series y rango de reps antes de guardar.");
      return;
    }

    const exerciseUpdate: Exercise = {
      id: exercise?.id,
      exercise: exerciseLabel,
      sets,
      minReps,
      maxReps,
      targetReps: formatTargetReps({ minReps, maxReps }),
      coachNotes: String(data.coachNotes ?? ""),
      athleteNotes: athleteNoteValue,
      exerciseHistory: exercise?.exerciseHistory || null,
    };

    let newRoutine: Routine;
    if (indexExercise === null) {
      const baseRoutine = [...routine];
      while (baseRoutine.length <= indexDay) baseRoutine.push([]);
      newRoutine = baseRoutine.map((day, dIdx) =>
        dIdx === indexDay ? [...day, exerciseUpdate] : day
      );
    } else {
      newRoutine = routine.map((day, dIdx) =>
        dIdx === indexDay
          ? day.map((ex, eIdx) => (eIdx === indexExercise ? exerciseUpdate : ex))
          : day
      );
    }

    const previousRoutine = routine;
    setMessageError("");

    // Actualización optimista: aplicar + cerrar inmediatamente
    setRoutine(newRoutine);
    setIsEditing(false);
    closeDialog();

    if (isNewRoutine) return;

    // Sync en background — rollback silencioso en caso de error
    isSubmittingRef.current = true;
    updateRoutine(athleteId, newRoutine)
      .then(async (response) => {
        if (!response.ok) {
          setRoutine(previousRoutine);
          return;
        }
        const body = (await response.json()) as { routine?: Routine };
        setRoutine(body.routine || newRoutine);
      })
      .catch(() => {
        setRoutine(previousRoutine);
      })
      .finally(() => {
        isSubmittingRef.current = false;
      });
  };

  const handleClearAthleteNote = async () => {
    if (indexExercise === null || !athleteNoteValue.trim()) return;

    const nextRoutine = routine.map((day, dIdx) =>
      dIdx === indexDay
        ? day.map((item, eIdx) =>
            eIdx === indexExercise ? { ...item, athleteNotes: "" } : item
          )
        : day
    );
    const previousRoutine = routine;

    setMessageError("");
    setAthleteNoteFeedback("");

    if (isNewRoutine) {
      setRoutine(nextRoutine);
      setAthleteNoteValue("");
      setAthleteNoteFeedback("Corregido!");
      window.setTimeout(() => setAthleteNoteFeedback(""), 1800);
      return;
    }

    setIsClearingAthleteNote(true);
    try {
      const response = await updateRoutine(athleteId, nextRoutine);
      if (!response.ok) {
        const message = await getApiErrorMessage(
          response,
          "Error al corregir la nota del atleta"
        );
        setRoutine(previousRoutine);
        setMessageError(message);
        return;
      }

      const body = (await response.json()) as { routine?: Routine };
      setRoutine(body.routine || nextRoutine);
      setAthleteNoteValue("");
      setAthleteNoteFeedback("Corregido!");
      window.setTimeout(() => setAthleteNoteFeedback(""), 1800);
    } catch (error) {
      setRoutine(previousRoutine);
      setMessageError("Error de conexion al corregir la nota del atleta.");
      console.error("Error al corregir la nota del atleta:", error);
    } finally {
      setIsClearingAthleteNote(false);
    }
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
        <div>
          <label className="text-sm font-medium">Ejercicio</label>
          <div className="relative">
            <Input
              type="text"
              className={`h-8 text-sm ${
                errors.exercise ? "border-red-500" : ""
              }`}
              {...register("exercise", {
                required: "Ingresa el nombre del ejercicio",
                onBlur: () =>
                  window.setTimeout(() => setIsExerciseSearchOpen(false), 120),
              })}
              onFocus={() => {
                if (shouldShowLibrary) setIsExerciseSearchOpen(true);
              }}
              placeholder="Nombre del ejercicio"
              autoComplete="off"
            />
            {shouldShowLibrary && isExerciseSearchOpen ? (
              <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
                {isLoadingOptions ? (
                  <p className="px-2 py-2 text-xs text-muted-foreground">
                    Buscando ejercicios...
                  </p>
                ) : filteredExerciseOptions.length > 0 ? (
                  filteredExerciseOptions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelectExercise(item)}
                    >
                      <span className="truncate">{item.name}</span>
                      <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                        {item.muscleGroup}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-2 py-2 text-xs text-muted-foreground">
                    Sin sugerencias para esa busqueda.
                  </p>
                )}
              </div>
            ) : null}
          </div>
          {errors.exercise ? (
            <p className="mt-1 text-xs text-red-500">
              {String(errors.exercise.message || "Ingresa el ejercicio")}
            </p>
          ) : null}
        </div>

        <div className="flex gap-4 items-end">
          <div>
            <label className="text-sm font-medium">Series</label>
            <input
              type="hidden"
              {...register("sets", {
                required: "Ingresa las series",
                valueAsNumber: true,
                min: { value: 1, message: "Debe haber al menos 1 serie" },
                validate: (value) =>
                  Number.isInteger(Number(value)) ||
                  "Las series deben ser un numero entero",
              })}
            />
            <Button
              type="button"
              variant="outline"
              className={`h-8 w-16 text-sm font-semibold ${
                errors.sets ? "border-red-500" : ""
              }`}
              onClick={() =>
                openNumberPicker({
                  field: "sets",
                  title: "Series",
                  min: 1,
                  max: 12,
                })
              }
            >
              {setsValue}
            </Button>
            {errors.sets ? (
              <p className="mt-1 text-xs text-red-500">
                {String(errors.sets.message || "Revisa las series")}
              </p>
            ) : null}
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">Rango de reps</label>
            <div className="flex flex-row items-center gap-2 text-sm">
              <span className="text-muted-foreground">entre</span>
              <input
                type="hidden"
                {...register("minReps", {
                  required: "Ingresa el minimo",
                  valueAsNumber: true,
                  min: { value: 1, message: "El minimo debe ser al menos 1" },
                })}
              />
              <Button
                type="button"
                variant="outline"
                className={`h-8 w-16 text-sm font-semibold ${
                  errors.minReps ? "border-red-500" : ""
                }`}
                onClick={() =>
                  openNumberPicker({
                    field: "minReps",
                    title: "Reps minimas",
                    min: 1,
                    max: Math.max(1, maxRepsValue),
                  })
                }
              >
                {minRepsValue}
              </Button>
              <span className="text-muted-foreground">y</span>
              <input
                type="hidden"
                {...register("maxReps", {
                  required: "Ingresa el maximo",
                  valueAsNumber: true,
                  min: { value: 1, message: "El maximo debe ser al menos 1" },
                  max: {
                    value: MAX_REPS_LIMIT,
                    message: `El maximo permitido es ${MAX_REPS_LIMIT}`,
                  },
                  validate: (value, values) =>
                    Number(value) >= Number(values.minReps) ||
                    "El maximo debe ser igual o mayor al minimo",
                })}
              />
              <Button
                type="button"
                variant="outline"
                className={`h-8 w-16 text-sm font-semibold ${
                  errors.maxReps ? "border-red-500" : ""
                }`}
                onClick={() =>
                  openNumberPicker({
                    field: "maxReps",
                    title: "Reps maximas",
                    min: Math.max(1, minRepsValue),
                    max: MAX_REPS_LIMIT,
                  })
                }
              >
                {maxRepsValue}
              </Button>
            </div>
            {(errors.minReps || errors.maxReps) && (
              <p className="mt-1 text-xs text-red-500">
                {String(
                  errors.minReps?.message ||
                    errors.maxReps?.message ||
                    "Revisa el rango de reps"
                )}
              </p>
            )}
          </div>
        </div>

        {exercise && (
          <div className="flex flex-col">
            <p className="text-sm font-medium">
              Info editable solo por el atleta
            </p>
            <div className="flex justify-between items-center gap-2 text-sm text-muted-foreground border rounded-md p-2">
              <p>
                ultimo peso:{" "}
                {lastSession && lastSession.weight !== 0
                  ? lastSession.weight + " kg"
                  : "Sin registrar"}
              </p>
              <p>
                ultimas reps:{" "}
                {lastSession && lastSession.sets.length > 0
                  ? lastSession.sets.join("-")
                  : "Sin registrar"}
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium">Nota del entrenador</label>
          <Textarea
            className="text-sm min-h-[60px]"
            {...register("coachNotes")}
            placeholder="Agregar notas o instrucciones especiales..."
          />
        </div>

        {exercise && (
          <div>
            <p className="text-sm font-medium">Nota del atleta</p>
            {athleteNoteValue.trim() !== "" ? (
              <div className="text-sm text-red-400 border border-red-400 rounded-md p-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 flex-1">{athleteNoteValue}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
                    disabled={isClearingAthleteNote}
                    onClick={handleClearAthleteNote}
                    title="Marcar nota del atleta como corregida"
                    aria-label="Marcar nota del atleta como corregida"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
                {athleteNoteFeedback ? (
                  <p className="mt-2 text-xs font-medium text-emerald-400">
                    {athleteNoteFeedback}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground border rounded-md p-2 flex justify-between items-center">
                <p>
                  {athleteNoteFeedback ? athleteNoteFeedback : "Sin notas del atleta"}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            type="button"
            className="h-8 text-sm"
            onClick={() => closeDialog()}
          >
            Cancelar
          </Button>
          <Button type="submit" className="h-8 text-sm">
            <Save className="h-4 w-4 mr-1" />
            {indexExercise === null ? "Agregar" : "Guardar"}
          </Button>
        </div>
      </form>

      {numberPicker ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-xs rounded-lg border bg-background p-4 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{numberPicker.title}</p>
                <p className="mt-1 text-4xl font-semibold leading-none">
                  {getNumberPickerValue()}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  size="icon"
                  className="h-12 w-12"
                  disabled={getNumberPickerValue() >= numberPicker.max}
                  onClick={() =>
                    handleNumberChange(
                      numberPicker.field,
                      getNumberPickerValue() + 1,
                      numberPicker.min,
                      numberPicker.max
                    )
                  }
                  aria-label={`Subir ${numberPicker.title}`}
                >
                  <Plus className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-12 w-12"
                  disabled={getNumberPickerValue() <= numberPicker.min}
                  onClick={() =>
                    handleNumberChange(
                      numberPicker.field,
                      getNumberPickerValue() - 1,
                      numberPicker.min,
                      numberPicker.max
                    )
                  }
                  aria-label={`Bajar ${numberPicker.title}`}
                >
                  <Minus className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <Button
              type="button"
              className="mt-4 h-9 w-full"
              onClick={() => setNumberPicker(null)}
            >
              Listo
            </Button>
          </div>
        </div>
      ) : null}
    </DialogContent>
  );
};

export default DialogExerciseCard;
