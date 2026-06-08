export const ATHLETE_LEGACY_CACHE_KEY = "athlete";
export const PENDING_SESSION_QUEUE_KEY = "coachapp:pending-finished-sessions";

export const getPublicAthleteRoutineCacheKey = (athleteId: string) =>
  `coachapp:public-athlete-routine:${athleteId}`;

export const getSessionDraftKey = (athleteId: string, dayIndex: number) =>
  `coachapp:athlete-session-draft:${athleteId}:day:${dayIndex}`;

export const getCompletedDaysCacheKey = (athleteId: string) =>
  `coachapp:athlete-completed-days:${athleteId}`;

export const canUseAthleteOfflineStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const readOfflineJson = <T>(key: string): T | null => {
  if (!canUseAthleteOfflineStorage()) return null;

  try {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) return null;
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
};

export const writeOfflineJson = <T>(key: string, value: T) => {
  if (!canUseAthleteOfflineStorage()) return false;

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export const removeOfflineItem = (key: string) => {
  if (!canUseAthleteOfflineStorage()) return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};
