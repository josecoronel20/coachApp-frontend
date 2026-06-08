"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Athlete } from "@/types/athleteType";
import { deleteAthlete } from "@/app/api/protected";
import { useGetAthleteInfo } from "@/hooks/useGetAthleteInfo";
import AthleteHeader from "./components/AthleteHeader";
import AthleteSummarySidebar from "./components/AthleteSummarySidebar";
import SkeletonAthleteDetail from "./components/SkeletonAthleteDetail";
import RoutineEditorCard from "./components/RoutineEditorCard";
import { getCoachAthleteHistory } from "@/app/api/sessionHistory";
import type { SessionHistoryItem } from "@/types/sessionHistoryType";
import SendWppRutine from "@/components/reusable/SendWppRutine";

interface AthleteDetailsPageProps {
  params: Promise<{ id: string }>;
}

type AthleteDetailTab = "routine" | "progress" | "data";

const ATHLETE_DETAIL_TABS: { id: AthleteDetailTab; label: string }[] = [
  { id: "routine", label: "Rutina" },
  { id: "progress", label: "Progreso" },
  { id: "data", label: "Datos" },
];

const parseLocalDate = (date: string): Date | null => {
  const [year, month, day] = date.split("T")[0]?.split("-").map(Number) ?? [];
  if (!year || !month || !day) {
    const fallback = new Date(date);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
  return new Date(year, month - 1, day);
};

const getCompletedDaysThisWeek = (sessions: SessionHistoryItem[]) => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  const day = weekStart.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  weekStart.setDate(weekStart.getDate() - daysSinceMonday);

  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setDate(weekStart.getDate() + 7);

  const completed = new Set<number>();
  sessions.forEach((session) => {
    const date = parseLocalDate(session.date);
    if (date && date >= weekStart && date < nextWeekStart) {
      completed.add(session.dayIndex);
    }
  });

  return completed.size;
};

const formatHistoryDate = (date: string) => {
  const parsedDate = parseLocalDate(date);
  if (!parsedDate) return "Fecha sin registrar";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};

const formatExerciseRecord = (
  exercise: SessionHistoryItem["exercises"][number]
) => {
  const reps = exercise.sets.length > 0 ? exercise.sets.join("-") : "sin reps";
  return `${exercise.exerciseName}: ${exercise.weight}kg / ${reps}`;
};

