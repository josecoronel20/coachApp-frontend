"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  X,
  ArrowLeftRight,
} from "lucide-react";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import {
  getMuscleGroups,
  getRoutine,
  patchRoutineDays,
  patchRoutineName,
  saveAsTemplate,
  searchExercises,
} from "@/app/api/routineBuilder";
import type {
  BuilderDay,
  BuilderExercise,
  BuilderSet,
  ExerciseSearchResult,
  RepRangeMode,
} from "@/types/routineBuilderType";

// ─── Constants ────────────────────────────────────────────────────────────────

const BROWSER_PREFIX = "browser::";
const DAY_PREFIX = "day::";
const ZONE_PREFIX = "zone::";

// ─── Types ────────────────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved" | "error";
type ActiveDragType = "browser" | "routine" | null;

type ExerciseLocation = {
  dayId: string;
  index: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function newSet(): BuilderSet {
  return { id: crypto.randomUUID(), weight: "", reps: "", minReps: "", maxReps: "" };
}

function newExercise(from: ExerciseSearchResult): BuilderExercise {
  return {
    id: crypto.randomUUID(),
    name: from.name,
    gifUrl: from.gifUrl,
    targetMuscle: from.targetMuscle,
    secondaryMuscles: from.secondaryMuscles,
    sets: [newSet()],
    coachNotes: "",
    notesOpen: false,
    repRangeMode: "simple",
  };
}

function normalizeBuilderExercise(ex: BuilderExercise): BuilderExercise {
  const defaults = { repRangeMode: "simple" as RepRangeMode, secondaryMuscles: [] as string[] };
  return {
    ...defaults,
    ...ex,
    sets: Array.isArray(ex.sets)
      ? ex.sets.map((s) => {
          const setDefaults = { minReps: "" as const, maxReps: "" as const };
          return { ...setDefaults, ...s };
        })
      : [newSet()],
  };
}

function newDay(dayIndex: number): BuilderDay {
  return {
    id: crypto.randomUUID(),
    dayIndex,
    name: `Dia ${dayIndex + 1}`,
    exercises: [],
  };
}

function normalizeBuilderDays(days: BuilderDay[]): BuilderDay[] {
  const normalized = days.map((day, index) => ({
    id: typeof day.id === "string" && day.id.trim() ? day.id : crypto.randomUUID(),
    dayIndex: index,
    name: typeof day.name === "string" && day.name.trim() ? day.name.trim() : `Dia ${index + 1}`,
    exercises: Array.isArray(day.exercises)
      ? day.exercises.map((ex) => normalizeBuilderExercise(ex))
      : [],
  }));

  return normalized.length > 0 ? normalized : [newDay(0)];
}

function isBuilderDaysRoutine(raw: unknown): raw is { __builderFormat: "days-v2"; days: BuilderDay[] } {
  return (
    !!raw &&
    typeof raw === "object" &&
    (raw as { __builderFormat?: unknown }).__builderFormat === "days-v2" &&
    Array.isArray((raw as { days?: unknown }).days)
  );
}

function isLegacyFlatBuilderRoutine(raw: unknown): raw is { __builderFormat: true; exercises: BuilderExercise[] } {
  return (
    !!raw &&
    typeof raw === "object" &&
    (raw as { __builderFormat?: unknown }).__builderFormat === true &&
    Array.isArray((raw as { exercises?: unknown }).exercises)
  );
}

function parseBuilderDays(raw: unknown): BuilderDay[] {
  if (isBuilderDaysRoutine(raw)) {
    return normalizeBuilderDays(raw.days);
  }

  if (isLegacyFlatBuilderRoutine(raw)) {
    return normalizeBuilderDays([
      {
        id: crypto.randomUUID(),
        dayIndex: 0,
        name: "Dia 1",
        exercises: raw.exercises,
      },
    ]);
  }
  return [newDay(0)];
}

function findExerciseLocation(days: BuilderDay[], exerciseId: string): ExerciseLocation | null {
  for (const day of days) {
    const index = day.exercises.findIndex((exercise) => exercise.id === exerciseId);
    if (index !== -1) return { dayId: day.id, index };
  }
  return null;
}

function resolveDropLocation(days: BuilderDay[], overId: string): ExerciseLocation | null {
  if (overId.startsWith(DAY_PREFIX)) {
    const dayId = overId.slice(DAY_PREFIX.length);
    const day = days.find((candidate) => candidate.id === dayId);
    return day ? { dayId, index: day.exercises.length } : null;
  }

  if (overId.startsWith(ZONE_PREFIX)) {
    const [, dayId, rawIndex] = overId.split("::");
    const index = Number(rawIndex);
    const day = days.find((candidate) => candidate.id === dayId);
    if (!day || !Number.isFinite(index)) return null;
    return { dayId, index: Math.max(0, Math.min(Math.trunc(index), day.exercises.length)) };
  }

  const exerciseLocation = findExerciseLocation(days, overId);
  return exerciseLocation;
}

function insertExerciseInDay(
  days: BuilderDay[],
  dayId: string,
  index: number,
  exercise: BuilderExercise
): BuilderDay[] {
  return days.map((day) => {
    if (day.id !== dayId) return day;
    const insertAt = Math.max(0, Math.min(index, day.exercises.length));
    return {
      ...day,
      exercises: [
        ...day.exercises.slice(0, insertAt),
        exercise,
        ...day.exercises.slice(insertAt),
      ],
    };
  });
}

function moveExerciseBetweenDays(
  days: BuilderDay[],
  source: ExerciseLocation,
  target: ExerciseLocation
): BuilderDay[] {
  const sourceDay = days.find((day) => day.id === source.dayId);
  const exercise = sourceDay?.exercises[source.index];
  if (!sourceDay || !exercise) return days;

  const withoutExercise = days.map((day) =>
    day.id === source.dayId
      ? {
          ...day,
          exercises: day.exercises.filter((candidate) => candidate.id !== exercise.id),
        }
      : day
  );

  const sameDayOffset =
    source.dayId === target.dayId && source.index < target.index ? -1 : 0;
  return insertExerciseInDay(
    withoutExercise,
    target.dayId,
    target.index + sameDayOffset,
    exercise
  );
}

// ─── Summary computation ──────────────────────────────────────────────────────

type MuscleRow = {
  muscle: string;
  direct: number;
  secondary: number;
};

function computeSummary(days: BuilderDay[]): {
  totalExercises: number;
  totalSets: number;
  muscleRows: MuscleRow[];
} {
  const exercises = days.flatMap((day) => day.exercises);
  const totalExercises = exercises.length;
  const totalSets = exercises.reduce((acc, e) => acc + e.sets.length, 0);

  const directMap = new Map<string, number>();
  const secondaryMap = new Map<string, number>();

  for (const ex of exercises) {
    const muscle = ex.targetMuscle?.trim() || "Sin clasificar";
    directMap.set(muscle, (directMap.get(muscle) ?? 0) + ex.sets.length);

    for (const sm of ex.secondaryMuscles ?? []) {
      const key = sm.trim() || "Sin clasificar";
      secondaryMap.set(key, (secondaryMap.get(key) ?? 0) + ex.sets.length);
    }
  }

  const allMuscles = new Set([...directMap.keys(), ...secondaryMap.keys()]);
  const muscleRows: MuscleRow[] = Array.from(allMuscles).map((muscle) => ({
    muscle,
    direct: directMap.get(muscle) ?? 0,
    secondary: secondaryMap.get(muscle) ?? 0,
  }));

  muscleRows.sort((a, b) => b.direct - a.direct || b.secondary - a.secondary);

  return { totalExercises, totalSets, muscleRows };
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RoutineEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Routine state
  const [routineName, setRoutineName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [days, setDays] = useState<BuilderDay[]>(() => [newDay(0)]);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Browser state
  const [searchQuery, setSearchQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [browserResults, setBrowserResults] = useState<ExerciseSearchResult[]>([]);
  const [browserLoading, setBrowserLoading] = useState(true); // true on mount → shows skeletons immediately
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // DnD state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<ActiveDragType>(null);
  const [activeBrowserItem, setActiveBrowserItem] = useState<ExerciseSearchResult | null>(null);

  // Summary sheet
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Save-as-template dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // Auto-save refs
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const daysRef = useRef<BuilderDay[]>([]);

  const activeDay = useMemo(
    () => days.find((day) => day.id === activeDayId) ?? days[0] ?? newDay(0),
    [activeDayId, days]
  );

  useEffect(() => {
    daysRef.current = days;
  }, [days]);

  // ── Load routine ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    void (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await getRoutine(id);
        if (!res.ok) { setLoadError("No se pudo cargar la rutina."); return; }
        const data = (await res.json()) as { id: string; name: string; routine: unknown };
        setRoutineName(data.name);
        setNameInput(data.name);
        const parsedDays = parseBuilderDays(data.routine);
        setDays(parsedDays);
        setActiveDayId(parsedDays[0]?.id ?? null);
      } catch {
        setLoadError("Error de conexión al cargar la rutina.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => { void getMuscleGroups().then(setMuscleGroups); }, []);

  // ── Browser search ────────────────────────────────────────────────────────

  const browserSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerBrowserSearch = useCallback((q: string, muscle: string, equipment: string) => {
    if (browserSearchTimer.current) clearTimeout(browserSearchTimer.current);
    browserSearchTimer.current = setTimeout(async () => {
      setBrowserLoading(true);
      try {
        const data = await searchExercises({ search: q, muscle, equipment, limit: 50 });
        setBrowserResults(data.exercises);
      } finally { setBrowserLoading(false); }
    }, 350);
  }, []);

  useEffect(() => {
    triggerBrowserSearch(searchQuery, muscleFilter, equipmentFilter);
  }, [searchQuery, muscleFilter, equipmentFilter, triggerBrowserSearch]);

  // ── Auto-save ─────────────────────────────────────────────────────────────

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    saveTimerRef.current = setTimeout(async () => {
      try {
        const res = await patchRoutineDays(id, daysRef.current);
        setSaveStatus(res.ok ? "saved" : "error");
      } catch { setSaveStatus("error"); }
    }, 1500);
  }, [id]);

  // ── Exercise mutations ────────────────────────────────────────────────────

  const updateDayExercises = useCallback(
    (dayId: string, updater: (prev: BuilderExercise[]) => BuilderExercise[]) => {
      setDays((prevDays) => {
        const nextDays = prevDays.map((day) =>
          day.id === dayId ? { ...day, exercises: updater(day.exercises) } : day
        );
        daysRef.current = nextDays;
        scheduleSave();
        return nextDays;
      });
    },
    [scheduleSave]
  );

  const MAX_DAYS = 7;

  const addDay = useCallback(() => {
    setDays((prevDays) => {
      if (prevDays.length >= MAX_DAYS) return prevDays;
      const nextDay = newDay(prevDays.length);
      const nextDays = normalizeBuilderDays([...prevDays, nextDay]);
      daysRef.current = nextDays;
      setActiveDayId(nextDay.id);
      scheduleSave();
      return nextDays;
    });
  }, [scheduleSave]);

  const renameDay = useCallback(
    (dayId: string, name: string) => {
      setDays((prevDays) => {
        const nextDays = normalizeBuilderDays(
          prevDays.map((day) =>
            day.id === dayId ? { ...day, name } : day
          )
        );
        daysRef.current = nextDays;
        scheduleSave();
        return nextDays;
      });
    },
    [scheduleSave]
  );

  const duplicateDay = useCallback(
    (dayId: string) => {
      setDays((prevDays) => {
        if (prevDays.length >= MAX_DAYS) return prevDays;
        const source = prevDays.find((d) => d.id === dayId);
        if (!source) return prevDays;
        const copy: BuilderDay = {
          id: crypto.randomUUID(),
          dayIndex: prevDays.length,
          name: `${source.name} (copia)`,
          exercises: source.exercises.map((ex) => ({
            ...ex,
            id: crypto.randomUUID(),
            sets: ex.sets.map((s) => ({ ...s, id: crypto.randomUUID() })),
          })),
        };
        const nextDays = normalizeBuilderDays([...prevDays, copy]);
        daysRef.current = nextDays;
        setActiveDayId(copy.id);
        scheduleSave();
        return nextDays;
      });
    },
    [scheduleSave]
  );

  const moveDayLeft = useCallback(
    (dayId: string) => {
      setDays((prevDays) => {
        const idx = prevDays.findIndex((d) => d.id === dayId);
        if (idx <= 0) return prevDays;
        const next = [...prevDays];
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        const normalized = normalizeBuilderDays(next);
        daysRef.current = normalized;
        scheduleSave();
        return normalized;
      });
    },
    [scheduleSave]
  );

  const moveDayRight = useCallback(
    (dayId: string) => {
      setDays((prevDays) => {
        const idx = prevDays.findIndex((d) => d.id === dayId);
        if (idx === -1 || idx >= prevDays.length - 1) return prevDays;
        const next = [...prevDays];
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
        const normalized = normalizeBuilderDays(next);
        daysRef.current = normalized;
        scheduleSave();
        return normalized;
      });
    },
    [scheduleSave]
  );

  const deleteDay = useCallback(
    (dayId: string) => {
      setDays((prevDays) => {
        if (prevDays.length <= 1) return prevDays; // always keep at least 1
        const next = prevDays.filter((d) => d.id !== dayId);
        const normalized = normalizeBuilderDays(next);
        daysRef.current = normalized;
        // switch active day if needed
        setActiveDayId((prev) => {
          if (prev === dayId) return normalized[0]?.id ?? null;
          return prev;
        });
        scheduleSave();
        return normalized;
      });
    },
    [scheduleSave]
  );

  // Delete confirmation dialog state
  const [deleteDayDialog, setDeleteDayDialog] = useState<{ dayId: string; dayName: string; exerciseCount: number } | null>(null);

  const requestDeleteDay = useCallback(
    (dayId: string) => {
      const day = daysRef.current.find((d) => d.id === dayId);
      if (!day) return;
      if (day.exercises.length === 0) {
        deleteDay(dayId);
      } else {
        setDeleteDayDialog({ dayId, dayName: day.name, exerciseCount: day.exercises.length });
      }
    },
    [deleteDay]
  );

  const addExerciseAt = useCallback(
    (dayId: string, result: ExerciseSearchResult, index: number) => {
      updateDayExercises(dayId, (prev) => {
        const next = [...prev];
        next.splice(index, 0, newExercise(result));
        return next;
      });
      setMobileSearchOpen(false);
    },
    [updateDayExercises]
  );

  const addExerciseFromBrowser = useCallback(
    (result: ExerciseSearchResult) => {
      const targetDayId = activeDayId ?? daysRef.current[0]?.id;
      if (!targetDayId) return;
      updateDayExercises(targetDayId, (prev) => [...prev, newExercise(result)]);
      setMobileSearchOpen(false);
    },
    [activeDayId, updateDayExercises]
  );

  const removeExercise = useCallback(
    (dayId: string, exId: string) =>
      updateDayExercises(dayId, (prev) => prev.filter((e) => e.id !== exId)),
    [updateDayExercises]
  );

  const updateExercise = useCallback(
    (dayId: string, exId: string, patch: Partial<BuilderExercise>) =>
      updateDayExercises(dayId, (prev) => prev.map((e) => (e.id === exId ? { ...e, ...patch } : e))),
    [updateDayExercises]
  );

  const addSet = useCallback(
    (dayId: string, exId: string) =>
      updateDayExercises(dayId, (prev) =>
        prev.map((e) => {
          if (e.id !== exId) return e;
          const last = e.sets[e.sets.length - 1];
          const copied: BuilderSet = last
            ? { ...last, id: crypto.randomUUID() }
            : newSet();
          return { ...e, sets: [...e.sets, copied] };
        })
      ),
    [updateDayExercises]
  );

  const removeSet = useCallback(
    (dayId: string, exId: string, setId: string) =>
      updateDayExercises(dayId, (prev) =>
        prev.map((e) =>
          e.id === exId ? { ...e, sets: e.sets.filter((s) => s.id !== setId) } : e
        )
      ),
    [updateDayExercises]
  );

  const updateSet = useCallback(
    (dayId: string, exId: string, setId: string, patch: Partial<BuilderSet>) =>
      updateDayExercises(dayId, (prev) =>
        prev.map((e) =>
          e.id === exId
            ? { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) }
            : e
        )
      ),
    [updateDayExercises]
  );

  // ── Rep range toggle ──────────────────────────────────────────────────────

  const toggleRepRangeMode = useCallback(
    (dayId: string, exId: string) => {
      updateDayExercises(dayId, (prev) =>
        prev.map((ex) => {
          if (ex.id !== exId) return ex;
          if (ex.repRangeMode === "simple") {
            // simple → range: current reps becomes minReps, maxReps = minReps + 2
            return {
              ...ex,
              repRangeMode: "range" as RepRangeMode,
              sets: ex.sets.map((s) => ({
                ...s,
                minReps: s.reps,
                maxReps: s.reps !== "" ? (Number(s.reps) + 2) : "",
              })),
            };
          } else {
            // range → simple: reps = round((minReps + maxReps) / 2)
            return {
              ...ex,
              repRangeMode: "simple" as RepRangeMode,
              sets: ex.sets.map((s) => {
                const min = s.minReps !== "" ? Number(s.minReps) : null;
                const max = s.maxReps !== "" ? Number(s.maxReps) : null;
                const avg =
                  min !== null && max !== null
                    ? Math.round((min + max) / 2)
                    : min ?? max ?? "";
                return { ...s, reps: avg };
              }),
            };
          }
        })
      );
    },
    [updateDayExercises]
  );

  // ── Name editing ──────────────────────────────────────────────────────────

  const confirmNameEdit = useCallback(async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === routineName) { setNameInput(routineName); setEditingName(false); return; }
    setRoutineName(trimmed);
    setEditingName(false);
    try { await patchRoutineName(id, trimmed); } catch { /* optimistic */ }
  }, [id, nameInput, routineName]);

  // ── Save as template ──────────────────────────────────────────────────────

  const openTemplateDialog = useCallback(() => {
    setTemplateName(`${routineName} — Plantilla`);
    setTemplateDialogOpen(true);
  }, [routineName]);

  const handleSaveAsTemplate = useCallback(async () => {
    const name = templateName.trim();
    if (!name) return;
    setIsSavingTemplate(true);
    try {
      const res = await saveAsTemplate(id, name);
      if (res.ok) {
        setTemplateDialogOpen(false);
        showToast("Plantilla guardada");
      } else {
        showToast("Error al guardar la plantilla", "error");
      }
    } catch {
      showToast("Error de conexión", "error");
    } finally {
      setIsSavingTemplate(false);
    }
  }, [id, templateName, showToast]);

  // ── DnD ───────────────────────────────────────────────────────────────────

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const sid = String(event.active.id);
    setActiveId(sid);
    if (sid.startsWith(BROWSER_PREFIX)) {
      setActiveDragType("browser");
      setActiveBrowserItem(event.active.data.current?.result ?? null);
    } else {
      setActiveDragType("routine");
      setActiveBrowserItem(null);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setActiveDragType(null);
      setActiveBrowserItem(null);

      if (!over) return;

      const sid = String(active.id);
      const overId = String(over.id);
      const currentDays = daysRef.current;
      const target = resolveDropLocation(currentDays, overId);
      if (!target) return;

      if (sid.startsWith(BROWSER_PREFIX)) {
        const result = active.data.current?.result as ExerciseSearchResult | undefined;
        if (!result) return;
        addExerciseAt(target.dayId, result, target.index);
      } else {
        const source = findExerciseLocation(currentDays, sid);
        if (!source) return;
        if (source.dayId === target.dayId && source.index === target.index) return;

        setDays((prevDays) => {
          const nextDays = moveExerciseBetweenDays(prevDays, source, target);
          daysRef.current = nextDays;
          scheduleSave();
          return nextDays;
        });
      }
    },
    [addExerciseAt, scheduleSave]
  );

  // ── Summary data ──────────────────────────────────────────────────────────

  const summary = useMemo(() => computeSummary(days), [days]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (isLoading) return <BuilderSkeleton />;
  if (loadError) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-base p-8 text-text-primary">
        <div className="space-y-4 text-center">
          <p className="text-text-secondary">{loadError}</p>
          <Button variant="outline" onClick={() => router.back()} className="rounded-full">Volver</Button>
        </div>
      </div>
    );
  }

  const isDragActive = activeDragType !== null;
  const activeRoutineExercise = activeId
    ? days.flatMap((day) => day.exercises).find((exercise) => exercise.id === activeId) ?? null
    : null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-bg-base text-text-primary">
        <div className="flex flex-1 overflow-hidden">

          {/* ─── Left column ──────────────────────────────────────────────── */}
          <div className="flex w-full flex-col overflow-hidden lg:flex-1">

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-subtle bg-bg-surface-1 px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <Button variant="ghost" size="sm" className="shrink-0 px-1 text-text-secondary hover:text-text-primary" onClick={() => router.push("/dashboard/routines")}>
                  <ArrowLeft className="size-4" />
                </Button>
                {editingName ? (
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onBlur={() => void confirmNameEdit()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void confirmNameEdit();
                      if (e.key === "Escape") { setNameInput(routineName); setEditingName(false); }
                    }}
                    className="min-w-0 flex-1 truncate rounded border border-purple-primary/40 bg-bg-surface-2 px-2 py-1 text-base font-semibold text-text-primary outline-none"
                  />
                ) : (
                  <button type="button" title="Click para editar nombre" onClick={() => { setNameInput(routineName); setEditingName(true); }} className="min-w-0 truncate text-left text-base font-semibold text-text-primary hover:text-purple-soft">
                    {routineName || "Sin nombre"}
                  </button>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <SaveIndicator status={saveStatus} />
                <Button
                  variant="ghost" size="sm"
                  className="px-2 text-text-secondary hover:text-text-primary"
                  title="Ver resumen"
                  onClick={() => setSummaryOpen(true)}
                >
                  <BarChart2 className="size-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="px-2 text-text-secondary hover:text-text-primary">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border-border-subtle bg-bg-surface-2 text-text-primary">
                    <DropdownMenuItem className="cursor-pointer hover:bg-bg-surface-3" onSelect={openTemplateDialog}>
                      Guardar como plantilla
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer hover:bg-bg-surface-3">Duplicar rutina</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-danger hover:bg-danger/10 hover:text-danger">Eliminar rutina</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mobile day selector */}
            <div className="shrink-0 border-b border-border-subtle bg-bg-surface-1 px-4 py-3 lg:hidden">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {days.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setActiveDayId(day.id)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition ${
                      day.id === activeDay.id
                        ? "border-purple-primary bg-purple-primary text-white"
                        : "border-border-subtle bg-bg-surface-2 text-text-secondary hover:border-purple-primary/50 hover:text-text-primary"
                    }`}
                  >
                    {day.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={addDay}
                  disabled={days.length >= MAX_DAYS}
                  title={days.length >= MAX_DAYS ? "Máximo 7 días" : undefined}
                  className="shrink-0 rounded-full border border-dashed border-border-strong px-3 py-1.5 text-sm text-text-muted hover:border-purple-primary/50 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  + Día
                </button>
              </div>
              <Input
                value={activeDay.name}
                onChange={(event) => renameDay(activeDay.id, event.target.value)}
                className="h-9 border-border-strong bg-bg-surface-2 text-sm text-text-primary"
                aria-label="Nombre del dia"
              />
            </div>

            {/* Desktop board */}
            <div className="hidden flex-1 overflow-x-auto overflow-y-hidden p-4 lg:flex">
              <div className="flex min-w-max gap-4">

                {false && (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-subtle py-16 text-center">
                    <p className="text-sm text-text-secondary">No hay ejercicios todavía.</p>
                    <p className="text-xs text-text-muted">Busca un ejercicio en el panel derecho y hacé click para agregarlo.</p>
                  </div>
                )}

                {days.map((day, dayIdx) => (
                  <RoutineDayColumn
                    key={day.id}
                    day={day}
                    dayNumber={dayIdx + 1}
                    totalDays={days.length}
                    activeId={activeId}
                    isDraggingFromBrowser={isDragActive}
                    onRename={renameDay}
                    onRemoveExercise={removeExercise}
                    onUpdateExercise={updateExercise}
                    onAddSet={addSet}
                    onRemoveSet={removeSet}
                    onUpdateSet={updateSet}
                    onToggleRepRange={toggleRepRangeMode}
                    onDuplicate={duplicateDay}
                    onMoveLeft={moveDayLeft}
                    onMoveRight={moveDayRight}
                    onRequestDelete={requestDeleteDay}
                  />
                ))}
                {days.length < MAX_DAYS ? (
                  <button
                    type="button"
                    onClick={addDay}
                    className="flex h-fit w-56 shrink-0 items-center justify-center gap-2 rounded-3xl border border-dashed border-border-strong bg-bg-surface-1/50 px-4 py-6 text-sm font-medium text-text-muted transition hover:border-purple-primary/50 hover:bg-bg-surface-1 hover:text-text-primary"
                  >
                    <Plus className="size-4" />
                    Agregar día
                  </button>
                ) : (
                  <div
                    title="Máximo 7 días por rutina"
                    className="flex h-fit w-56 shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-3xl border border-dashed border-border-subtle bg-bg-surface-1/30 px-4 py-6 text-sm text-text-muted opacity-50"
                  >
                    <Plus className="size-4" />
                    Máximo 7 días
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 lg:hidden">
              <RoutineDayColumn
                day={activeDay}
                dayNumber={(days.findIndex((d) => d.id === activeDay.id) ?? 0) + 1}
                totalDays={days.length}
                activeId={activeId}
                isDraggingFromBrowser={isDragActive}
                compact
                onRename={renameDay}
                onRemoveExercise={removeExercise}
                onUpdateExercise={updateExercise}
                onAddSet={addSet}
                onRemoveSet={removeSet}
                onUpdateSet={updateSet}
                onToggleRepRange={toggleRepRangeMode}
                onDuplicate={duplicateDay}
                onMoveLeft={moveDayLeft}
                onMoveRight={moveDayRight}
                onRequestDelete={requestDeleteDay}
              />

              <Button variant="outline" className="mt-3 w-full rounded-2xl border-dashed border-border-strong text-text-secondary hover:bg-bg-surface-2" onClick={() => setMobileSearchOpen((v) => !v)}>
                <Plus className="size-4" />
                {mobileSearchOpen ? "Cerrar buscador" : "Agregar ejercicio"}
              </Button>
            </div>
          </div>

          {/* ─── Right column ─────────────────────────────────────────────── */}
          <div className={`flex flex-col border-l border-border-subtle bg-bg-surface-1 lg:flex lg:w-[360px] xl:w-[400px] ${mobileSearchOpen ? "fixed inset-0 z-50 flex w-full" : "hidden"}`}>
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3 lg:hidden">
              <span className="font-semibold">Buscar ejercicio</span>
              <Button variant="ghost" size="sm" className="px-2" onClick={() => setMobileSearchOpen(false)}><X className="size-4" /></Button>
            </div>
            <div className="shrink-0 space-y-2 border-b border-border-subtle px-4 py-3">
              <p className="hidden text-sm font-semibold text-text-primary lg:block">Ejercicios</p>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <Input placeholder="Buscar por nombre..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-border-strong bg-bg-surface-2 pl-9 text-sm text-text-primary placeholder:text-text-muted" />
              </div>
              <div className="flex gap-2">
                <select value={muscleFilter} onChange={(e) => setMuscleFilter(e.target.value)} className="flex-1 rounded-lg border border-border-strong bg-bg-surface-2 px-2 py-1.5 text-xs text-text-primary outline-none focus:border-purple-primary">
                  <option value="">Todos los músculos</option>
                  {muscleGroups.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={equipmentFilter} onChange={(e) => setEquipmentFilter(e.target.value)} className="flex-1 rounded-lg border border-border-strong bg-bg-surface-2 px-2 py-1.5 text-xs text-text-primary outline-none focus:border-purple-primary">
                  <option value="">Todo el equipo</option>
                  <option value="barbell">Barra</option>
                  <option value="dumbbell">Mancuernas</option>
                  <option value="cable">Cable</option>
                  <option value="machine">Máquina</option>
                  <option value="bodyweight">Peso corporal</option>
                </select>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {browserLoading ? (
                <div className="space-y-2 p-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-bg-surface-2" />)}</div>
              ) : browserResults.length === 0 ? (
                <div className="p-6 text-center text-sm text-text-muted">{searchQuery || muscleFilter ? "Sin resultados. Probá con otros filtros." : "No hay ejercicios en la biblioteca aún. Ejecuta el seed para importarlos."}</div>
              ) : (
                <div className="divide-y divide-border-subtle">
                  {browserResults.map((result) => (
                    <DraggableBrowserItem key={result.id} result={result} onAdd={addExerciseFromBrowser} />
                  ))}
                </div>
              )}
              <div className="p-3">
                <button type="button" disabled className="w-full rounded-xl border border-dashed border-border-subtle py-2.5 text-sm text-text-muted opacity-60">+ Ejercicio personalizado</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Drag Overlay ─────────────────────────────────────────────────────── */}
      <DragOverlay dropAnimation={null}>
        {activeDragType === "browser" && activeBrowserItem ? (
          <BrowserItemGhost result={activeBrowserItem} />
        ) : activeDragType === "routine" && activeId ? (
          <ExerciseCardGhost exercise={activeRoutineExercise} />
        ) : null}
      </DragOverlay>

      {/* ── Summary Sheet ─────────────────────────────────────────────────────── */}
      <Sheet open={summaryOpen} onOpenChange={setSummaryOpen}>
        <SheetContent side="right" className="w-full max-w-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Resumen de la rutina</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-5">
            {/* Totals */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border-subtle bg-bg-surface-2 p-3 text-center">
                <p className="text-2xl font-bold text-text-primary">{summary.totalExercises}</p>
                <p className="text-xs text-text-muted">ejercicios</p>
              </div>
              <div className="rounded-xl border border-border-subtle bg-bg-surface-2 p-3 text-center">
                <p className="text-2xl font-bold text-text-primary">{summary.totalSets}</p>
                <p className="text-xs text-text-muted">sets totales</p>
              </div>
            </div>

            {/* Muscle table */}
            {summary.muscleRows.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Sets por grupo muscular</p>
                <div className="overflow-hidden rounded-xl border border-border-subtle">
                  <table className="w-full text-xs">
                    <thead className="bg-bg-surface-2">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-text-secondary">Músculo</th>
                        <th className="px-3 py-2 text-right font-medium text-text-secondary">Directos</th>
                        <th className="px-3 py-2 text-right font-medium text-text-secondary">Secundarios</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {summary.muscleRows.map((row) => (
                        <tr key={row.muscle} className="bg-bg-surface-1">
                          <td className="px-3 py-2 text-text-primary">{row.muscle}</td>
                          <td className="px-3 py-2 text-right font-medium text-text-primary">{row.direct || "—"}</td>
                          <td className="px-3 py-2 text-right text-text-secondary">{row.secondary || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {summary.muscleRows.length === 0 && (
              <p className="text-sm text-text-muted">Agrega ejercicios para ver el resumen.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Save-as-template Dialog ──────────────────────────────────────────── */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="border-border-subtle bg-bg-surface-1 text-text-primary sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Guardar como plantilla</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label className="text-sm text-text-primary">Nombre de la plantilla</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void handleSaveAsTemplate(); }}
                className="border-border-strong bg-bg-surface-2 text-text-primary"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)} disabled={isSavingTemplate} className="rounded-full border-border-strong bg-bg-surface-2 text-text-primary hover:bg-bg-surface-3">
              Cancelar
            </Button>
            <Button onClick={() => void handleSaveAsTemplate()} disabled={isSavingTemplate || !templateName.trim()} className="rounded-full bg-purple-primary text-white hover:bg-purple-bright">
              {isSavingTemplate ? "Guardando..." : "Guardar plantilla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete day confirmation ──────────────────────────────────────────── */}
      <Dialog open={deleteDayDialog !== null} onOpenChange={(open) => !open && setDeleteDayDialog(null)}>
        <DialogContent className="border-border-subtle bg-bg-surface-1 text-text-primary sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar este día?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary">
            <strong className="text-text-primary">{deleteDayDialog?.dayName}</strong> tiene{" "}
            {deleteDayDialog?.exerciseCount} ejercicio{deleteDayDialog?.exerciseCount !== 1 ? "s" : ""}.
            Se eliminarán todos.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDayDialog(null)}
              className="rounded-full border-border-strong bg-bg-surface-2 text-text-primary hover:bg-bg-surface-3"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (deleteDayDialog) deleteDay(deleteDayDialog.dayId);
                setDeleteDayDialog(null);
              }}
              className="rounded-full bg-danger text-white hover:bg-danger/90"
            >
              Eliminar día
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium shadow-lg transition-all ${toast.type === "success" ? "bg-success text-white" : "bg-danger text-white"}`}>
          {toast.msg}
        </div>
      )}
    </DndContext>
  );
}

