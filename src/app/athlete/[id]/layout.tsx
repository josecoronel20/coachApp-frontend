"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getAthleteById } from "@/app/api/athlete";
import { getApiErrorMessage } from "@/lib/apiError";
import { useAthleteStore } from "@/store/useAthleteStore";
import type { Athlete } from "@/types/athleteType";
import { normalizeRoutine } from "@/lib/routineExercise";
import { AthleteHomeSkeleton } from "@/components/loading/AthleteHomeSkeleton";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import {
  readPublicAthleteRoutineCache,
  writePublicAthleteRoutineCache,
} from "@/lib/publicAthleteRoutineCache";
import { AthleteStatusNotice } from "@/components/reusable/AthleteStatusNotice";
import {
  ATHLETE_LEGACY_CACHE_KEY,
  readOfflineJson,
  writeOfflineJson,
} from "@/lib/athleteOfflineStorage";

const offlineRoutineNotice =
  "Estás viendo una versión guardada en este dispositivo.";

const noOfflineRoutineMessage =
  "Necesitás abrir tu rutina una vez con internet antes de poder usarla sin conexión.";

const normalizeAthlete = (athlete: Athlete): Athlete => ({
  ...athlete,
  routine: normalizeRoutine(athlete.routine || []),
});

const AthleteLayout = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const { setAthlete, athlete } = useAthleteStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cachedRoutineNotice, setCachedRoutineNotice] = useState<string | null>(
    null
  );
  const athleteId = useMemo(() => String(params.id ?? ""), [params.id]);

  const loadAthlete = useCallback(async () => {
    if (!athleteId) return;

    let hasUsableCache = false;

    try {
      setIsLoading(true);
      setLoadError(null);
      setCachedRoutineNotice(null);

      const cachedRoutine = readPublicAthleteRoutineCache(athleteId);
      if (cachedRoutine) {
        setAthlete(cachedRoutine.athlete);
        setIsLoading(false);
        hasUsableCache = true;
      }

      const cached = readOfflineJson<Athlete>(ATHLETE_LEGACY_CACHE_KEY);
      if (!hasUsableCache && cached?.id && cached.id === athleteId) {
        const normalized = normalizeAthlete(cached);
        setAthlete(normalized);
        writePublicAthleteRoutineCache(normalized);
        writeOfflineJson(ATHLETE_LEGACY_CACHE_KEY, normalized);
        setIsLoading(false);
        hasUsableCache = true;
      }

      const response = await getAthleteById(athleteId);
      if (!response.ok) {
        const message = await getApiErrorMessage(
          response,
          "No pudimos cargar tu rutina. Comprobá tu conexión o pedí un enlace actualizado a tu entrenador."
        );
        if (!hasUsableCache) {
          setLoadError(message);
        } else {
          setCachedRoutineNotice(offlineRoutineNotice);
        }
        setIsLoading(false);
        return;
      }

      const data = normalizeAthlete((await response.json()) as Athlete);
      setAthlete(data);
      writePublicAthleteRoutineCache(data);
      writeOfflineJson(ATHLETE_LEGACY_CACHE_KEY, data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching athlete:", error);
      const cachedRoutine = readPublicAthleteRoutineCache(athleteId);
      if (cachedRoutine) {
        setAthlete(cachedRoutine.athlete);
        setCachedRoutineNotice(offlineRoutineNotice);
        setIsLoading(false);
        return;
      }

      if (!hasUsableCache) {
        setLoadError(noOfflineRoutineMessage);
      } else {
        setCachedRoutineNotice(offlineRoutineNotice);
      }
      setIsLoading(false);
    }
  }, [athleteId, setAthlete]);

  useEffect(() => {
    void loadAthlete();
  }, [loadAthlete]);

  if (isLoading || (!athlete && !loadError)) {
    return <AthleteHomeSkeleton />;
  }

  if (loadError && !athlete) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg-base px-4 text-center text-text-primary">
        <ErrorState
          title="No pudimos cargar tu rutina"
          description={loadError}
          action={
            <Button
              type="button"
              variant="primary"
              onClick={() => void loadAthlete()}
            >
              Reintentar
            </Button>
          }
        />
      </div>
    );
  }

  if (!athlete) {
    return <AthleteHomeSkeleton />;
  }

  return (
    <div className="min-h-dvh bg-bg-base text-text-primary">
      {cachedRoutineNotice ? (
        <div className="bg-bg-base px-4 py-3">
          <div className="mx-auto max-w-2xl">
            <AthleteStatusNotice
              message={cachedRoutineNotice}
              tone="warning"
            />
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
};

export default AthleteLayout;