const AthleteProgressTab = ({
  history,
  isLoading,
}: {
  history: SessionHistoryItem[];
  isLoading: boolean;
}) => {
  const recentSessions = history.slice(0, 5);

  if (isLoading) {
    return (
      <section className="rounded-[24px] border border-white/[0.08] bg-[#17181D] p-5 text-sm text-[#A1A1AA] px-5 py-5">
        Cargando progreso del atleta...
      </section>
    );
  }

  if (recentSessions.length === 0) {
    return (
      <section className="rounded-[24px] border border-dashed border-white/[0.12] bg-[#17181D] p-6 text-center px-5 py-5">
        <h2 className="text-lg font-semibold text-white">Progreso</h2>
        <p className="mt-2 text-sm text-[#A1A1AA]">
          Todavia no hay progreso registrado para este atleta.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border border-white/[0.08] bg-[#17181D] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.26)] m-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Progreso</h2>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Ultimas sesiones registradas con datos reales del atleta.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {recentSessions.map((session) => (
          <article
            key={session.id}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold text-white">
                Dia {session.dayIndex + 1}
              </h3>
              <p className="text-xs text-[#A1A1AA]">
                {formatHistoryDate(session.date)}
              </p>
            </div>

            <div className="mt-3 space-y-1.5">
              {session.exercises.slice(0, 4).map((exercise) => (
                <p key={exercise.id} className="text-sm text-[#D4D4D8]">
                  {formatExerciseRecord(exercise)}
                </p>
              ))}
              {session.exercises.length > 4 ? (
                <p className="text-xs text-[#A1A1AA]">
                  +{session.exercises.length - 4} ejercicio
                  {session.exercises.length - 4 === 1 ? "" : "s"} mas
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const AthleteDetailSummary = ({
  athlete,
  history,
  activeTab,
  onTabChange,
}: {
  athlete: Athlete;
  history: SessionHistoryItem[];
  activeTab: AthleteDetailTab;
  onTabChange: (tab: AthleteDetailTab) => void;
}) => {
  const routineDays = athlete.routine.length;
  const totalExercises = athlete.routine.reduce(
    (total, day) => total + day.length,
    0
  );
  const notesToReview = athlete.routine.reduce(
    (total, day) =>
      total + day.reduce((count, exercise) => count + (exercise.athleteNotes ? 1 : 0), 0),
    0
  );
  const completedThisWeek = getCompletedDaysThisWeek(history);

  const items = [
    {
      label: `${completedThisWeek}/${routineDays || 0} dias`,
      helper: "esta semana",
      tone: "purple",
    },
    {
      label: `${notesToReview} notas`,
      helper: notesToReview ? "por revisar" : "sin pendientes",
      tone: "amber",
    },
    {
      label: `${totalExercises} ejercicios`,
      helper: `${routineDays} dias de rutina`,
      tone: "green",
    },
  ];

  return (
    <section className=" bg-[#101116]/88 p-3 shadow-[0_18px_70px_rgba(0,0,0,0.20)] sm:p-4">
      <div className="flex gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={
              item.tone === "green"
                ? "rounded-full border border-[#22C55E]/25 bg-[#22C55E]/10 px-3 py-1.5 w-full text-center"
                : item.tone === "amber"
                ? "rounded-full border border-[#F59E0B]/25 bg-[#F59E0B]/10 px-3 py-1.5 w-full text-center"
                : "rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 px-3 py-1.5 w-full text-center"
            }
          >
            <p className="text-xs font-semibold text-white">
              {item.label}
            </p>
            <p className="text-[11px] text-[#A1A1AA]">{item.helper}</p>
          </div>
        ))}
      </div>

      <nav
        aria-label="Tabs del detalle del atleta"
        role="tablist"
        className="mt-4 flex gap-7 overflow-x-auto border-t border-white/[0.08] pt-3"
      >
        {ATHLETE_DETAIL_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
            className={
              activeTab === item.id
                ? "min-w-fit border-b-2 border-[#8B5CF6] pb-2 text-sm font-semibold text-white"
                : "min-w-fit pb-2 text-sm font-semibold text-[#A1A1AA] transition hover:text-white"
            }
          >
            {item.label}
          </button>
        ))}
      </nav>
    </section>
  );
};

/**
 * Página de detalles del atleta dentro del dashboard del coach.
 */
const AthleteDetailsPage = ({ params }: AthleteDetailsPageProps) => {
  const router = useRouter();
  const { id: athleteId } = React.use(params);

  const { data, isLoading, mutate } = useGetAthleteInfo(athleteId);
  const athlete = data as Athlete | undefined;
  const [history, setHistory] = React.useState<SessionHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<AthleteDetailTab>("routine");

  React.useEffect(() => {
    let cancelled = false;
    setHistoryLoading(true);
    getCoachAthleteHistory(athleteId)
      .then((sessions) => {
        if (!cancelled) setHistory(sessions);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [athleteId]);

  const handleDeleteAthlete = async () => {
    if (!athlete) return;

    const response = await deleteAthlete(athlete.id);
    if (response.ok) {
      router.push("/dashboard");
    }
  };

  if (isLoading || !athlete) {
    return <SkeletonAthleteDetail />;
  }

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F5F7]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(139,92,246,0.16),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(168,85,247,0.12),transparent_28%)]" />

      <div className="relative">
        <AthleteHeader athlete={athlete} />

        <main className="mx-auto flex w-full max-w-[1200px] flex-col  sm:px-8 lg:gap-7 lg:py-7">
          <AthleteDetailSummary
            athlete={athlete}
            history={history}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === "routine" ? (
            <div className="space-y-4 px-5 py-5">
               <div className="rounded-[24px] border border-[#22C55E]/20 bg-[#22C55E]/10 p-3">
                <SendWppRutine athlete={athlete} />
              </div>
              <RoutineEditorCard
                athleteId={athlete.id}
                initialRoutine={athlete.routine}
              />
             
            </div>
          ) : null}

          {activeTab === "progress" ? (
            <AthleteProgressTab history={history} isLoading={historyLoading} />
          ) : null}

          {activeTab === "data" ? (
            <div className="min-w-0">
              <AthleteSummarySidebar
                athlete={athlete}
                onDelete={handleDeleteAthlete}
                onPaymentSaved={() => mutate()}
                onAthleteUpdated={() => mutate()}
              />
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default AthleteDetailsPage;