// ─── Set summary helper ───────────────────────────────────────────────────────

function getSetSummary(exercise: BuilderExercise): string {
  const count = exercise.sets.length;
  const setStr = `${count} ${count === 1 ? "serie" : "series"}`;
  const first = exercise.sets[0];
  if (!first) return setStr;

  let repsStr = "";
  if (exercise.repRangeMode === "range") {
    const min = first.minReps !== "" ? first.minReps : null;
    const max = first.maxReps !== "" ? first.maxReps : null;
    if (min !== null && max !== null) repsStr = `${min}–${max} reps`;
    else if (min !== null) repsStr = `≥${min} reps`;
  } else {
    if (first.reps !== "") repsStr = `${first.reps} reps`;
  }

  return repsStr ? `${setStr} · ${repsStr}` : setStr;
}

// ─── DropZone ─────────────────────────────────────────────────────────────────

function RoutineDayColumn({
  day,
  dayNumber,
  totalDays,
  activeId,
  isDraggingFromBrowser,
  compact = false,
  onRename,
  onRemoveExercise,
  onUpdateExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleRepRange,
  onDuplicate,
  onMoveLeft,
  onMoveRight,
  onRequestDelete,
}: {
  day: BuilderDay;
  dayNumber: number;
  totalDays: number;
  activeId: string | null;
  isDraggingFromBrowser: boolean;
  compact?: boolean;
  onRename: (dayId: string, name: string) => void;
  onRemoveExercise: (dayId: string, exId: string) => void;
  onUpdateExercise: (dayId: string, exId: string, patch: Partial<BuilderExercise>) => void;
  onAddSet: (dayId: string, exId: string) => void;
  onRemoveSet: (dayId: string, exId: string, setId: string) => void;
  onUpdateSet: (dayId: string, exId: string, setId: string, patch: Partial<BuilderSet>) => void;
  onToggleRepRange: (dayId: string, exId: string) => void;
  onDuplicate: (dayId: string) => void;
  onMoveLeft: (dayId: string) => void;
  onMoveRight: (dayId: string) => void;
  onRequestDelete: (dayId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${DAY_PREFIX}${day.id}` });
  const exerciseIds = day.exercises.map((exercise) => exercise.id);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggleExpanded = useCallback(
    (exId: string) => setExpandedId((prev) => (prev === exId ? null : exId)),
    []
  );

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-0 shrink-0 flex-col rounded-3xl border bg-bg-surface-1 shadow-elevation-1 transition-colors ${
        compact ? "w-full" : "h-full w-[340px]"
      } ${isOver ? "border-purple-primary/60" : "border-border-subtle"}`}
    >
      <div className="shrink-0 space-y-2 border-b border-border-subtle p-3">
        {/* DÍA N label + menu */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Día {dayNumber}
          </span>
          <div className="flex items-center gap-1">
            <span className="rounded-full border border-border-subtle px-2 py-0.5 text-[10px] text-text-muted">
              {day.exercises.length}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-md p-1 text-text-muted hover:bg-bg-surface-2 hover:text-text-primary"
                  title="Opciones del día"
                >
                  <MoreHorizontal className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-border-subtle bg-bg-surface-2 text-text-primary">
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-bg-surface-3"
                  onSelect={() => onDuplicate(day.id)}
                  disabled={totalDays >= 7}
                >
                  Duplicar día
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-bg-surface-3 disabled:opacity-40"
                  onSelect={() => onMoveLeft(day.id)}
                  disabled={dayNumber <= 1}
                >
                  Mover a la izquierda
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-bg-surface-3"
                  onSelect={() => onMoveRight(day.id)}
                  disabled={dayNumber >= totalDays}
                >
                  Mover a la derecha
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-danger hover:bg-danger/10 hover:text-danger"
                  onSelect={() => onRequestDelete(day.id)}
                  disabled={totalDays <= 1}
                >
                  Eliminar día
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* Editable name */}
        <Input
          value={day.name}
          onChange={(event) => onRename(day.id, event.target.value)}
          placeholder="Ej: Torso + Core"
          className="h-8 border-border-strong bg-bg-surface-2 text-sm font-medium text-text-primary placeholder:text-text-muted"
          aria-label="Nombre del dia"
        />
      </div>

      <div className={`min-h-0 flex-1 overflow-y-auto p-3 ${compact ? "" : "max-h-[calc(100vh-150px)]"}`}>
        <SortableContext items={exerciseIds} strategy={verticalListSortingStrategy}>
          {isDraggingFromBrowser && <DropZone dayId={day.id} index={0} />}

          {day.exercises.length === 0 && !isDraggingFromBrowser && (
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border-subtle px-4 py-10 text-center">
              <p className="text-sm font-medium text-text-secondary">Arrastra ejercicios aca</p>
              <p className="text-xs text-text-muted">Tambien podes tocar + desde el buscador en mobile.</p>
            </div>
          )}

          {day.exercises.map((exercise, index) => (
            <div key={exercise.id}>
              <SortableExerciseCard
                exercise={exercise}
                isDragging={activeId === exercise.id}
                isExpanded={expandedId === exercise.id}
                onToggleExpand={toggleExpanded}
                onRemove={(exId) => onRemoveExercise(day.id, exId)}
                onUpdate={(exId, patch) => onUpdateExercise(day.id, exId, patch)}
                onAddSet={(exId) => onAddSet(day.id, exId)}
                onRemoveSet={(exId, setId) => onRemoveSet(day.id, exId, setId)}
                onUpdateSet={(exId, setId, patch) => onUpdateSet(day.id, exId, setId, patch)}
                onToggleRepRange={(exId) => onToggleRepRange(day.id, exId)}
              />
              {isDraggingFromBrowser && <DropZone dayId={day.id} index={index + 1} />}
            </div>
          ))}
        </SortableContext>
      </div>
    </section>
  );
}

