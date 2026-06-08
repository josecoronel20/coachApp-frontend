import type { Athlete } from "@/types/athleteType";
import type { Routine } from "@/types/routineType";
import { normalizeRoutine } from "@/lib/routineExercise";
import {
  getPublicAthleteRoutineCacheKey,
  readOfflineJson,
  writeOfflineJson,
} from "@/lib/athleteOfflineStorage";

const PUBLIC_ROUTINE_CACHE_VERSION = 1;

export type CachedPublicAthleteRoutine = {
  version: typeof PUBLIC_ROUTINE_CACHE_VERSION;
  athleteId: string;
  name: string;
  paymentDate: string;
  bodyWeight: number;
  repsTracked: boolean;
  routine: Routine;
  lastSyncedAt: string;
};

const toAthleteFromCachedRoutine = (
  cachedRoutine: CachedPublicAthleteRoutine
): Athlete => ({
  id: cachedRoutine.athleteId,
  coachId: "",
  name: cachedRoutine.name,
  email: "",
  phone: "",
  diet: "",
  notes: "",
  paymentDate: cachedRoutine.paymentDate,
  bodyWeight: cachedRoutine.bodyWeight,
  repsTracked: cachedRoutine.repsTracked,
  routine: normalizeRoutine(cachedRoutine.routine || []),
});

export const buildPublicAthleteRoutineCache = (
  athlete: Athlete
): CachedPublicAthleteRoutine => ({
  version: PUBLIC_ROUTINE_CACHE_VERSION,
  athleteId: athlete.id,
  name: athlete.name,
  paymentDate: athlete.paymentDate || "",
  bodyWeight: Number.isFinite(Number(athlete.bodyWeight))
    ? Number(athlete.bodyWeight)
    : 0,
  repsTracked: Boolean(athlete.repsTracked),
  routine: normalizeRoutine(athlete.routine || []),
  lastSyncedAt: new Date().toISOString(),
});

export const writePublicAthleteRoutineCache = (athlete: Athlete) => {
  writeOfflineJson(
    getPublicAthleteRoutineCacheKey(athlete.id),
    buildPublicAthleteRoutineCache(athlete)
  );
};

export const readPublicAthleteRoutineCache = (
  athleteId: string
): { athlete: Athlete; lastSyncedAt: string } | null => {
  const parsed = readOfflineJson<CachedPublicAthleteRoutine>(
    getPublicAthleteRoutineCacheKey(athleteId)
  );

  if (
    parsed?.version !== PUBLIC_ROUTINE_CACHE_VERSION ||
    parsed.athleteId !== athleteId ||
    !Array.isArray(parsed.routine)
  ) {
    return null;
  }

  return {
    athlete: toAthleteFromCachedRoutine(parsed),
    lastSyncedAt: parsed.lastSyncedAt,
  };
};

export { getPublicAthleteRoutineCacheKey };
