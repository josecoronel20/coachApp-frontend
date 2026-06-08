"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Edit,
  Library,
  Plus,
  Search,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { StatusBanner } from "@/components/ui/status-banner";
import EditRoutineSection from "@/components/reusable/editRoutineSection/EditRoutineSection";
import { getAllAthletes } from "@/app/api/coach";
import {
  assignSavedRoutine,
  createSavedRoutine,
  deleteSavedRoutine,
  listSavedRoutines,
  updateSavedRoutine,
} from "@/app/api/savedRoutines";
import { getApiErrorMessage } from "@/lib/apiError";
import type { Athlete } from "@/types/athleteType";
import type { Routine } from "@/types/routineType";
import type { SavedRoutine } from "@/types/savedRoutineType";

// ─── Types ────────────────────────────────────────────────────────────────────

type EditorState = {
  mode: "create" | "edit";
  routineId?: string;
  name: string;
  routine: Routine;
};

type DeleteState = { id: string; name: string } | null;

type AssignResult = { athleteId: string; athleteName: string } | null;

type SavedRoutinesSectionProps = { variant?: "section" | "page" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const createEmptyRoutine = (): Routine => [[]];

const cloneRoutine = (routine: Routine): Routine =>
  routine.map((day) =>
    day.map((exercise) => ({ ...exercise, exerciseHistory: null, athleteNotes: "" }))
  );

const formatUpdatedAt = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

// ─── Shared dialog class constants ────────────────────────────────────────────

const DIALOG_CANCEL_CLASS =
  "rounded-full border-border-strong bg-bg-surface-2 text-text-primary hover:bg-bg-surface-3 hover:text-text-primary";

const DIALOG_PRIMARY_CLASS =
  "rounded-full bg-purple-primary text-white hover:bg-purple-bright";

// ─── Main component ───────────────────────────────────────────────────────────

const SavedRoutinesSection = ({ variant = "section" }: SavedRoutinesSectionProps) => {
  const router = useRouter();
  const isPage = variant === "page";

  const [savedRoutines, setSavedRoutines] = useState<SavedRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [editorErrorMessage, setEditorErrorMessage] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>(null);
  const [assignRoutine, setAssignRoutine] = useState<SavedRoutine | null>(null);
  const [assignAthletes, setAssignAthletes] = useState<Athlete[]>([]);
  const [assignSearch, setAssignSearch] = useState("");
  const [selectedAthleteId, setSelectedAthleteId] = useState("");
  const [assignResult, setAssignResult] = useState<AssignResult>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingAthletes, setIsLoadingAthletes] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const gridClass = isPage
    ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";

  const loadSavedRoutines = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await listSavedRoutines();
      if (!response.ok) {
        setErrorMessage(await getApiErrorMessage(response, "No se pudieron cargar las rutinas guardadas."));
        return;
      }
      const body = (await response.json()) as { routines?: SavedRoutine[] };
      setSavedRoutines(body.routines || []);
    } catch (error) {
      console.error("Error al cargar rutinas guardadas:", error);
      setErrorMessage("Error de conexion al cargar rutinas guardadas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadSavedRoutines(); }, [loadSavedRoutines]);

  const openCreateEditor = () => {
    setErrorMessage(null);
    setSavedMessage(null);
    setEditorErrorMessage(null);
    setEditor({ mode: "create", name: "", routine: createEmptyRoutine() });
  };

  const openEditEditor = (routine: SavedRoutine) => {
    setErrorMessage(null);
    setSavedMessage(null);
    setEditorErrorMessage(null);
    setEditor({ mode: "edit", routineId: routine.id, name: routine.name, routine: cloneRoutine(routine.routine) });
  };

  const selectedAthlete = useMemo(
    () => assignAthletes.find((a) => a.id === selectedAthleteId),
    [assignAthletes, selectedAthleteId]
  );

  const selectedAthleteHasRoutine = Boolean(selectedAthlete?.routine?.length);

  const filteredAssignAthletes = useMemo(() => {
    const query = assignSearch.trim().toLowerCase();
    if (!query) return assignAthletes;
    return assignAthletes.filter((a) =>
      [a.name, a.email, a.phone].filter(Boolean).some((v) => v.toLowerCase().includes(query))
    );
  }, [assignAthletes, assignSearch]);

  const openAssignModal = async (routine: SavedRoutine) => {
    setAssignRoutine(routine);
    setAssignSearch("");
    setSelectedAthleteId("");
    setErrorMessage(null);
    setIsLoadingAthletes(true);
    try {
      const response = await getAllAthletes();
      if (!response.ok) {
        setErrorMessage(await getApiErrorMessage(response, "No se pudieron cargar los atletas."));
        return;
      }
      setAssignAthletes((await response.json()) as Athlete[]);
    } catch (error) {
      console.error("Error al cargar atletas para asignar rutina:", error);
      setErrorMessage("Error de conexion al cargar atletas.");
    } finally {
      setIsLoadingAthletes(false);
    }
  };

  const openAssignFromEditor = () => {
    if (!editor?.routineId) return;
    const routine = savedRoutines.find((r) => r.id === editor.routineId);
    if (routine) void openAssignModal(routine);
  };

  const handleSaveEditor = async () => {
    if (!editor || isSaving) return;
    const name = editor.name.trim();
    if (!name) { setEditorErrorMessage("El nombre de la rutina es obligatorio."); return; }

    setIsSaving(true);
    setErrorMessage(null);
    setSavedMessage(null);
    setEditorErrorMessage(null);

    try {
      const response = editor.mode === "create"
        ? await createSavedRoutine({ name, routine: editor.routine })
        : await updateSavedRoutine(editor.routineId!, { name, routine: editor.routine });

      if (!response.ok) {
        setEditorErrorMessage(await getApiErrorMessage(response, "No se pudo guardar la rutina."));
        return;
      }

      const body = (await response.json()) as { routine?: SavedRoutine };
      if (body.routine) {
        setSavedRoutines((cur) => [body.routine!, ...cur.filter((r) => r.id !== body.routine!.id)]);
      } else {
        await loadSavedRoutines();
      }
      setSavedMessage(
        editor.mode === "create"
          ? `Plantilla "${name}" creada. Ya aparece en Rutinas guardadas.`
          : `Rutina "${name}" actualizada.`
      );
      setEditor(null);
    } catch (error) {
      console.error("Error al guardar rutina guardada:", error);
      setEditorErrorMessage("Error de conexion al guardar la rutina.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoutine = async () => {
    if (!deleteState || isDeleting) return;
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      const response = await deleteSavedRoutine(deleteState.id);
      if (!response.ok) {
        setErrorMessage(await getApiErrorMessage(response, "No se pudo eliminar la rutina."));
        return;
      }
      setSavedRoutines((cur) => cur.filter((r) => r.id !== deleteState.id));
      setDeleteState(null);
    } catch (error) {
      console.error("Error al eliminar rutina guardada:", error);
      setErrorMessage("Error de conexion al eliminar la rutina.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAssignRoutine = async () => {
    if (!assignRoutine || !selectedAthlete || isAssigning) return;
    setIsAssigning(true);
    setErrorMessage(null);
    try {
      const response = await assignSavedRoutine(assignRoutine.id, {
        athleteId: selectedAthlete.id,
        replaceExisting: selectedAthleteHasRoutine,
      });
      if (!response.ok) {
        setErrorMessage(await getApiErrorMessage(response, "No se pudo asignar la rutina."));
        return;
      }
      const body = (await response.json()) as { athlete?: { id: string; name: string } };
      setAssignRoutine(null);
      setAssignResult({
        athleteId: body.athlete?.id || selectedAthlete.id,
        athleteName: body.athlete?.name || selectedAthlete.name,
      });
    } catch (error) {
      console.error("Error al asignar rutina guardada:", error);
      setErrorMessage("Error de conexion al asignar la rutina.");
    } finally {
      setIsAssigning(false);
    }
  };

  const closeAssignModal = () => {
    if (isAssigning) return;
    setAssignRoutine(null);
    setAssignSearch("");
    setSelectedAthleteId("");
  };

  return (
    <section
      className={
        isPage
          ? "space-y-6"
          : "rounded-app-2xl border border-border-subtle bg-bg-surface-1 p-5 shadow-elevation-2"
      }
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-app-xl border border-purple-primary/20 bg-purple-primary/10 text-purple-soft">
              <Library className="size-5" />
            </div>
            <h1 className={isPage ? "text-2xl font-bold text-text-primary sm:text-3xl" : "text-xl font-semibold text-text-primary"}>
              Rutinas guardadas
            </h1>
          </div>
          <p className={isPage ? "max-w-2xl text-base leading-7 text-text-secondary" : "max-w-2xl text-sm text-text-secondary"}>
            Crea plantillas base para asignarlas rápido a tus atletas. Después podés ajustar cada rutina desde el perfil del atleta.
          </p>
        </div>
        <Button type="button" onClick={openCreateEditor} className={isPage ? "h-12 rounded-app-full px-6 text-base" : "rounded-app-full"}>
          <Plus className="size-4" />
          + Crear rutina
        </Button>
      </div>

      {errorMessage && <StatusBanner variant="danger" message={errorMessage} className="mt-4" />}
      {savedMessage && <StatusBanner variant="success" message={savedMessage} className="mt-4" />}

      {/* Routine grid */}
      <div className="mt-5">
        {isLoading ? (
          <div className={gridClass}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-app-2xl border border-border-subtle bg-bg-surface-1 shadow-elevation-1" />
            ))}
          </div>
        ) : savedRoutines.length === 0 ? (
          <EmptyState
            icon={<Library className="size-5" />}
            title="Todavia no hay rutinas guardadas"
            description="Guarda rutinas base para reutilizarlas con nuevos atletas."
            action={
              <Button type="button" onClick={openCreateEditor} className="rounded-app-full">
                <Plus className="size-4" />
                Crear primera rutina
              </Button>
            }
            className={isPage ? "shadow-elevation-2" : undefined}
          />
        ) : (
          <div className={gridClass}>
            {savedRoutines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onEdit={() => openEditEditor(routine)}
                onAssign={() => void openAssignModal(routine)}
                onDelete={() => setDeleteState({ id: routine.id, name: routine.name })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <EditorDialog
        editor={editor}
        setEditor={setEditor}
        editorErrorMessage={editorErrorMessage}
        setEditorErrorMessage={setEditorErrorMessage}
        isSaving={isSaving}
        onSave={handleSaveEditor}
        onAssignFromEditor={openAssignFromEditor}
      />
      <DeleteDialog
        deleteState={deleteState}
        setDeleteState={setDeleteState}
        isDeleting={isDeleting}
        onDelete={handleDeleteRoutine}
      />
      <AssignDialog
        assignRoutine={assignRoutine}
        onClose={closeAssignModal}
        assignSearch={assignSearch}
        setAssignSearch={setAssignSearch}
        filteredAthletes={filteredAssignAthletes}
        isLoadingAthletes={isLoadingAthletes}
        selectedAthleteId={selectedAthleteId}
        setSelectedAthleteId={setSelectedAthleteId}
        selectedAthlete={selectedAthlete}
        selectedAthleteHasRoutine={selectedAthleteHasRoutine}
        isAssigning={isAssigning}
        onAssign={handleAssignRoutine}
      />
      <AssignSuccessDialog
        assignResult={assignResult}
        onClose={() => setAssignResult(null)}
        onViewAthlete={(id) => router.push(`/dashboard/athlete/${id}`)}
      />
    </section>
  );
};

export default SavedRoutinesSection;

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoutineCard({
  routine,
  onEdit,
  onAssign,
  onDelete,
}: {
  routine: SavedRoutine;
  onEdit: () => void;
  onAssign: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();
  const updatedAt = formatUpdatedAt(routine.updatedAt);
  return (
    <Card variant="interactive" className="min-h-44 py-0 shadow-elevation-1">
      <CardContent className="flex h-full flex-col justify-between gap-5 p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-base font-semibold text-text-primary">{routine.name}</h3>
            <Badge variant="purple" className="shrink-0">{routine.daysCount} dias</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral">{routine.exercisesCount} ejercicios aprox.</Badge>
            {updatedAt && (
              <Badge variant="outline">
                <CalendarDays className="size-3" />
                {updatedAt}
              </Badge>
            )}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/routines/${routine.id}/edit`)}
            aria-label={`Editar rutina ${routine.name}`}
            className="h-9 rounded-app-full"
          >
            <Edit className="size-3.5" />
            Editar
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onAssign} aria-label={`Asignar rutina ${routine.name}`} className="h-9 rounded-app-full border-purple-primary/25 bg-purple-primary/10 text-purple-soft hover:bg-purple-primary/15 hover:text-text-primary">
            <UserPlus className="size-3.5" />
            Asignar
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onDelete} aria-label={`Eliminar rutina ${routine.name}`} className="h-9 rounded-app-full border-danger/25 bg-danger/10 text-danger hover:bg-danger/15 hover:text-danger">
            <Trash2 className="size-3.5" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EditorDialog({
  editor,
  setEditor,
  editorErrorMessage,
  setEditorErrorMessage,
  isSaving,
  onSave,
  onAssignFromEditor,
}: {
  editor: EditorState | null;
  setEditor: (v: EditorState | null) => void;
  editorErrorMessage: string | null;
  setEditorErrorMessage: (v: string | null) => void;
  isSaving: boolean;
  onSave: () => void;
  onAssignFromEditor: () => void;
}) {
  const title = editor?.mode === "create" ? "Crear plantilla base" : "Editar rutina guardada";
  const description = editor?.mode === "create"
    ? "Crea una rutina plantilla independiente. Al guardar no se asigna a ningun atleta."
    : "Esta rutina se usa como base. Al asignarla a un atleta, se crea una copia editable para ese atleta.";

  return (
    <Dialog open={editor !== null} onOpenChange={(open) => !open && setEditor(null)}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-border-subtle bg-bg-surface-1 text-text-primary sm:max-w-3xl">
        {editor && (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="text-text-secondary">{description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {editorErrorMessage && (
                <p className="rounded-2xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
                  {editorErrorMessage}
                </p>
              )}

              <div>
                <label className="text-sm font-medium text-text-primary">Nombre de rutina</label>
                <Input
                  value={editor.name}
                  onChange={(e) => {
                    setEditorErrorMessage(null);
                    setEditor({ ...editor, name: e.target.value });
                  }}
                  placeholder="Ej: Push Pull Legs 5 dias"
                  className="mt-1 border-border-strong bg-bg-surface-2 text-text-primary placeholder:text-text-muted"
                />
              </div>

              {editor.mode === "create" && (
                <div className="rounded-2xl border border-purple-primary/20 bg-purple-primary/10 p-3 text-sm text-purple-soft">
                  Esta plantilla queda guardada para reutilizarla despues. Para
                  enviarla a un atleta, usa la accion Asignar desde la card.
                </div>
              )}

              <div className="rounded-2xl border border-border-subtle bg-bg-surface-2/60 p-4">
                <EditRoutineSection
                  routine={editor.routine}
                  setRoutine={(next) => setEditor({ ...editor, routine: cloneRoutine(next) })}
                  isNewRoutine
                  athleteId=""
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              {editor.mode === "edit" && (
                <Button type="button" variant="outline" onClick={onAssignFromEditor} disabled={isSaving}
                  className="rounded-full border-purple-primary/20 bg-purple-primary/10 text-purple-soft hover:bg-purple-primary/15 hover:text-text-primary">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Asignar
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setEditor(null)} disabled={isSaving} className={DIALOG_CANCEL_CLASS}>
                Cancelar
              </Button>
              <Button type="button" onClick={onSave} disabled={isSaving} className={DIALOG_PRIMARY_CLASS}>
                {isSaving ? "Guardando..." : editor.mode === "create" ? "Crear plantilla" : "Guardar rutina"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  deleteState,
  setDeleteState,
  isDeleting,
  onDelete,
}: {
  deleteState: DeleteState;
  setDeleteState: (v: DeleteState) => void;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  return (
    <Dialog open={deleteState !== null} onOpenChange={(open) => !open && setDeleteState(null)}>
      <DialogContent className="border-border-subtle bg-bg-surface-2 text-text-primary">
        <DialogHeader>
          <DialogTitle>¿Eliminar rutina guardada?</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Esta acción elimina la rutina guardada seleccionada. No modifica rutinas ya creadas en atletas.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setDeleteState(null)} disabled={isDeleting} className={DIALOG_CANCEL_CLASS}>
            Volver
          </Button>
          <Button type="button" onClick={onDelete} disabled={isDeleting} className="rounded-full bg-danger text-white hover:bg-danger/90">
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignDialog({
  assignRoutine,
  onClose,
  assignSearch,
  setAssignSearch,
  filteredAthletes,
  isLoadingAthletes,
  selectedAthleteId,
  setSelectedAthleteId,
  selectedAthlete,
  selectedAthleteHasRoutine,
  isAssigning,
  onAssign,
}: {
  assignRoutine: SavedRoutine | null;
  onClose: () => void;
  assignSearch: string;
  setAssignSearch: (v: string) => void;
  filteredAthletes: Athlete[];
  isLoadingAthletes: boolean;
  selectedAthleteId: string;
  setSelectedAthleteId: (v: string) => void;
  selectedAthlete: Athlete | undefined;
  selectedAthleteHasRoutine: boolean;
  isAssigning: boolean;
  onAssign: () => void;
}) {
  return (
    <Dialog open={assignRoutine !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-border-subtle bg-bg-surface-2 text-text-primary sm:max-w-2xl">
        {assignRoutine && (
          <>
            <DialogHeader>
              <DialogTitle>
                {selectedAthleteHasRoutine ? "Este atleta ya tiene una rutina" : "Asignar rutina"}
              </DialogTitle>
              <DialogDescription className="text-text-secondary">
                Rutina seleccionada:{" "}
                <span className="font-medium text-purple-soft">{assignRoutine.name}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  value={assignSearch}
                  onChange={(e) => setAssignSearch(e.target.value)}
                  placeholder="Buscar atleta"
                  className="border-border-strong bg-bg-surface-3 pl-9 text-text-primary placeholder:text-text-muted"
                />
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {isLoadingAthletes ? (
                  <div className="space-y-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-14 animate-pulse rounded-2xl bg-bg-surface-3" />
                    ))}
                  </div>
                ) : filteredAthletes.length === 0 ? (
                  <p className="rounded-2xl border border-border-subtle bg-bg-surface-3/60 p-4 text-sm text-text-secondary">
                    No hay atletas para mostrar.
                  </p>
                ) : (
                  filteredAthletes.map((athlete) => {
                    const hasRoutine = Boolean(athlete.routine?.length);
                    const isSelected = athlete.id === selectedAthleteId;
                    return (
                      <button
                        key={athlete.id}
                        type="button"
                        onClick={() => setSelectedAthleteId(athlete.id)}
                        className={`w-full rounded-2xl border p-3 text-left transition ${
                          isSelected
                            ? "border-purple-primary/50 bg-purple-primary/15"
                            : "border-border-subtle bg-bg-surface-3/60 hover:bg-bg-surface-3"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-text-primary">{athlete.name}</p>
                            <p className="text-xs text-text-secondary">
                              {athlete.email || athlete.phone || "Sin contacto"}
                            </p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-xs ${hasRoutine ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>
                            {hasRoutine ? "Tiene rutina" : "Sin rutina"}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {selectedAthlete && (
                <div className={`rounded-2xl border p-4 text-sm ${selectedAthleteHasRoutine ? "border-warning/20 bg-warning/10 text-warning" : "border-purple-primary/20 bg-purple-primary/10 text-purple-soft"}`}>
                  {selectedAthleteHasRoutine ? (
                    <p>
                      {selectedAthlete.name} ya tiene una rutina cargada. Si continuas, su rutina actual sera
                      reemplazada por una copia de {assignRoutine.name}. La rutina guardada original no sera modificada.
                    </p>
                  ) : (
                    <p>
                      Se asignara {assignRoutine.name} a {selectedAthlete.name}. Luego podras editarla desde el perfil del atleta.
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onClose} disabled={isAssigning} className={DIALOG_CANCEL_CLASS}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={onAssign}
                disabled={!selectedAthlete || isAssigning}
                className={selectedAthleteHasRoutine
                  ? "rounded-full bg-warning text-bg-base hover:bg-warning/90"
                  : DIALOG_PRIMARY_CLASS}
              >
                {isAssigning ? "Asignando..." : selectedAthleteHasRoutine ? "Reemplazar rutina" : "Asignar rutina"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AssignSuccessDialog({
  assignResult,
  onClose,
  onViewAthlete,
}: {
  assignResult: AssignResult;
  onClose: () => void;
  onViewAthlete: (id: string) => void;
}) {
  return (
    <Dialog open={assignResult !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-border-subtle bg-bg-surface-2 text-text-primary">
        {assignResult && (
          <>
            <DialogHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <DialogTitle>Rutina asignada correctamente</DialogTitle>
              <DialogDescription className="text-text-secondary">
                Se creo una copia editable en el perfil de {assignResult.athleteName}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onClose} className={DIALOG_CANCEL_CLASS}>
                Seguir en rutinas guardadas
              </Button>
              <Button type="button" onClick={() => onViewAthlete(assignResult.athleteId)} className={DIALOG_PRIMARY_CLASS}>
                Ver atleta
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
