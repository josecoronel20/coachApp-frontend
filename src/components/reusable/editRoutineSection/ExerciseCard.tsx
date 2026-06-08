import { useState } from "react";
import { Exercise, ExerciseHistory, Routine } from "@/types/routineType";
import DialogExerciseCard from "./DialogExerciseCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { DeleteButton } from "../DeleteButton";
import { updateRoutine } from "@/app/api/protected";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  formatRepRangeLabel,
  normalizeExerciseForEditor,
} from "@/lib/routineExercise";
import { getLatestExerciseHistory } from "@/lib/sessionHistoryRoutine";
import { ExerciseMediaButton } from "@/components/exercise-media/ExerciseMediaButton";

interface ExerciseCardProps {
  exercise: Exercise;
  indexExercise: number;
  indexDay: number;
  routine: Routine;
  setRoutine: (routine: Routine) => void;
  athleteId: string;
  isNewRoutine: boolean;
  latestHistoryByExerciseId?: Map<string, ExerciseHistory>;
}

const ExerciseCard = ({
  exercise,
  indexExercise,
  routine,
  setRoutine,
  indexDay,
  athleteId,
  isNewRoutine,
  latestHistoryByExerciseId,
}: ExerciseCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const normalizedExercise = normalizeExerciseForEditor(exercise);

  const lastSession = getLatestExerciseHistory(
    exercise,
    latestHistoryByExerciseId
  );

  const handleDeleteExercise = async () => {
    if (isNewRoutine) {
      const nextRoutine = routine.map((day, dIdx) =>
        dIdx === indexDay ? day.filter((_, eIdx) => eIdx !== indexExercise) : day
      );
      setRoutine(nextRoutine);
      return;
    }

    const previousRoutine = routine.map((day) => day.map((ex) => ({ ...ex })));
    const nextRoutine = routine.map((day, dIdx) =>
      dIdx === indexDay ? day.filter((_, eIdx) => eIdx !== indexExercise) : day
    );

    setDeleteError(null);
    setRoutine(nextRoutine);

    try {
      const response = await updateRoutine(athleteId, nextRoutine);
      if (!response.ok) {
        const message = await getApiErrorMessage(response, "No se pudo eliminar el ejercicio.");
        setRoutine(previousRoutine);
        setDeleteError(message);
        return;
      }
      const body = (await response.json()) as { routine?: Routine };
      setRoutine(body.routine || nextRoutine);
    } catch {
      setRoutine(previousRoutine);
      setDeleteError("Error de conexión al eliminar el ejercicio.");
    }
  };

  return (
    <div
      key={`${indexDay}-${indexExercise}`}
      className="flex-1 rounded-app-xl border border-border-subtle bg-bg-surface-2 p-4 shadow-elevation-0 transition-colors hover:border-border-strong hover:bg-bg-surface-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex w-full flex-col gap-3 text-sm">
          <div className="flex w-full items-start justify-between gap-3 text-base">
            <div className="min-w-0">
              <div className="flex items-start gap-1.5">
                <h4 className="line-clamp-2 font-semibold text-text-primary">
                  {exercise.exercise}
                </h4>
                <ExerciseMediaButton exerciseName={exercise.exercise} />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="purple">{exercise.sets} series</Badge>
                <Badge variant="neutral">
                  {formatRepRangeLabel(normalizedExercise)}
                </Badge>
                <Badge variant="outline">
                  {(lastSession && lastSession.weight ? lastSession.weight : 0) +
                    " kg"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <DeleteButton
                label="ejercicio"
                handleDelete={() => handleDeleteExercise()}
              />
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-app-full text-text-secondary hover:text-text-primary"
                title="Editar ejercicio"
                aria-label="Editar ejercicio"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="size-4" />
              </Button>
            </div>
          </div>

          {lastSession !== null && lastSession.sets && (
            <p className="text-sm text-text-secondary">
              <span className="font-medium text-text-primary">Reps actuales:</span>{" "}
              {lastSession.sets.join(" - ")}
            </p>
          )}

          {exercise.coachNotes && exercise.coachNotes.trim() !== "" && (
            <p className="rounded-app-lg border border-info/25 bg-info/10 p-3 text-sm text-text-secondary">
              <span className="font-medium text-info">Nota del entrenador:</span>{" "}
              {exercise.coachNotes}
            </p>
          )}

          {exercise.athleteNotes && exercise.athleteNotes.trim() !== "" && (
            <p className="rounded-app-lg border border-warning/25 bg-warning/10 p-3 text-sm text-text-secondary">
              <span className="font-medium text-warning">Nota del atleta:</span>{" "}
              {exercise.athleteNotes}
            </p>
          )}

          {deleteError && (
            <p className="mt-1 text-xs text-destructive">{deleteError}</p>
          )}
        </div>
      </div>

      {isEditing && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4" />
            </Button>
          </DialogTrigger>

          <DialogExerciseCard
            exercise={exercise}
            indexExercise={indexExercise}
            indexDay={indexDay}
            setIsEditing={setIsEditing}
            routine={routine}
            lastSession={lastSession}
            setRoutine={setRoutine}
            closeDialog={() => setIsEditing(false)}
            athleteId={athleteId}
            isNewRoutine={isNewRoutine}
          />
        </Dialog>
      )}
    </div>
  );
};

export default ExerciseCard;