function DropZone({ dayId, index }: { dayId: string; index: number }) {
  const { setNodeRef, isOver } = useDroppable({ id: `${ZONE_PREFIX}${dayId}::${index}` });
  return (
    <div ref={setNodeRef} className="relative my-1 flex items-center" style={{ height: 20 }}>
      <div className={`h-0.5 w-full rounded-full transition-all duration-150 ${isOver ? "scale-y-[3] bg-purple-primary opacity-100" : "bg-purple-primary/30 opacity-60"}`} />
    </div>
  );
}

// ─── DraggableBrowserItem ─────────────────────────────────────────────────────

function DraggableBrowserItem({ result, onAdd }: { result: ExerciseSearchResult; onAdd: (r: ExerciseSearchResult) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `${BROWSER_PREFIX}${result.id}`,
    data: { result },
  });
  return (
    <div
      ref={setNodeRef} {...listeners} {...attributes}
      className={`flex w-full cursor-grab items-center gap-3 px-4 py-2.5 text-left transition select-none ${isDragging ? "opacity-40" : "hover:bg-bg-surface-2 active:bg-bg-surface-3"}`}
      style={{ touchAction: "none" }}
    >
      <ExerciseThumbnail gifUrl={result.gifUrl} size={48} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">{result.name}</p>
        {result.targetMuscle && <p className="truncate text-xs text-text-muted">{result.targetMuscle}</p>}
      </div>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onAdd(result)}
        className="shrink-0 rounded-lg p-1 text-text-muted hover:bg-bg-surface-3 hover:text-text-primary"
        title="Agregar ejercicio"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

