"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, Clock, Dumbbell, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import type { SessionHistoryItem } from "@/types/sessionHistoryType";
import {
  buildExerciseHistoryMetrics,
  type ExerciseHistoryMetrics,
  type ExerciseHistoryRecord,
  type HistoryProgressStatus,
} from "@/components/reusable/history/historyMetrics";

type AthleteProgressViewProps = {
  sessions: SessionHistoryItem[];
  isLoading?: boolean;
};

const motivationalMessages: Record<HistoryProgressStatus, string> = {
  progressing: "Vas mejorando",
  ready_to_increase: "Objetivo completado",
  stable: "Seguimos construyendo",
  down: "Hoy fue mas dificil, segui registrando",
  insufficient_data: "Registra mas sesiones para ver tu progreso",
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

function getDefaultSelectedMetric(metrics: ExerciseHistoryMetrics[]): string {
  const mostTracked = metrics.reduce<ExerciseHistoryMetrics | null>(
    (selected, metric) => {
      if (!selected) return metric;
      return metric.sessionsAvailable > selected.sessionsAvailable
        ? metric
        : selected;
    },
    null
  );

  return mostTracked?.key ?? metrics[0]?.key ?? "";
}

function formatBestMark(record: ExerciseHistoryRecord | null): string {
  if (!record) return "-";

  const bestSetReps = Math.max(...record.sets.map((reps) => Number(reps || 0)));
  return `${record.weight}kg x ${bestSetReps} reps`;
}

function formatSets(record: ExerciseHistoryRecord): string {
  return record.sets.join("-");
}

function formatWeightImprovement(metric: ExerciseHistoryMetrics): string {
  const delta = metric.weightDeltaFirstToLast;

  if (delta === null || metric.sessionsAvailable < 2) {
    return "Segui registrando para medir tu mejora";
  }

  if (delta > 0) {
    return `+${delta}kg desde tu primer registro`;
  }

  if (delta < 0) {
    return "Volviendo a construir desde tu primer registro";
  }

  return "Mismo peso que tu primer registro";
}

function WeightLineChart({ records }: { records: ExerciseHistoryRecord[] }) {
  if (records.length === 0) {
    return (
      <EmptyState
        title="Sin registros para graficar"
        description="Completa una sesion para empezar a ver tu evolucion."
        className="min-h-36 py-8"
      />
    );
  }

  const width = 520;
  const height = 160;
  const padding = 24;
  const weights = records.map((record) => record.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = Math.max(1, maxWeight - minWeight);
  const xStep =
    records.length > 1 ? (width - padding * 2) / (records.length - 1) : 0;
  const points = records.map((record, index) => {
    const x = records.length > 1 ? padding + index * xStep : width / 2;
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
        className="h-40 w-full overflow-visible"
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
      <div className="mt-1 flex justify-between text-xs text-text-muted">
        <span>{formatShortDate(records[0]?.date || "")}</span>
        <span>{formatShortDate(records[records.length - 1]?.date || "")}</span>
      </div>
    </div>
  );
}

export default function AthleteProgressView({
  sessions,
  isLoading = false,
}: AthleteProgressViewProps) {
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
  const lastRecords = selectedMetric
    ? selectedMetric.records.slice().reverse().slice(0, 5)
    : [];

  return (
    <Card variant="elevated">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl text-text-primary">Mi progreso</CardTitle>
        <p className="text-sm text-text-secondary">
          Mira como viene creciendo tu entrenamiento.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <LoadingState
            title="Cargando progreso"
            description="Estamos buscando tus sesiones guardadas."
            className="py-8"
          />
        ) : metrics.length === 0 ? (
          <EmptyState
            title="Todavia no hay progreso"
            description="Cuando completes entrenamientos, vas a ver tus pesos, reps y marcas aca."
          />
        ) : (
          <>
            <div className="space-y-2">
              <label
                htmlFor="athlete-progress-exercise"
                className="text-sm font-medium text-text-primary"
              >
                Ejercicio
              </label>
              <select
                id="athlete-progress-exercise"
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
              <>
                <div className="rounded-app-2xl border border-purple-soft/25 bg-purple-primary/10 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-purple-soft">
                    <Award className="h-4 w-4" />
                    Tu mejor marca
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-text-primary">
                    {formatBestMark(selectedMetric.bestRecord)}
                  </p>
                  <p className="mt-2 text-sm text-purple-soft">
                    {formatWeightImprovement(selectedMetric)}
                  </p>
                </div>

                <div className="rounded-app-xl border border-border-subtle bg-bg-surface-2/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-app-full bg-purple-soft/15 p-2 text-purple-soft">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">
                        {motivationalMessages[selectedMetric.status]}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {selectedMetric.sessionsAvailable} registros en{" "}
                        {selectedMetric.dayLabel.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-text-primary">
                    Evolucion de peso
                  </p>
                  <WeightLineChart records={selectedMetric.records} />
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary">
                    <Clock className="h-4 w-4 text-purple-soft" />
                    Ultimas sesiones
                  </div>
                  <div className="overflow-hidden rounded-app-xl border border-border-subtle">
                    {lastRecords.map((record) => (
                      <div
                        key={`${record.sessionId}-${record.exerciseId}-${record.date}`}
                        className="grid grid-cols-[70px_1fr] gap-2 border-b border-border-subtle p-3 text-sm last:border-b-0"
                      >
                        <span className="font-medium text-text-primary">
                          {formatShortDate(record.date)}
                        </span>
                        <span className="flex items-center gap-2 text-text-secondary">
                          <Dumbbell className="h-4 w-4 text-purple-soft" />
                          {record.weight}kg - {formatSets(record)} reps
                        </span>
                        {record.athleteNotes ? (
                          <span className="col-span-2 rounded-app-lg border border-warning/25 bg-warning/10 px-3 py-2 text-xs text-text-primary">
                            {record.athleteNotes}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
