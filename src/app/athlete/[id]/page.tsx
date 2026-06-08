"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Lock,
} from "lucide-react";
import { useAthleteStore } from "@/store/useAthleteStore";
import BodyWeight from "./athleteViewComponents/BodyWeight";
import { checkPaymentStatus } from "@/lib/paymentUtils";
import { AthleteHomeSkeleton } from "@/components/loading/AthleteHomeSkeleton";
import { getPublicAthleteHistory } from "@/app/api/sessionHistory";
import AthleteProgressView from "@/components/reusable/history/AthleteProgressView";
import type { SessionHistoryItem } from "@/types/sessionHistoryType";
import type { Exercise, ExerciseHistory } from "@/types/routineType";
import { formatRepRangeLabel } from "@/lib/routineExercise";
import {
  buildLatestExerciseHistoryByExerciseId,
  getLatestExerciseHistory,
} from "@/lib/sessionHistoryRoutine";
import {
  listPendingSessions,
  syncPendingSessions,
} from "@/lib/pendingSessionQueue";
import { AthleteStatusNotice } from "@/components/reusable/AthleteStatusNotice";
import { ImpruVWordmark } from "@/components/brand/ImpruVWordmark";
import {
  getCompletedDaysCacheKey,
  readOfflineJson,
  writeOfflineJson,
} from "@/lib/athleteOfflineStorage";

type CompletedDayHint = {
  dayIndex: number;
  date: string;
};

type SyncNotice = {
  message: string;
  tone: "info" | "success" | "warning";
};

const offlineTrainingNotice =
  "Sin conexión. Podés seguir entrenando. La sesión se enviará cuando vuelva internet.";

