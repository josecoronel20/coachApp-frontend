"use client";

import { useEffect, useState } from "react";
import { Info, Loader2, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getExerciseMedia, type ExerciseMediaDto } from "@/app/api/exerciseMedia";

type FetchState = "idle" | "loading" | "found" | "not-found" | "error";

// ─── Representación multimedia ───────────────
// El objetivo es mostrar la representación multimedia principal del ejercicio
// (puede ser GIF, video, imagen, según se implemente en media.gifUrl o similares)
function MultimediaRepresentation({
  media,
  exerciseName,
}: {
  media: ExerciseMediaDto;
  exerciseName: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [media.gifUrl]);

  if (!media) return null;
  if (media.gifUrl) {
    if (imageFailed) {
      return (
        <div className="rounded-app-xl border border-border-subtle bg-bg-surface-2 p-5 text-center text-sm text-text-muted">
          No pudimos cargar la imagen de este ejercicio.
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-app-xl border border-border-subtle bg-bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.gifUrl}
          alt={`Demostración de ${exerciseName}`}
          className="mx-auto block max-h-72 w-full object-contain"
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }
  // Espacio para futuro: si hay video o formato diferente, agregar else-if aquí
  return (
    <div className="rounded-app-xl border border-border-subtle bg-bg-surface-2 p-5 text-center text-sm text-text-muted">
      Todavia no hay imagen cargada para este ejercicio.
    </div>
  );
}
// ─── Fin representación multimedia ───────────

export function ExerciseMediaButton({ exerciseName }: { exerciseName: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FetchState>("idle");
  const [media, setMedia] = useState<ExerciseMediaDto | null>(null);

  const handleOpen = async () => {
    setOpen(true);

    // Si ya tenemos datos, no re-fetchear
    if (state === "found" || state === "not-found") return;

    setState("loading");
    const result = await getExerciseMedia(exerciseName);

    if (result === null) {
      setState("not-found");
    } else {
      setMedia(result);
      setState("found");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Ver información sobre ${exerciseName}`}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-app-full text-text-muted transition hover:bg-bg-surface-2 hover:text-text-secondary active:scale-95"
      >
        <Info className="size-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-border-subtle bg-bg-surface-1 text-text-primary sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="pr-6 text-base font-semibold leading-snug text-text-primary">
              {exerciseName}
            </DialogTitle>
          </DialogHeader>

          {/* Loading */}
          {state === "loading" && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-purple-soft" />
            </div>
          )}

          {/* Not found */}
          {(state === "not-found" || state === "error") && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-app-full bg-bg-surface-2">
                <Dumbbell className="size-6 text-text-muted" />
              </div>
              <p className="text-sm text-text-muted">
                No hay información disponible para este ejercicio todavía.
              </p>
            </div>
          )}

          {/* Found */}
          {state === "found" && media && (
            <div className="space-y-5">
              {/* Representación multimedia */}
              <MultimediaRepresentation media={media} exerciseName={exerciseName} />

              {/* Músculos */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Músculos
                </p>
                <div className="flex flex-wrap gap-2">
                  {media.targetMuscle && (
                    <Badge variant="purple">{media.targetMuscle}</Badge>
                  )}
                  {media.secondaryMuscles.map((m) => (
                    <Badge key={m} variant="neutral">{m}</Badge>
                  ))}
                </div>
              </div>

              {/* Instrucciones */}
              {media.instructions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Cómo hacerlo
                  </p>
                  <ol className="space-y-2">
                    {media.instructions.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-purple-primary/15 text-xs font-bold text-purple-soft">
                          {i + 1}
                        </span>
                        <p className="text-sm leading-6 text-text-secondary">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
