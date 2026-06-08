import { Button } from "@/components/ui/button";
import { useHoldStep } from "@/hooks/useHoldRepeat";
import { Minus, Plus } from "lucide-react";
import { useEffect, useRef } from "react";

interface SetCardProps {
  value: number;
  onInc: () => void;
  onDec: () => void;
  min: number;
  max: number;
  label: string;
  /** minReps del ejercicio, para calcular el color del contador de reps */
  minReps?: number;
  /** maxReps del ejercicio, para calcular el color del contador de reps */
  maxReps?: number;
}

/**
 * Devuelve la clase de color del número de reps según el rendimiento:
 * - Rojo:    < 70 % de minReps
 * - Amarillo: ≥ 70 % y < minReps
 * - Verde:   ≥ minReps (dentro del rango o superando maxReps)
 */
function getRepColor(reps: number, minReps: number): string {
  if (reps >= minReps) return "text-success";
  if (reps >= Math.ceil(minReps * 0.7)) return "text-warning";
  return "text-danger";
}

/**
 * Componente presentacional para mostrar y editar un set de ejercicios
 * No contiene lógica de store, solo llama a los handlers proporcionados
 * El botón "-" no permite bajar de 0 reps bajo ninguna circunstancia
 */
const SetCard = ({
  value,
  onInc,
  onDec,
  min,
  max,
  label,
  minReps,
  maxReps,
}: SetCardProps) => {
  // El valor jamás debe ser negativo, override de deshabilitado para - en 0
  const minValue = Math.max(0, min);
  const isAtMax = value >= max;
  const isAtMin = value <= minValue;

  const isAtMaxRef = useRef(isAtMax);
  const isAtMinRef = useRef(isAtMin);
  const onIncRef = useRef(onInc);
  const onDecRef = useRef(onDec);

  const {
    stepRef: decStepRef,
    clearHold: clearDecHold,
    handlers: decHandlers,
  } = useHoldStep();
  const {
    stepRef: incStepRef,
    clearHold: clearIncHold,
    handlers: incHandlers,
  } = useHoldStep();

  useEffect(() => {
    isAtMaxRef.current = isAtMax;
    isAtMinRef.current = isAtMin;
    onIncRef.current = onInc;
    onDecRef.current = onDec;

    decStepRef.current = () => {
      // Nunca permitir bajar debajo de 0
      if (isAtMinRef.current || value - 1 < 0) {
        clearDecHold();
        return;
      }
      onDecRef.current();
    };

    incStepRef.current = () => {
      if (isAtMaxRef.current) {
        clearIncHold();
        return;
      }
      onIncRef.current();
    };
    // value se agrega para garantizar que nunca baja a negativo desde handlerRápido
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAtMax, isAtMin, onInc, onDec, clearDecHold, clearIncHold, decStepRef, incStepRef, value]);

  // Color del número solo cuando tenemos el rango de reps del ejercicio
  const repColorClass =
    minReps != null ? getRepColor(value, minReps) : "text-text-primary";

  // Borde verde cuando la serie supera maxReps
  const atOrAboveMax = maxReps != null && value >= maxReps;

  return (
    <div
      className={`flex items-center justify-between rounded-app-xl border bg-bg-surface-1 p-3 transition-colors
                  ${atOrAboveMax ? "border-success/40" : "border-border-subtle"}`}
    >
      <span className="text-sm font-semibold text-text-secondary">{label}</span>

      <div className="flex select-none items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          // Nunca permitir negativos aunque el min original sea < 0
          disabled={isAtMin || value <= 0}
          aria-label={`Bajar reps de ${label}`}
          {...decHandlers}
          className="size-11 touch-none rounded-app-full border-border-strong bg-bg-surface-2 p-0 text-text-primary hover:bg-bg-surface-3 hover:text-text-primary"
        >
          <Minus className="size-4" />
        </Button>

        <span className={`min-w-[2.5rem] text-center text-xl font-bold tabular-nums transition-colors ${repColorClass}`}>
          {value}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isAtMax}
          aria-label={`Subir reps de ${label}`}
          {...incHandlers}
          className="size-11 touch-none rounded-app-full border-border-strong bg-bg-surface-2 p-0 text-text-primary hover:bg-bg-surface-3 hover:text-text-primary"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default SetCard;