function parseLocalDate(date: string) {
  const [year, month, day] = date.split("T")[0]?.split("-").map(Number) ?? [];

  if (!year || !month || !day) {
    const fallback = new Date(date);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  return new Date(year, month - 1, day);
}

function getCurrentWeekRange(referenceDate = new Date()) {
  const weekStart = new Date(referenceDate);
  weekStart.setHours(0, 0, 0, 0);
  const day = weekStart.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  weekStart.setDate(weekStart.getDate() - daysSinceMonday);

  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setDate(weekStart.getDate() + 7);

  return { weekStart, nextWeekStart };
}

function getCompletedDayIndexesThisWeek(sessions: SessionHistoryItem[]) {
  const { weekStart, nextWeekStart } = getCurrentWeekRange();
  const completedDayIndexes = new Set<number>();

  sessions.forEach((session) => {
    const sessionDate = parseLocalDate(session.date);
    if (!sessionDate) return;

    if (sessionDate >= weekStart && sessionDate < nextWeekStart) {
      completedDayIndexes.add(session.dayIndex);
    }
  });

  return completedDayIndexes;
}

function getCompletedDayIndexesFromHints(hints: CompletedDayHint[]) {
  const { weekStart, nextWeekStart } = getCurrentWeekRange();
  const completedDayIndexes = new Set<number>();

  hints.forEach((hint) => {
    const completedDate = parseLocalDate(hint.date);
    if (!completedDate) return;

    if (completedDate >= weekStart && completedDate < nextWeekStart) {
      completedDayIndexes.add(hint.dayIndex);
    }
  });

  return completedDayIndexes;
}

function readCompletedDayHints(athleteId: string): CompletedDayHint[] {
  const parsed = readOfflineJson<CompletedDayHint[]>(
    getCompletedDaysCacheKey(athleteId)
  );
  if (!Array.isArray(parsed)) return [];

  return parsed.filter(
    (hint) => Number.isInteger(hint.dayIndex) && typeof hint.date === "string"
  );
}

function writeCompletedDayHintsFromHistory(
  athleteId: string,
  sessions: SessionHistoryItem[]
) {
  const hints = sessions.map((session) => ({
    dayIndex: session.dayIndex,
    date: session.date,
  }));

  writeOfflineJson(getCompletedDaysCacheKey(athleteId), hints);
}

function getExerciseItemKey(
  exercise: Exercise,
  dayIndex: number,
  exerciseIndex: number
) {
  return exercise.id ?? `${dayIndex}-${exerciseIndex}`;
}

function AthleteRoutineExerciseItem({
  exercise,
  isExpanded,
  onToggle,
  latestHistoryByExerciseId,
}: {
  exercise: Exercise;
  isExpanded: boolean;
  onToggle: () => void;
  latestHistoryByExerciseId: Map<string, ExerciseHistory>;
}) {
  const lastSession = getLatestExerciseHistory(
    exercise,
    latestHistoryByExerciseId
  );
  const hasPreviousWeight =
    lastSession !== null && Number.isFinite(Number(lastSession.weight));
  const hasPreviousReps =
    lastSession !== null &&
    Array.isArray(lastSession.sets) &&
    lastSession.sets.length > 0;

  return (
    <div className="rounded-app-2xl border border-border-subtle bg-bg-surface-2/70 p-4 shadow-elevation-0 transition hover:border-purple-soft/35 hover:bg-bg-surface-2">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-text-primary">
          {exercise.exercise}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 rounded-app-full px-3 text-xs text-purple-soft hover:bg-purple-primary/10 hover:text-purple-soft"
          onClick={onToggle}
          aria-expanded={isExpanded}
        >
          {isExpanded ? "Ver menos" : "Ver mas"}
          {isExpanded ? (
            <ChevronUp className="ml-1 size-4" />
          ) : (
            <ChevronDown className="ml-1 size-4" />
          )}
        </Button>
      </div>

      {isExpanded ? (
        <div className="mt-3 grid gap-2 text-sm text-text-secondary">
          <div className="flex items-center justify-between gap-3">
            <span className="text-text-muted">Series</span>
            <Badge variant="neutral">{exercise.sets}</Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-text-muted">Rango</span>
            <Badge variant="purple">{formatRepRangeLabel(exercise)}</Badge>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-text-muted">Ultimo peso</span>
            <span className="text-right font-medium text-text-primary">
              {hasPreviousWeight ? `${lastSession.weight}kg` : "Sin peso previo"}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-text-muted">Ultimas reps</span>
            <span className="text-right font-medium text-text-primary">
              {hasPreviousReps
                ? lastSession.sets.join("-")
                : "Sin registros previos"}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const AthletePage = () => {
  const params = useParams();
  const router = useRouter();
  const athleteId = params.id as string;

  const [isClient, setIsClient] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"routine" | "progress">("routine");
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [syncNotice, setSyncNotice] = useState<SyncNotice | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [completedDayHints, setCompletedDayHints] = useState<
    CompletedDayHint[]
  >([]);
  const [expandedExerciseKey, setExpandedExerciseKey] = useState<string | null>(
    null
  );

  const { athlete } = useAthleteStore();

  const paymentStatus = useMemo(() => {
    if (!athlete) return null;
    return checkPaymentStatus(athlete.paymentDate);
  }, [athlete]);
  const completedDayIndexes = useMemo(() => {
    const completedFromHistory = getCompletedDayIndexesThisWeek(history);
    const completedFromHints =
      getCompletedDayIndexesFromHints(completedDayHints);

    completedFromHints.forEach((dayIndex) =>
      completedFromHistory.add(dayIndex)
    );

    return completedFromHistory;
  }, [completedDayHints, history]);
  const latestHistoryByExerciseId = useMemo(
    () => buildLatestExerciseHistoryByExerciseId(history),
    [history]
  );

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
    if (!athleteId) return;

    let cancelled = false;

    const getPendingMessage = (pendingCount: number) =>
      pendingCount === 1
        ? "1 sesión pendiente de sincronizar."
        : `${pendingCount} sesiones pendientes de sincronizar.`;

    const attemptPendingSessionSync = async () => {
      const pendingBeforeSync = listPendingSessions().length;

      if (pendingBeforeSync === 0) {
        return;
      }

      if (!cancelled) {
        setSyncNotice({
          message: getPendingMessage(pendingBeforeSync),
          tone: "info",
        });
      }

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return;
      }

      if (!cancelled) {
        setSyncNotice({
          message: "Sincronizando sesión pendiente...",
          tone: "info",
        });
      }

      const syncResult = await syncPendingSessions();

      if (cancelled || syncResult.skipped) {
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

    const loadHistory = async () => {
      setCompletedDayHints(readCompletedDayHints(athleteId));
      setHistoryLoading(true);

      try {
        await attemptPendingSessionSync();

        const sessions = await getPublicAthleteHistory(athleteId);
        if (!cancelled) {
          setHistory(sessions);
          setCompletedDayHints(
            sessions.map((session) => ({
              dayIndex: session.dayIndex,
              date: session.date,
            }))
          );
          writeCompletedDayHintsFromHistory(athleteId, sessions);
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };

    const handleOnline = () => {
      void loadHistory();
    };

    void loadHistory();
    window.addEventListener("online", handleOnline);

    return () => {
      cancelled = true;
      window.removeEventListener("online", handleOnline);
    };
  }, [athleteId]);

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
              Tu acceso a la rutina de entrenamiento esta bloqueado
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
        </Card>
      </div>
    );
  }

  const handleDaySelect = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    setExpandedExerciseKey(null);
  };

  const handleStartTraining = () => {
    router.push(`/athlete/${athleteId}/session/${selectedDayIndex + 1}`);
  };

  const selectedDayExercises = athlete.routine[selectedDayIndex] || null;
  const statusNotices = [
    !isOnline
      ? {
          message: offlineTrainingNotice,
          tone: "warning" as const,
        }
      : null,
    syncNotice,
  ].filter(
    (notice): notice is { message: string; tone: SyncNotice["tone"] } =>
      notice !== null
  );

  return (
    <div className="relative isolate min-h-dvh bg-bg-base text-text-primary">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_80%_0%,rgba(139,92,246,0.22),transparent_34%),radial-gradient(circle_at_0%_18%,rgba(168,85,247,0.12),transparent_28%),#08090B]" />
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col gap-6 overflow-hidden rounded-b-[28px] border-x border-border-subtle/40 bg-bg-base/70 shadow-elevation-3">
        <header className="border-b border-border-subtle bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(139,92,246,0.12),rgba(8,9,11,0.92))] p-5 pt-2 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <ImpruVWordmark size="md" color="#F5F5F7" />
          </div>

          <div className="mt-2 grid grid-cols-3 gap-5 items-center sm:grid-cols-2 sm:items-end sm:justify-between">
            <div className="col-span-2 flex flex-col items-start justify-start">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-purple-soft opacity-60">
                Rutina por link
              </p>
              <h1 className=" text-4xl font-extrabold leading-none text-text-primary sm:text-5xl">
                {athlete.name}
              </h1>
            </div>
            <div className="flex items-center ">
              <BodyWeight />
            </div>
          </div>
          {statusNotices.length > 0 ? (
            <div className="mt-4 space-y-2">
              {statusNotices.map((notice) => (
                <AthleteStatusNotice
                  key={`${notice.tone}-${notice.message}`}
                  message={notice.message}
                  tone={notice.tone}
                />
              ))}
            </div>
          ) : null}
        </header>

        <Tabs className="mx-5">
          <TabsList className="grid w-full grid-cols-2 border-border-strong bg-bg-surface-1/80 p-1.5 shadow-elevation-1">
            <TabsTrigger
              active={activeTab === "routine"}
              onClick={() => setActiveTab("routine")}
              className="h-11 text-base"
            >
              Rutina
            </TabsTrigger>
            <TabsTrigger
              active={activeTab === "progress"}
              onClick={() => setActiveTab("progress")}
              className="h-11 text-base"
            >
              Progreso
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "routine" ? (
          <TabsPanel>
            <div className="flex flex-col items-center gap-5 px-5">
              <h2 className="text-center text-2xl font-extrabold text-text-primary">
                Rutina de entrenamiento
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {athlete.routine.map((_, dayIndex) => {
                  const isSelected = selectedDayIndex === dayIndex;
                  const isCompletedThisWeek =
                    completedDayIndexes.has(dayIndex);

                  return (
                    <Button
                      key={dayIndex}
                      variant={isSelected ? "default" : "ghost"}
                      className={
                        isCompletedThisWeek
                          ? "h-11 w-fit rounded-app-full border border-success/35 bg-success/10 px-5 text-base text-success hover:bg-success/15 hover:text-success"
                          : isSelected
                          ? "h-11 w-fit rounded-app-full bg-purple-primary px-5 text-base text-white shadow-purple-glow hover:bg-purple-bright"
                          : "h-11 w-fit rounded-app-full border border-border-strong bg-bg-surface-1 px-5 text-base text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary"
                      }
                      onClick={() => handleDaySelect(dayIndex)}
                    >
                      {isCompletedThisWeek ? (
                        <CheckCircle className="mr-1 size-4" />
                      ) : null}
                      Dia {dayIndex + 1}
                    </Button>
                  );
                })}
              </div>
            </div>

            {selectedDayExercises ? (
              <div className="m-5 mb-28 space-y-5 rounded-[28px] border border-purple-soft/30 bg-bg-surface-1/75 p-5 shadow-elevation-3 backdrop-blur-xl sm:p-7">
                <div>
                  <h2 className="text-3xl font-extrabold text-text-primary">
                    Dia {selectedDayIndex + 1}
                  </h2>
                  <div className="mt-2 h-1 w-16 rounded-app-full bg-purple-primary shadow-purple-glow" />
                </div>

                <div className="space-y-3">
                  {selectedDayExercises.map((exercise, exerciseIndex) => (
                    <AthleteRoutineExerciseItem
                      key={getExerciseItemKey(
                        exercise,
                        selectedDayIndex,
                        exerciseIndex
                      )}
                      exercise={exercise}
                      latestHistoryByExerciseId={latestHistoryByExerciseId}
                      isExpanded={
                        expandedExerciseKey ===
                        getExerciseItemKey(
                          exercise,
                          selectedDayIndex,
                          exerciseIndex
                        )
                      }
                      onToggle={() => {
                        const itemKey = getExerciseItemKey(
                          exercise,
                          selectedDayIndex,
                          exerciseIndex
                        );
                        setExpandedExerciseKey((current) =>
                          current === itemKey ? null : itemKey
                        );
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </TabsPanel>
        ) : (
          <TabsPanel className="px-4 pb-8">
            <AthleteProgressView
              sessions={history}
              isLoading={historyLoading}
            />
          </TabsPanel>
        )}
      </div>

      {activeTab === "routine" && selectedDayExercises ? (
        <div className="app-fixed-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-border-subtle bg-bg-base/90 px-4 pt-4 backdrop-blur-xl">
          <div className="mx-auto w-full max-w-2xl">
            <Button
              onClick={handleStartTraining}
              className="h-14 w-full rounded-app-xl bg-purple-primary text-lg font-extrabold text-white shadow-purple-glow hover:bg-purple-bright"
            >
              Empezar entrenamiento
              <ChevronRight className="ml-2 size-5" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AthletePage;
