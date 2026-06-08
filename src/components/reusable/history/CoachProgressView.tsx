"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowDown, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import SessionHistoryTable from "@/components/reusable/SessionHistoryTable";
import type { SessionHistoryItem } from "@/types/sessionHistoryType";
import {
  buildExerciseHistoryMetrics,
  type ExerciseHistoryMetrics,
  type ExerciseHistoryRecord,
  type HistoryProgressStatus,
} from "@/components/reusable/history/historyMetrics";

type CoachProgressViewProps = {
  sessions: SessionHistoryItem[];
  isLoading?: boolean;
};

const statusConfig: Record<
  HistoryProgressStatus,
  { label: string; tone: string; icon: typeof Activity }
> = {
  ready_to_increase: {
    label: "Listo para subir peso",
    tone: "border-success/30 bg-success/10 text-success",
    icon: CheckCircle,
  },
  progressing: {
    label: "Progresando",
    tone: "border-info/30 bg-info/10 text-info",
    icon: TrendingUp,
  },
  stable: {
    label: "Revisar",
    tone: "border-warning/30 bg-warning/10 text-warning",
    icon: Activity,
  },
  down: {
    label: "Bajo rendimiento",
    tone: "border-danger/30 bg-danger/10 text-danger",
    icon: ArrowDown,
  },
  insufficient_data: {
    label: "Datos insuficientes",
    tone: "border-border-subtle bg-bg-surface-2 text-text-secondary",
    icon: Clock,
  },
};

function parseLocalDate(date: string): Date | null {
  const [year, month, day] = date.split("T")[0]?.split("-").map(Number) ?? [];
  if (!year || !month || !day) {
    const fallback = new Date(date);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
  return new Date(year, month - 1, day);
}

function formatShortDate(date: string): string {
  const parsed = parseLocalDate(date);
  if (!parsed) return date;
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
  }).format(parsed);
}

function formatRecord(record: ExerciseHistoryRecord | null): string {
  if (!record) return "-";
  return `${record.weight}kg / ${record.sets.join("-")} reps`;
}

function formatRange(record: ExerciseHistoryRecord | null): string {
  if (!record) return "-";
  return record.minReps === record.maxReps
    ? `${record.maxReps} reps`
    : `${record.minReps}-${record.maxReps} reps`;
}

function getCompletedDaysThisWeek(sessions: SessionHistoryItem[]): number {
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
}

function getDefaultSelectedMetric(metrics: ExerciseHistoryMetrics[]): string {
  return (
    metrics.find((metric) => metric.status === "ready_to_increase")?.key ||
    metrics.find((metric) => metric.status === "progressing")?.key ||
    metrics[0]?.key ||
    ""
  );
}

