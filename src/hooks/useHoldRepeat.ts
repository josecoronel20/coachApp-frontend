import {
  useCallback,
  useEffect,
  useRef,
  type MouseEvent,
  type PointerEventHandler,
} from "react";

/** Tiempo sostenido antes de iniciar repetición automática. */
export const HOLD_DELAY_MS = 500;

/** Intervalo fijo entre cada paso durante el hold. */
export const HOLD_REPEAT_INTERVAL_MS = 120;

type HoldElement = HTMLButtonElement;

const useHoldRepeatCore = () => {
  const holdDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdActiveRef = useRef(false);

  const clearHold = useCallback(() => {
    if (holdDelayRef.current) {
      clearTimeout(holdDelayRef.current);
      holdDelayRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    holdActiveRef.current = false;
  }, []);

  useEffect(() => () => clearHold(), [clearHold]);

  const beginHold = useCallback(
    (runStep: () => void) => {
      clearHold();

      holdDelayRef.current = setTimeout(() => {
        holdDelayRef.current = null;
        holdActiveRef.current = true;
        runStep();
        intervalRef.current = setInterval(runStep, HOLD_REPEAT_INTERVAL_MS);
      }, HOLD_DELAY_MS);
    },
    [clearHold]
  );

  const endHold = useCallback(
    (runStep: () => void) => {
      const wasRepeating = holdActiveRef.current;
      clearHold();

      if (!wasRepeating) {
        runStep();
      }
    },
    [clearHold]
  );

  return { clearHold, beginHold, endHold, holdActiveRef };
};

/**
 * Hook para botones +/- con hold: un tap suma/resta una vez;
 * mantener 0.5 s activa repetición automática.
 */
export const useHoldStep = () => {
  const stepRef = useRef<() => void>(() => {});
  const { clearHold, beginHold, endHold } = useHoldRepeatCore();
  const handlersRef = useRef<{
    onPointerDown: PointerEventHandler<HoldElement>;
    onPointerUp: PointerEventHandler<HoldElement>;
    onPointerCancel: PointerEventHandler<HoldElement>;
    onLostPointerCapture: () => void;
    onClick: (event: MouseEvent<HoldElement>) => void;
  } | null>(null);

  if (!handlersRef.current) {
    const runStep = () => stepRef.current();

    const onPointerDown: PointerEventHandler<HoldElement> = (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      beginHold(runStep);
    };

    const finishHold: PointerEventHandler<HoldElement> = (event) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      endHold(runStep);
    };

    handlersRef.current = {
      onPointerDown,
      onPointerUp: finishHold,
      onPointerCancel: finishHold,
      onLostPointerCapture: clearHold,
      onClick: (event) => event.preventDefault(),
    };
  }

  return {
    stepRef,
    clearHold,
    handlers: handlersRef.current,
    runStep: () => stepRef.current(),
  };
};
