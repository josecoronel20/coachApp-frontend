"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import type {
  SessionHistoryExercise,
  SessionHistoryItem,
} from "@/types/sessionHistoryType";

type SessionHistoryTableProps = {
  title: string;
  sessions: SessionHistoryItem[];
  isLoading?: boolean;
};

type HistoryColumn = {
  id: string;
  label: string;
};

type HistoryRow = {
  key: string;
  exerciseName: string;
  dayLabel: string;
  isCurrentRoutineExercise: boolean;
  valuesBySessionId: Map<string, SessionHistoryExercise[]>;
};

function parseLocalDate(date: string): Date | null {
  const [year, month, day] = date.split("T")[0]?.split("-").map(Number) ?? [];
  if (year && month && day) {
    return new Date(year, month - 1, day);
  }

  const fallback = new Date(date);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

const formatShortDate = (date: string) => {
  const parsed = parseLocalDate(date);
  if (!parsed) return date;

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
  }).format(parsed);
};

const formatLongDate = (date: string) => {
  const parsed = parseLocalDate(date);
  if (!parsed) return "Fecha sin registrar";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const DELETED_EXERCISE_NAME = "Ejercicio eliminado";

const formatCellValue = (exercise: SessionHistoryExercise) => {
  const weight = Number.isFinite(Number(exercise.weight))
    ? `${Number(exercise.weight)}kg`
    : "-";
  const reps = exercise.sets.length > 0 ? exercise.sets.join("-") : "-";
  return `${weight} / ${reps} reps`;
};

const formatExerciseSummary = (exercise: SessionHistoryExercise) => {
  const reps = exercise.sets.length > 0 ? exercise.sets.join("-") : "-";
  const weight = Number.isFinite(Number(exercise.weight))
    ? `${Number(exercise.weight)}kg`
    : "sin peso";

  return `${exercise.exerciseName}: ${weight} / ${reps} reps`;
};

const getSessionNotes = (session: SessionHistoryItem) =>
  session.exercises
    .map((exercise) => exercise.athleteNotes.trim())
    .filter((note) => note.length > 0);

const getExerciseRowKey = (
  session: SessionHistoryItem,
  exercise: SessionHistoryExercise
) => {
  if (exercise.isCurrentRoutineExercise === false) {
    if (exercise.exerciseName === DELETED_EXERCISE_NAME) {
      return `historical-deleted-day-${session.dayIndex}`;
    }

    return exercise.exerciseId
      ? `historical-${exercise.exerciseId}`
      : `historical-${session.dayIndex}-${exercise.exerciseName}`;
  }

  return exercise.exerciseId || `${session.dayIndex}-${exercise.exerciseName}`;
};

function buildTableModel(sessions: SessionHistoryItem[]) {
  const chronologicalSessions = [...sessions].reverse();
  const columns: HistoryColumn[] = chronologicalSessions.map((session) => ({
    id: session.id,
    label: formatShortDate(session.date),
  }));
  const rowsByExercise = new Map<string, HistoryRow>();

  chronologicalSessions.forEach((session) => {
    session.exercises.forEach((exercise) => {
      const key = getExerciseRowKey(session, exercise);
      const dayLabel = `Dia ${session.dayIndex + 1}`;
      const row =
        rowsByExercise.get(key) ??
        ({
          key,
          exerciseName: exercise.exerciseName,
          dayLabel,
          isCurrentRoutineExercise: exercise.isCurrentRoutineExercise !== false,
          valuesBySessionId: new Map<string, SessionHistoryExercise[]>(),
        } satisfies HistoryRow);
      const currentValues = row.valuesBySessionId.get(session.id) ?? [];

      row.valuesBySessionId.set(session.id, [...currentValues, exercise]);
      rowsByExercise.set(key, row);
    });
  });

  const rows = Array.from(rowsByExercise.values()).sort((first, second) => {
    const byName = first.exerciseName.localeCompare(second.exerciseName);
    if (byName !== 0) return byName;
    return first.dayLabel.localeCompare(second.dayLabel);
  });

  return { columns, rows };
}

function SessionHistorySummary({ sessions }: { sessions: SessionHistoryItem[] }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Sesiones guardadas</h3>
        <p className="mt-1 text-xs text-text-secondary">
          Una tarjeta por entrenamiento guardado.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {sessions.map((session) => {
          const notes = getSessionNotes(session);
          const visibleExercises = session.exercises.slice(0, 4);
          const hiddenExerciseCount =
            session.exercises.length - visibleExercises.length;

          return (
            <article
              key={session.id}
              className="rounded-app-xl border border-border-subtle bg-bg-surface-2/60 p-4"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
                    Dia {session.dayIndex + 1}
                  </p>
                  <h4 className="mt-1 text-sm font-semibold text-text-primary">
                    {formatLongDate(session.date)}
                  </h4>
                </div>
                <span className="w-fit rounded-app-full border border-border-subtle bg-bg-surface-1 px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                  {session.exercises.length} ejercicio
                  {session.exercises.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mt-3 space-y-1.5">
                {visibleExercises.map((exercise) => (
                  <p
                    key={exercise.id}
                    className="text-sm leading-5 text-text-secondary"
                  >
                    {formatExerciseSummary(exercise)}
                  </p>
                ))}
                {hiddenExerciseCount > 0 ? (
                  <p className="text-xs text-text-muted">
                    +{hiddenExerciseCount} ejercicio
                    {hiddenExerciseCount === 1 ? "" : "s"} mas
                  </p>
                ) : null}
              </div>

              {notes.length > 0 ? (
                <div className="mt-3 rounded-app-lg border border-warning/25 bg-warning/10 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-warning">
                    Notas
                  </p>
                  <div className="mt-1 space-y-1">
                    {notes.slice(0, 2).map((note, index) => (
                      <p
                        key={`${session.id}-note-${index}`}
                        className="text-sm text-text-primary"
                      >
                        {note}
                      </p>
                    ))}
                    {notes.length > 2 ? (
                      <p className="text-xs text-warning">
                        +{notes.length - 2} nota
                        {notes.length - 2 === 1 ? "" : "s"} mas
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default function SessionHistoryTable({
  title,
  sessions,
  isLoading = false,
}: SessionHistoryTableProps) {
  const { columns, rows } = useMemo(
    () => buildTableModel(sessions),
    [sessions]
  );

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="text-base text-text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState
            title="Cargando historial"
            description="Estamos buscando las sesiones guardadas."
            className="py-8"
          />
        ) : sessions.length === 0 || columns.length === 0 || rows.length === 0 ? (
          <EmptyState
            title="Todavia no hay sesiones guardadas"
            description="Cuando el atleta finalice un entrenamiento, el historial va a aparecer aca."
          />
        ) : (
          <div className="space-y-5">
            <SessionHistorySummary sessions={sessions} />

            <div>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">
                Detalle por ejercicio
              </h3>
              <div className="overflow-x-auto rounded-app-xl border border-border-subtle">
                <table className="min-w-max border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-20 min-w-[150px] max-w-[190px] border-b border-r border-border-subtle bg-bg-surface-1 px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
                        Ejercicio
                      </th>
                      {columns.map((column) => (
                        <th
                          key={column.id}
                          className="min-w-[150px] border-b border-border-subtle bg-bg-surface-1 px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary"
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.key}>
                        <th className="sticky left-0 z-10 min-w-[150px] max-w-[190px] border-r border-t border-border-subtle bg-bg-surface-1 px-3 py-3 text-left font-medium text-text-primary">
                          <span className="line-clamp-2">{row.exerciseName}</span>
                          <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
                            {row.dayLabel}
                          </span>
                          {!row.isCurrentRoutineExercise ? (
                            <span className="mt-1 inline-flex rounded-app-full border border-warning/25 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-warning">
                              Historico
                            </span>
                          ) : null}
                        </th>
                        {columns.map((column) => {
                          const values = row.valuesBySessionId.get(column.id);

                          return (
                            <td
                              key={`${row.key}-${column.id}`}
                              className="min-w-[150px] border-t border-border-subtle px-3 py-3 text-text-secondary"
                            >
                              {values && values.length > 0 ? (
                                <div className="space-y-1">
                                  {values.map((value, index) => (
                                    <span
                                      key={`${value.id}-${index}`}
                                      className="block whitespace-nowrap"
                                    >
                                      {formatCellValue(value)}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-text-muted">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
