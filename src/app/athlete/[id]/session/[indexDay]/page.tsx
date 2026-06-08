"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Lock,
  X,
} from "lucide-react";
import ExerciseView from "@/app/athlete/[id]/session/[indexDay]/sessionComponents/ExerciseView";
import {
  useAthleteSessionStore,
  ExerciseDef,
  SessionExercise,
} from "@/store/useAthleteSessionStore";
import { useAthleteStore } from "@/store/useAthleteStore";
import { getAthleteById, saveSession } from "@/app/api/athlete";
import { getPublicAthleteHistory } from "@/app/api/sessionHistory";
import { getApiErrorMessage } from "@/lib/apiError";
import { normalizeRoutine } from "@/lib/routineExercise";
import {
  buildLatestExerciseHistoryByExerciseId,
  getLatestExerciseHistory,
} from "@/lib/sessionHistoryRoutine";
import { checkPaymentStatus } from "@/lib/paymentUtils";
import {
  createClientSessionId,
  enqueuePendingSession,
  isRetryableSessionSaveFailure,
  listPendingSessions,
  syncPendingSessions,
} from "@/lib/pendingSessionQueue";
import { AthleteHomeSkeleton } from "@/components/loading/AthleteHomeSkeleton";
import { ImpruVLogo } from "@/components/brand/ImpruVLogo";
import { AthleteStatusNotice } from "@/components/reusable/AthleteStatusNotice";
import type { ExerciseHistory } from "@/types/routineType";
import {
  ATHLETE_LEGACY_CACHE_KEY,
  getCompletedDaysCacheKey,
  getSessionDraftKey,
  readOfflineJson,
  removeOfflineItem,
  writeOfflineJson,
} from "@/lib/athleteOfflineStorage";
import { useDisableBrowserGestures } from "@/hooks/useDisableBrowserGestures";

const SESSION_DRAFT_VERSION = 2;

type SessionDraft = {
  version: 1 | typeof SESSION_DRAFT_VERSION;
  athleteId: string;
  dayIndex: number;
  routineDayLabel?: string;
  currentExerciseIndex: number;
  sessionProgress: SessionExercise[];
  startedAt?: string;
  lastSavedLocallyAt?: string;
  updatedAt?: string;
};

type SyncNotice = {
  message: string;
  tone: "info" | "success" | "warning";
};

type SessionStatusNotice = {
  message: string;
  tone: "info" | "success" | "warning" | "error";
};

const offlineTrainingNotice =
  "Sin conexión. Podés seguir entrenando. La sesión se enviará cuando vuelva internet.";

const readSessionDraft = (key: string): SessionDraft | null => {
  return readOfflineJson<SessionDraft>(key);
};

const writeSessionDraft = (key: string, draft: SessionDraft) => {
  writeOfflineJson(key, draft);
};

const clearSessionDraft = (key: string) => {
  removeOfflineItem(key);
};

const rememberCompletedDay = (athleteId: string, dayIndex: number) => {
  const key = getCompletedDaysCacheKey(athleteId);
  const existingHints =
    readOfflineJson<Array<{ dayIndex: number; date: string }>>(key) ?? [];
  const nextHints = Array.isArray(existingHints) ? existingHints : [];

  nextHints.push({
    dayIndex,
    date: new Date().toISOString(),
  });

  writeOfflineJson(key, nextHints);
};

const isCompatibleDraft = (
  draft: SessionDraft | null,
  athleteId: string,
  dayIndex: number,
  exerciseDefs: ExerciseDef[]
): draft is SessionDraft => {
  if (
    !draft ||
    (draft.version !== 1 && draft.version !== SESSION_DRAFT_VERSION) ||
    draft.athleteId !== athleteId ||
    draft.dayIndex !== dayIndex ||
    draft.sessionProgress.length !== exerciseDefs.length
  ) {
    return false;
  }

  return draft.sessionProgress.every((entry, index) => {
    const exercise = exerciseDefs[index];
    return (
      entry.exerciseId === exercise.exerciseId &&
      Array.isArray(entry.sets) &&
      entry.sets.length === exercise.setsCount
    );
  });
};