// ─── SortableExerciseCard ─────────────────────────────────────────────────────

function SortableExerciseCard({
  exercise,
  isDragging,
  isExpanded,
  onToggleExpand,
  onRemove,
  onUpdate,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleRepRange,
}: {
  exercise: BuilderExercise;
  isDragging: boolean;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<BuilderExercise>) => void;
  onAddSet: (id: string) => void;
  onRemoveSet: (exId: string, setId: string) => void;
  onUpdateSet: (exId: string, setId: string, patch: Partial<BuilderSet>) => void;
  onToggleRepRange: (exId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, over } = useSortable({ id: exercise.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const isRange = exercise.repRangeMode === "range";

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <div className={`relative rounded-2xl border bg-bg-surface-1 shadow-elevation-1 transition-colors ${over ? "border-purple-primary/50" : "border-border-subtle"}`}>

        {/* ── Header row — always visible, click to expand/collapse ── */}
        <div
          className="flex cursor-pointer items-center gap-2 p-3 select-none"
          onClick={() => onToggleExpand(exercise.id)}
          role="button"
          aria-expanded={isExpanded}
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onToggleExpand(exercise.id)}
        >
          {/* Drag handle — stops click-to-expand propagation */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 cursor-grab touch-none text-text-muted opacity-50 hover:opacity-100 active:cursor-grabbing"
            title="Arrastrar para reordenar"
          >
            <GripVertical className="size-4" />
          </button>

          <ExerciseThumbnail gifUrl={exercise.gifUrl} size={40} />

          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">{exercise.name}</p>
            <p className="truncate text-xs text-text-muted">
              {exercise.targetMuscle
                ? `${exercise.targetMuscle} · ${getSetSummary(exercise)}`
                : getSetSummary(exercise)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {isExpanded
              ? <ChevronUp className="size-3.5 text-text-muted" />
              : <ChevronDown className="size-3.5 text-text-muted" />}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(exercise.id); }}
              className="rounded-lg p-1 text-text-muted hover:bg-danger/10 hover:text-danger"
              title="Eliminar ejercicio"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        {/* ── Expanded body ── */}
        {isExpanded && (
          <div className="border-t border-border-subtle p-3 pt-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-muted">
                  <th className="w-8 pb-1 text-left font-medium">SET</th>
                  <th className="pb-1 text-left font-medium">PESO (kg)</th>
                  <th className="pb-1 text-left font-medium">
                    <span className="flex items-center gap-1">
                      REPS
                      <button
                        type="button"
                        onClick={() => onToggleRepRange(exercise.id)}
                        title={isRange ? "Cambiar a reps simple" : "Cambiar a rango de reps"}
                        className={`rounded p-0.5 transition-colors ${isRange ? "bg-purple-primary/20 text-purple-soft" : "text-text-muted hover:text-text-secondary"}`}
                      >
                        <ArrowLeftRight className="size-3" />
                      </button>
                    </span>
                  </th>
                  <th className="w-6 pb-1" />
                </tr>
              </thead>
              <tbody>
                {exercise.sets.map((set, si) => (
                  <tr key={set.id} className="group">
                    <td className="py-0.5 pr-2 text-text-muted">{si + 1}</td>
                    <td className="py-0.5 pr-2">
                      <input
                        type="number" min={0} step={0.5}
                        value={set.weight}
                        onChange={(e) => onUpdateSet(exercise.id, set.id, { weight: e.target.value === "" ? "" : Number(e.target.value) })}
                        placeholder="—"
                        className="w-full rounded-md border border-border-strong bg-bg-surface-2 px-2 py-1 text-xs text-text-primary outline-none focus:border-purple-primary placeholder:text-text-muted"
                      />
                    </td>
                    <td className="py-0.5 pr-2">
                      {isRange ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number" min={1}
                            value={set.minReps}
                            onChange={(e) => onUpdateSet(exercise.id, set.id, { minReps: e.target.value === "" ? "" : Number(e.target.value) })}
                            placeholder="8"
                            className="w-full rounded-md border border-border-strong bg-bg-surface-2 px-2 py-1 text-xs text-text-primary outline-none focus:border-purple-primary placeholder:text-text-muted"
                          />
                          <span className="shrink-0 text-text-muted">–</span>
                          <input
                            type="number" min={1}
                            value={set.maxReps}
                            onChange={(e) => onUpdateSet(exercise.id, set.id, { maxReps: e.target.value === "" ? "" : Number(e.target.value) })}
                            placeholder="12"
                            className="w-full rounded-md border border-border-strong bg-bg-surface-2 px-2 py-1 text-xs text-text-primary outline-none focus:border-purple-primary placeholder:text-text-muted"
                          />
                        </div>
                      ) : (
                        <input
                          type="number" min={1}
                          value={set.reps}
                          onChange={(e) => onUpdateSet(exercise.id, set.id, { reps: e.target.value === "" ? "" : Number(e.target.value) })}
                          placeholder="—"
                          className="w-full rounded-md border border-border-strong bg-bg-surface-2 px-2 py-1 text-xs text-text-primary outline-none focus:border-purple-primary placeholder:text-text-muted"
                        />
                      )}
                    </td>
                    <td className="py-0.5">
                      {exercise.sets.length > 1 && (
                        <button type="button" onClick={() => onRemoveSet(exercise.id, set.id)} className="invisible rounded p-0.5 text-text-muted hover:text-danger group-hover:visible">
                          <X className="size-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button type="button" onClick={() => onAddSet(exercise.id)} className="mt-2 text-xs text-purple-soft hover:text-purple-primary">
              + Add Set
            </button>

            <div className="mt-2 border-t border-border-subtle pt-2">
              <button type="button" onClick={() => onUpdate(exercise.id, { notesOpen: !exercise.notesOpen })} className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary">
                {exercise.notesOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                Nota del coach
              </button>
              {exercise.notesOpen && (
                <Textarea
                  value={exercise.coachNotes}
                  onChange={(e) => onUpdate(exercise.id, { coachNotes: e.target.value })}
                  placeholder="Agrega indicaciones para el atleta..."
                  rows={2}
                  className="mt-1.5 border-border-strong bg-bg-surface-2 text-xs text-text-primary placeholder:text-text-muted"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Drag overlays ────────────────────────────────────────────────────────────

function BrowserItemGhost({ result }: { result: ExerciseSearchResult }) {
  return (
    <div className="flex cursor-grabbing items-center gap-3 rounded-xl border border-purple-primary/40 bg-bg-surface-1 px-4 py-2.5 shadow-lg opacity-90">
      <ExerciseThumbnail gifUrl={result.gifUrl} size={40} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text-primary">{result.name}</p>
        {result.targetMuscle && <p className="truncate text-xs text-text-muted">{result.targetMuscle}</p>}
      </div>
    </div>
  );
}

function ExerciseCardGhost({ exercise }: { exercise: BuilderExercise | null }) {
  if (!exercise) return null;
  return (
    <div className="cursor-grabbing rounded-2xl border border-purple-primary/40 bg-bg-surface-1 px-3 py-2.5 shadow-xl opacity-80">
      <div className="flex items-center gap-2">
        <GripVertical className="size-4 text-text-muted" />
        <ExerciseThumbnail gifUrl={exercise.gifUrl} size={36} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">{exercise.name}</p>
          <p className="text-xs text-text-muted">{exercise.sets.length} set{exercise.sets.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  const map: Record<SaveStatus, { text: string; cls: string }> = {
    idle: { text: "", cls: "" },
    saving: { text: "Guardando...", cls: "text-text-muted" },
    saved: { text: "Guardado", cls: "text-success" },
    error: { text: "Error al guardar", cls: "text-danger" },
  };
  const { text, cls } = map[status];
  return <span className={`text-xs ${cls}`}>{text}</span>;
}

function ExerciseThumbnail({ gifUrl, size }: { gifUrl: string | null | undefined; size: number }) {
  if (!gifUrl) return <div style={{ width: size, height: size }} className="shrink-0 rounded-lg bg-bg-surface-3" />;
  return <img src={gifUrl} alt="" loading="lazy" width={size} height={size} className="shrink-0 rounded-lg object-cover" style={{ width: size, height: size }} />;
}

function BuilderSkeleton() {
  return (
    <div className="flex h-screen bg-bg-base">
      <div className="flex w-full flex-col lg:w-[60%]">
        <div className="flex items-center gap-3 border-b border-border-subtle bg-bg-surface-1 px-4 py-3">
          <div className="h-5 w-5 animate-pulse rounded bg-bg-surface-2" />
          <div className="h-5 w-48 animate-pulse rounded bg-bg-surface-2" />
        </div>
        <div className="flex-1 space-y-3 p-4">
          {[0, 1, 2].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-bg-surface-1" />)}
        </div>
      </div>
      <div className="hidden w-[40%] border-l border-border-subtle bg-bg-surface-1 lg:block">
        <div className="space-y-2 p-4">
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-bg-surface-2" />)}
        </div>
      </div>
    </div>
  );
}