function WeightLineChart({ records }: { records: ExerciseHistoryRecord[] }) {
  if (records.length === 0) {
    return (
      <EmptyState
        title="Sin registros para graficar"
        description="Cuando el atleta guarde sesiones, vas a ver la evolucion de peso."
        className="min-h-40 py-8"
      />
    );
  }

  const width = 640;
  const height = 180;
  const padding = 24;
  const weights = records.map((record) => record.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = Math.max(1, maxWeight - minWeight);
  const xStep =
    records.length > 1 ? (width - padding * 2) / (records.length - 1) : 0;
  const points = records.map((record, index) => {
    const x =
      records.length > 1 ? padding + index * xStep : width / 2;
    const y =
      height -
      padding -
      ((record.weight - minWeight) / weightRange) * (height - padding * 2);
    return { x, y, record };
  });
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="rounded-app-xl border border-border-subtle bg-bg-surface-2/60 p-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-44 w-full overflow-visible"
        role="img"
        aria-label="Linea de peso usado por sesion"
      >
        <line
          x1={padding}
          x2={width - padding}
          y1={height - padding}
          y2={height - padding}
          stroke="rgba(255,255,255,0.12)"
        />
        {records.length > 1 ? (
          <path d={path} fill="none" stroke="#A78BFA" strokeWidth="4" />
        ) : null}
        {points.map((point) => (
          <g key={`${point.record.sessionId}-${point.record.date}`}>
            <circle cx={point.x} cy={point.y} r="6" fill="#C4B5FD" />
            <text
              x={point.x}
              y={point.y - 12}
              textAnchor="middle"
              className="fill-text-primary text-[18px] font-semibold"
            >
              {point.record.weight}kg
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-text-muted">
        <span>{formatShortDate(records[0]?.date || "")}</span>
        <span>{formatShortDate(records[records.length - 1]?.date || "")}</span>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="rounded-app-xl border border-border-subtle bg-bg-surface-2/60 p-4">
      <p className="text-xs font-semibold uppercase text-text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
      <p className="mt-1 text-xs text-text-muted">{helper}</p>
    </div>
  );
}

export default function CoachProgressView({
  sessions,
  isLoading = false,
}: CoachProgressViewProps) {
  const metrics = useMemo(() => buildExerciseHistoryMetrics(sessions), [sessions]);
  const [selectedKey, setSelectedKey] = useState("");

  useEffect(() => {
    if (metrics.length === 0) {
      setSelectedKey("");
      return;
    }

    if (!metrics.some((metric) => metric.key === selectedKey)) {
      setSelectedKey(getDefaultSelectedMetric(metrics));
    }
  }, [metrics, selectedKey]);

  const selectedMetric =
    metrics.find((metric) => metric.key === selectedKey) ?? metrics[0] ?? null;
  const readyToIncreaseCount = metrics.filter(
    (metric) => metric.status === "ready_to_increase"
  ).length;
  const reviewCount = metrics.filter(
    (metric) => metric.status === "stable" || metric.status === "down"
  ).length;
  const completedDaysThisWeek = getCompletedDaysThisWeek(sessions);
  const StatusIcon = selectedMetric
    ? statusConfig[selectedMetric.status].icon
    : Activity;

  return (
    <section className="space-y-6">
      <Card variant="elevated">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl text-text-primary">Progreso</CardTitle>
          <p className="text-sm text-text-secondary">
            Datos para decidir proximos ajustes
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {isLoading ? (
            <LoadingState
              title="Cargando progreso"
              description="Estamos buscando las sesiones guardadas del atleta."
              className="py-8"
            />
          ) : metrics.length === 0 ? (
            <EmptyState
              title="Todavia no hay sesiones"
              description="Cuando el atleta guarde entrenamientos, vas a ver senales para decidir ajustes."
            />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryCard
                  label="Dias esta semana"
                  value={completedDaysThisWeek}
                  helper="Sesiones guardadas"
                />
                <SummaryCard
                  label="Listos para subir"
                  value={readyToIncreaseCount}
                  helper="Alcanzaron max reps"
                />
                <SummaryCard
                  label="A revisar"
                  value={reviewCount}
                  helper="Estables o en baja"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="coach-progress-exercise"
                  className="text-sm font-medium text-text-primary"
                >
                  Ejercicio
                </label>
                <select
                  id="coach-progress-exercise"
                  value={selectedMetric?.key || ""}
                  onChange={(event) => setSelectedKey(event.target.value)}
                  className="h-11 w-full rounded-app-lg border border-border-subtle bg-bg-base px-3 text-sm text-text-primary outline-none focus:border-purple-soft"
                >
                  {metrics.map((metric) => (
                    <option key={metric.key} value={metric.key}>
                      {metric.exerciseName} - {metric.dayLabel}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMetric ? (
                <div className="space-y-5 rounded-app-xl border border-border-subtle bg-bg-surface-2/60 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase text-text-secondary">
                        {selectedMetric.dayLabel}
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-text-primary">
                        {selectedMetric.exerciseName}
                      </h3>
                    </div>
                    <div
                      className={`inline-flex w-fit items-center gap-2 rounded-app-full border px-3 py-1.5 text-sm font-medium ${statusConfig[selectedMetric.status].tone}`}
                    >
                      <StatusIcon className="h-4 w-4" />
                      {statusConfig[selectedMetric.status].label}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <SummaryCard
                      label="Ultimo registro"
                      value={formatRecord(selectedMetric.lastRecord)}
                      helper={
                        selectedMetric.lastRecord
                          ? formatShortDate(selectedMetric.lastRecord.date)
                          : "-"
                      }
                    />
                    <SummaryCard
                      label="Mejor registro"
                      value={formatRecord(selectedMetric.bestRecord)}
                      helper={
                        selectedMetric.bestRecord
                          ? `Volumen ${Math.round(selectedMetric.bestRecord.volume)}`
                          : "-"
                      }
                    />
                    <SummaryCard
                      label="Rango objetivo"
                      value={formatRange(selectedMetric.lastRecord)}
                      helper={`${selectedMetric.sessionsAvailable} sesiones`}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-text-primary">
                      Peso usado por sesion
                    </p>
                    <WeightLineChart records={selectedMetric.records} />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-text-primary">
                      Historial compacto
                    </p>
                    <div className="overflow-hidden rounded-app-xl border border-border-subtle">
                      {selectedMetric.records
                        .slice()
                        .reverse()
                        .map((record) => (
                          <div
                            key={`${record.sessionId}-${record.exerciseId}-${record.date}`}
                            className="grid gap-2 border-b border-border-subtle p-3 text-sm last:border-b-0 sm:grid-cols-[80px_70px_1fr_1fr]"
                          >
                            <span className="font-medium text-text-primary">
                              {formatShortDate(record.date)}
                            </span>
                            <span className="text-text-secondary">
                              Dia {record.dayIndex + 1}
                            </span>
                            <span className="text-text-primary">
                              {record.weight}kg / {record.sets.join("-")} reps
                            </span>
                            <span className="text-text-secondary">
                              {record.athleteNotes || "Sin nota"}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <SessionHistoryTable
        title="Detalle completo"
        sessions={sessions}
        isLoading={isLoading}
      />
    </section>
  );
}