const SessionPage = () => {
  const params = useParams();
  const router = useRouter();
  const athleteId = params.id as string;
  const indexDay = parseInt(params.indexDay as string) - 1;

  const [isClient, setIsClient] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingSaveNotice, setPendingSaveNotice] = useState<string | null>(
    null
  );
  const [syncNotice, setSyncNotice] = useState<SyncNotice | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [sessionHistoryReady, setSessionHistoryReady] = useState(false);
  const [latestHistoryByExerciseId, setLatestHistoryByExerciseId] = useState<
    Map<string, ExerciseHistory>
  >(() => new Map());

  const {
    sessionProgress,
    sessionMeta,
    initSession,
    restoreSession,
    setReps,
    setWeight,
    updateAthleteNotes,
    nextExercise,
    prevExercise,
    cancelSession,
    finalizeSession,
  } = useAthleteSessionStore();

  const { athlete, setAthlete } = useAthleteStore();

  const sessionDraftKey = useMemo(
    () => getSessionDraftKey(athleteId, indexDay),
    [athleteId, indexDay]
  );

  const paymentStatus = useMemo(() => {
    if (!athlete) return null;
    return checkPaymentStatus(athlete.paymentDate);
  }, [athlete]);

  useDisableBrowserGestures(sessionMeta.sessionActive);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    };

    updateOnlineStatus();
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const getPendingMessage = (pendingCount: number) =>
      pendingCount === 1
        ? "1 sesión pendiente de sincronizar."
        : `${pendingCount} sesiones pendientes de sincronizar.`;

    const runSync = async () => {
      const pendingBeforeSync = listPendingSessions().length;

      if (pendingBeforeSync === 0) {
        return;
      }

      setSyncNotice({
        message: getPendingMessage(pendingBeforeSync),
        tone: "info",
      });

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return;
      }

      setSyncNotice({
        message: "Sincronizando sesión pendiente...",
        tone: "info",
      });

      const syncResult = await syncPendingSessions();

      if (syncResult.skipped) {
        return;
      }

      if (syncResult.synced > 0 && syncResult.pending === 0) {
        setSyncNotice({
          message: "Sesión sincronizada correctamente.",
          tone: "success",
        });
        return;
      }

      if (syncResult.failed > 0 || syncResult.pending > 0) {
        setSyncNotice({
          message: "No se pudo sincronizar todavía. Lo intentaremos nuevamente.",
          tone: "warning",
        });
      }
    };

    const handleOnline = () => {
      void runSync();
    };

    void runSync();
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !athleteId) return;

    let cancelled = false;
    setSessionHistoryReady(false);

    getPublicAthleteHistory(athleteId)
      .then((sessions) => {
        if (!cancelled) {
          setLatestHistoryByExerciseId(
            buildLatestExerciseHistoryByExerciseId(sessions)
          );
        }
      })
      .finally(() => {
        if (!cancelled) setSessionHistoryReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [athleteId, isClient]);

  useEffect(() => {
    if (!isClient || !athlete || isSaving || !sessionHistoryReady) return;

    const dayExercises = athlete.routine[indexDay] || [];
    const exerciseDefs: ExerciseDef[] = dayExercises
      .filter(
        (exercise): exercise is typeof exercise & { id: string } =>
          typeof exercise.id === "string" && exercise.id.length > 0
      )
      .map((exercise) => {
        const lastHistory = getLatestExerciseHistory(
          exercise,
          latestHistoryByExerciseId
        );
        return {
          exerciseId: exercise.id,
          setsCount: exercise.sets,
          minReps: exercise.minReps,
          maxReps: exercise.maxReps,
          weight: lastHistory?.weight || 0,
          lastHistory: lastHistory ?? undefined,
        };
      });

    const draft = readSessionDraft(sessionDraftKey);

    if (isCompatibleDraft(draft, athleteId, indexDay, exerciseDefs)) {
      restoreSession(
        indexDay,
        draft.sessionProgress,
        draft.currentExerciseIndex
      );
      return;
    }

    initSession(indexDay, exerciseDefs);
  }, [
    isClient,
    athlete,
    athleteId,
    indexDay,
    initSession,
    restoreSession,
    isSaving,
    latestHistoryByExerciseId,
    sessionDraftKey,
    sessionHistoryReady,
  ]);

  useEffect(() => {
    if (
      !isClient ||
      isSaving ||
      !sessionMeta.sessionActive ||
      sessionMeta.dayIndex !== indexDay ||
      sessionProgress.length === 0
    ) {
      return;
    }

    const existingDraft = readSessionDraft(sessionDraftKey);
    const now = new Date().toISOString();

    writeSessionDraft(sessionDraftKey, {
      version: SESSION_DRAFT_VERSION,
      athleteId,
      dayIndex: indexDay,
      routineDayLabel: `Dia ${indexDay + 1}`,
      currentExerciseIndex: sessionMeta.currentExerciseIndex,
      sessionProgress,
      startedAt: existingDraft?.startedAt || existingDraft?.updatedAt || now,
      lastSavedLocallyAt: now,
      updatedAt: now,
    });
  }, [
    isClient,
    isSaving,
    athleteId,
    indexDay,
    sessionDraftKey,
    sessionMeta.currentExerciseIndex,
    sessionMeta.dayIndex,
    sessionMeta.sessionActive,
    sessionProgress,
  ]);

  if (!isClient) {
    return <AthleteHomeSkeleton />;
  }

  if (!athlete || !paymentStatus) {
    return <AthleteHomeSkeleton />;
  }

  if (!paymentStatus.isUpToDate) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-base p-4 text-text-primary">
        <Card className="w-full max-w-md space-y-4 rounded-app-2xl border-border-subtle bg-bg-surface-1 p-6 shadow-elevation-3">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-app-full bg-danger/10 p-3">
              <Lock className="size-8 text-danger" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-text-primary">
              Acceso restringido
            </h2>
            <p className="text-text-secondary">
              Tu acceso a la sesión de entrenamiento está bloqueado
              temporalmente.
            </p>
          </div>

          <div className="space-y-2 rounded-app-xl border border-danger/25 bg-danger/10 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-danger" />
              <div className="space-y-1">
                <p className="font-medium text-danger">Pago pendiente</p>
                <p className="text-sm text-text-secondary">
                  {paymentStatus.message}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <p className="text-center text-sm text-text-secondary">
              Por favor, contacta a tu entrenador para regularizar tu situacion
              de pago y recuperar el acceso a tu rutina.
            </p>
          </div>

          <Button
            onClick={() => router.push(`/athlete/${athleteId}`)}
            variant="outline"
            className="w-full rounded-app-full border-border-strong bg-bg-surface-2 text-text-primary hover:bg-bg-surface-3 hover:text-text-primary"
          >
            Volver a la rutina
          </Button>
        </Card>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="flex h-dvh items-center justify-center bg-bg-base">
        <div className="text-center">
          <p className="text-text-secondary">Guardando sesión...</p>
        </div>
      </div>
    );
  }

  if (pendingSaveNotice) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-base p-4 text-text-primary">
        <Card className="w-full max-w-md space-y-4 rounded-app-2xl border-border-subtle bg-bg-surface-1 p-6 text-center shadow-elevation-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-app-full bg-warning/10 text-warning">
            <CheckCircle className="size-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-text-primary">
              Sesión guardada en este dispositivo
            </h2>
            <p className="text-sm text-text-secondary">{pendingSaveNotice}</p>
          </div>
          <Button
            type="button"
            onClick={() => router.replace(`/athlete/${athleteId}`)}
            className="w-full rounded-app-full bg-purple-primary text-white shadow-purple-glow hover:bg-purple-bright"
          >
            Volver a la rutina
          </Button>
        </Card>
      </div>
    );
  }

  if (!sessionMeta.sessionActive || sessionProgress.length === 0) {
    return (
      <div className="flex h-dvh items-center justify-center bg-bg-base">
        <div className="text-center">
          <p className="text-text-secondary">Inicializando sesión...</p>
        </div>
      </div>
    );
  }

  const currentExerciseIndex = sessionMeta.currentExerciseIndex;
  const currentExercise = athlete.routine[indexDay][currentExerciseIndex];
  const currentSessionExercise = sessionProgress[currentExerciseIndex];

  const handleSetReps = (setIndex: number, reps: number) => {
    setReps(currentExerciseIndex, setIndex, reps);
  };

  const handleSetWeight = (weight: number) => {
    setWeight(currentExerciseIndex, weight);
  };

  const handleSetAthleteNotes = (notes: string) => {
    updateAthleteNotes(currentExerciseIndex, notes);
  };

  const handleFinalizeSession = async () => {
    setSaveError(null);
    setPendingSaveNotice(null);
    setIsSaving(true);
    const clientSessionId = createClientSessionId();
    const sessionProgressSnapshot = sessionProgress.map((entry) => ({
      ...entry,
      sets: [...entry.sets],
      athleteNotes: entry.athleteNotes || "",
    }));

    const enqueueFinishedSession = () => {
      enqueuePendingSession({
        id: athleteId,
        dayIndex: indexDay,
        clientSessionId,
        sessionProgress: sessionProgressSnapshot,
      });
      clearSessionDraft(sessionDraftKey);
      rememberCompletedDay(athleteId, indexDay);
      finalizeSession();
      setPendingSaveNotice(
        "Se enviará automáticamente cuando vuelva la conexión."
      );
      setIsSaving(false);
    };

    try {
      const response = await saveSession(
        athleteId,
        indexDay,
        sessionProgressSnapshot,
        clientSessionId
      );

      if (response.ok) {
        clearSessionDraft(sessionDraftKey);
        rememberCompletedDay(athleteId, indexDay);
        finalizeSession();
        const updatedResponse = await getAthleteById(athleteId);

        if (updatedResponse.ok) {
          const updatedAthlete = await updatedResponse.json();
          updatedAthlete.routine = normalizeRoutine(
            updatedAthlete.routine || []
          );
          setAthlete(updatedAthlete);
          writeOfflineJson(ATHLETE_LEGACY_CACHE_KEY, updatedAthlete);
        }

        router.replace(`/athlete/${athleteId}`);
        return;
      }

      if (isRetryableSessionSaveFailure(response)) {
        enqueueFinishedSession();
        return;
      }

      const message = await getApiErrorMessage(
        response,
        "No se pudo guardar la sesión. Revisá los datos e intentá de nuevo."
      );
      setSaveError(message);
      setIsSaving(false);
      console.error("Error al finalizar sesion:", message);
    } catch (error) {
      console.error("Error al finalizar sesion:", error);
      enqueueFinishedSession();
    }
  };

  const handleCancelSession = () => {
    setSaveError(null);
    clearSessionDraft(sessionDraftKey);
    cancelSession();
    router.replace(`/athlete/${athleteId}`);
  };

  const isLastExercise = currentExerciseIndex === sessionProgress.length - 1;
  const isFirstExercise = currentExerciseIndex === 0;
  const statusNotices: SessionStatusNotice[] = [];

  if (saveError) {
    statusNotices.push({ message: saveError, tone: "error" });
  } else {
    if (!isOnline) {
      statusNotices.push({
        message: offlineTrainingNotice,
        tone: "warning",
      });
    }

    if (syncNotice) {
      statusNotices.push(syncNotice);
    }

  }

  const visibleStatusNotices = statusNotices.slice(0, 2);

  return (
    <div
      className="flex h-dvh select-none touch-manipulation flex-col bg-bg-base text-text-primary"
      onContextMenu={(event) => event.preventDefault()}
    >
      {/* Watermark branding — pasivo, no interactivo */}
      {/* Header de sesión */}
      <div className="flex-shrink-0 border-b border-border-subtle bg-bg-base/90 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              Día {indexDay + 1} · Ejercicio {currentExerciseIndex + 1}/{sessionProgress.length}
            </p>
            <p className="mt-0.5 truncate text-base font-bold text-text-primary">
              {currentExercise.exercise}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsCancelDialogOpen(true)}
            disabled={isSaving}
            className="shrink-0 rounded-app-full px-3 text-xs text-text-muted hover:bg-bg-surface-2 hover:text-text-secondary"
          >
            <X className="mr-1 size-4" />
            Cancelar
          </Button>
        </div>
        {/* Barra de progreso */}
        <div className="mt-2 h-1 w-full overflow-hidden rounded-app-full bg-bg-surface-3">
          <div
            className="h-full rounded-app-full bg-purple-primary transition-all duration-300"
            style={{
              width: `${((currentExerciseIndex + 1) / sessionProgress.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="border-border-subtle bg-bg-surface-2 text-text-primary">
          <DialogHeader>
            <DialogTitle className="text-text-primary">¿Cancelar sesión?</DialogTitle>
            <DialogDescription className="text-text-secondary">
              Se perderán los cambios no guardados de esta sesión.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              className="rounded-app-full border-border-strong bg-bg-surface-1 text-text-secondary hover:text-text-primary"
            >
              Volver
            </Button>
            <Button
              type="button"
              onClick={handleCancelSession}
              className="rounded-app-full bg-danger text-white hover:opacity-90"
            >
              Cancelar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex-1 overflow-y-auto pb-[calc(9rem+env(safe-area-inset-bottom))]">
        <ExerciseView
          exerciseIndex={currentExerciseIndex}
          exerciseDefinition={{
            name: currentExercise.exercise,
            setsCount: currentExercise.sets,
            minReps: currentExercise.minReps,
            maxReps: currentExercise.maxReps,
            coachNotes: currentExercise.coachNotes,
            athleteNotes: currentSessionExercise.athleteNotes,
            weight: currentSessionExercise.weight,
            lastHistory:
              getLatestExerciseHistory(
                currentExercise,
                latestHistoryByExerciseId
              ) ?? undefined,
          }}
          sessionExercise={currentSessionExercise}
          onSetReps={handleSetReps}
          onSetWeight={handleSetWeight}
          onSetAthleteNotes={handleSetAthleteNotes}
        />
      </div>

      {visibleStatusNotices.length > 0 ? (
        <div className="mx-4 mb-2 space-y-2">
          {visibleStatusNotices.map((notice) => (
            <AthleteStatusNotice
              key={`${notice.tone}-${notice.message}`}
              message={notice.message}
              tone={notice.tone}
              className="p-3"
            />
          ))}
        </div>
      ) : null}

      <div className="app-fixed-bottom fixed bottom-0 left-0 right-0 flex-shrink-0 border-t border-border-subtle bg-bg-base/90 px-4 pt-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={prevExercise}
              disabled={isFirstExercise}
              className="rounded-app-full border-border-strong bg-bg-surface-1 text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary disabled:opacity-40"
            >
              <ChevronLeft className="mr-1 size-4" />
              Anterior
            </Button>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-app-full border border-border-subtle bg-bg-surface-1/80">
              <ImpruVLogo size={26} />
            </div>

            <Button
              size="sm"
              onClick={isLastExercise ? handleFinalizeSession : nextExercise}
              className={
                isLastExercise
                  ? "rounded-app-full bg-success px-6 text-white hover:opacity-90"
                  : "rounded-app-full bg-purple-primary px-6 text-white shadow-purple-glow hover:bg-purple-bright"
              }
              disabled={isSaving}
            >
              {isLastExercise ? (
                <>
                  <CheckCircle className="mr-1 size-4" />
                  Finalizar sesión
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="ml-1 size-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionPage;
