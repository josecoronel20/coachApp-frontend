import { Button } from "@/components/ui/button";
import { useHoldStep } from "@/hooks/useHoldRepeat";
import { Minus, Plus } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface ExerciseWeightProps {
  weight: number;
  onWeightChange: (weight: number) => void;
}

const WEIGHT_STEP = 0.5;

const normalizeWeight = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value * 10) / 10);
};

const ExerciseWeight = ({ weight, onWeightChange }: ExerciseWeightProps) => {
  const [weightInput, setWeightInput] = useState(() => normalizeWeight(weight));
  const onWeightChangeRef = useRef(onWeightChange);
  const {
    stepRef: decStepRef,
    handlers: decHandlers,
    runStep: runDecStep,
  } = useHoldStep();
  const {
    stepRef: incStepRef,
    handlers: incHandlers,
    runStep: runIncStep,
  } = useHoldStep();

  useEffect(() => {
    setWeightInput(normalizeWeight(weight));
  }, [weight]);

  useEffect(() => {
    onWeightChangeRef.current = onWeightChange;

    const applyWeightStep = (direction: 1 | -1) => {
      setWeightInput((currentWeight) => {
        const nextWeight = normalizeWeight(
          currentWeight + direction * WEIGHT_STEP
        );
        onWeightChangeRef.current(nextWeight);
        return nextWeight;
      });
    };

    decStepRef.current = () => applyWeightStep(-1);
    incStepRef.current = () => applyWeightStep(1);
  }, [onWeightChange, decStepRef, incStepRef]);

  const handleKeyStep = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    direction: 1 | -1
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (direction === 1) {
      runIncStep();
    } else {
      runDecStep();
    }
  };

  return (
    <div className="flex w-full flex-col gap-2 rounded-app-xl border border-border-subtle bg-bg-surface-1 p-4">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-text-muted">
        Peso actual
      </p>
      <div className="flex select-none items-center justify-around gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-12 w-12 touch-none rounded-full border-border-strong bg-bg-surface-2 p-0 text-text-primary hover:bg-bg-surface-3 hover:text-text-primary"
          aria-label="Bajar peso 0.5 kg"
          {...decHandlers}
          onKeyDown={(event) => handleKeyStep(event, -1)}
        >
          <Minus />
        </Button>
        <span className="min-w-[7rem] text-center text-3xl font-bold tabular-nums text-text-primary">
          {normalizeWeight(weightInput).toFixed(1)} kg
        </span>
        <Button
          type="button"
          variant="outline"
          className="h-12 w-12 touch-none rounded-full border-border-strong bg-bg-surface-2 p-0 text-text-primary hover:bg-bg-surface-3 hover:text-text-primary"
          aria-label="Subir peso 0.5 kg"
          {...incHandlers}
          onKeyDown={(event) => handleKeyStep(event, 1)}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
};

export default ExerciseWeight;
