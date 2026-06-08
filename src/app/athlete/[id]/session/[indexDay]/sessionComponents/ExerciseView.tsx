"use client";

import SetCard from "./SetCard";
import { SessionExercise } from "@/store/useAthleteSessionStore";
import ExerciseWeight from "./ExerciseWeight";
import AthleteNotes from "./AthleteNotes";
import { useAthleteStore } from "@/store/useAthleteStore";
import { formatRepRangeLabel } from "@/lib/routineExercise";
import { ExerciseMediaButton } from "@/components/exercise-media/ExerciseMediaButton";

interface ExerciseDefinition {
  name: string;
  setsCount: number;
  minReps: number;
  maxReps: number;
  coachNotes?: string;
  athleteNotes?: string;
  weight?: number;
  lastHistory?: {
    weight: number;
    sets: number[];
  };
}

interface ExerciseViewProps {
  exerciseIndex: number;
  exerciseDefinition: ExerciseDefinition;
  sessionExercise: SessionExercise;
  onSetReps: (setIndex: number, reps: number) => void;
  onSetWeight: (weight: number) => void;
  onSetAthleteNotes: (notes: string) => void;
}

/**
 * Componente que renderiza la vista de un ejercicio individual
 * Maneja la edición de peso y reps para cada set
 */
const ExerciseView = ({
  exerciseDefinition,
  sessionExercise,
  onSetReps,
  onSetWeight,
  onSetAthleteNotes,
}: ExerciseViewProps) => {
  const { athlete } = useAthleteStore();
  const repsTracked = athlete?.repsTracked ?? false;

  const handleSetReps = (setIndex: number, newReps: number) => {
    onSetReps(setIndex, newReps);
  };

  const repRangeLabel = formatRepRangeLabel(exerciseDefinition);
  

  return (
    <div className="space-y-4 p-4">

      {/* Nombre del ejercicio */}
      <div>
        <div className="flex items-start gap-2">
          <h1 className="text-2xl font-bold text-text-primary leading-tight">
            {exerciseDefinition.name}
          </h1>
          <ExerciseMediaButton key={exerciseDefinition.name} exerciseName={exerciseDefinition.name} />
        </div>
        {repsTracked && (
          <p className="mt-1 text-sm text-text-muted">
            Objetivo: <span className="text-text-secondary font-medium">
              {exerciseDefinition.minReps}–{exerciseDefinition.maxReps} reps
            </span>
          </p>
        )}
      </div>

      {/* Peso + referencia última sesión */}
      <div
        className={`${
          repsTracked && exerciseDefinition.lastHistory
            ? "grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2"
            : "grid grid-cols-1 gap-3"
        }`}
      >
        {/* Referencia última sesión */}
        {exerciseDefinition.lastHistory && repsTracked && (
          <div className="rounded-app-xl border border-border-subtle bg-bg-surface-1 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
              Última sesión
            </p>
            <div className="flex flex-col gap-1 text-sm">
              <p className="text-text-secondary">
                Peso:{" "}
                <span className="font-semibold text-text-primary">
                  {exerciseDefinition.lastHistory.weight} kg
                </span>
              </p>
              <p className="text-text-secondary">
                Reps:{" "}
                <span className="font-semibold text-text-primary">
                  {exerciseDefinition.lastHistory.sets.join(" · ")}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Campo de peso */}
        <ExerciseWeight
          weight={
            sessionExercise.weight ??
            exerciseDefinition.lastHistory?.weight ??
            0
          }
          onWeightChange={onSetWeight}
        />
      </div>

      {/* Nota del entrenador */}
      {exerciseDefinition.coachNotes && (
        <div className="rounded-app-xl border border-border-subtle bg-bg-surface-1 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Nota del entrenador
          </p>
          <p className="text-sm text-text-secondary">
            {exerciseDefinition.coachNotes}
          </p>
        </div>
      )}

      {/* Series y reps */}
      {repsTracked ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-text-secondary">
            Series y repeticiones
          </p>
          <div className="space-y-2">
            {sessionExercise.sets.map((reps, setIndex) => (
              <SetCard
                key={setIndex}
                value={reps}
                onInc={() => handleSetReps(setIndex, reps + 1)}
                onDec={() => handleSetReps(setIndex, reps - 1)}
                min={-99999}
                max={99999}
                label={`Serie ${setIndex + 1}`}
                minReps={exerciseDefinition.minReps}
                maxReps={exerciseDefinition.maxReps}
              />
            ))}
          </div>

          {/* Aviso: listo para subir carga */}
          {sessionExercise.sets.length > 0 &&
            sessionExercise.sets.every(
              (r) => r >= exerciseDefinition.maxReps
            ) && (
              <div className="flex items-center gap-2 rounded-app-xl border border-success/30 bg-success/10 px-4 py-3">
                <span className="text-lg">🏋️</span>
                <p className="text-sm font-semibold text-success">
                  ¡Subí el peso! Volvé a {exerciseDefinition.minReps} reps
                </p>
              </div>
            )}
        </div>
      ) : (
        <div className="rounded-app-xl border border-border-subtle bg-bg-surface-1 p-4">
          <p className="text-sm text-text-secondary">
            Objetivo de reps:{" "}
            <span className="font-semibold text-text-primary">{repRangeLabel}</span>
          </p>
        </div>
      )}

      <AthleteNotes
        notes={exerciseDefinition.athleteNotes}
        onNotesChange={onSetAthleteNotes}
      />
    </div>
  );
};

export default ExerciseView;
