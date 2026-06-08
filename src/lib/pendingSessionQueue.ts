import type { SaveSessionBodyDTO } from "@coachapp/shared";
import { saveSession } from "@/app/api/athlete";
import {
  canUseAthleteOfflineStorage,
  PENDING_SESSION_QUEUE_KEY,
  readOfflineJson,
  writeOfflineJson,
} from "@/lib/athleteOfflineStorage";

const PENDING_SESSION_QUEUE_VERSION = 1;

type PendingSessionStatus = "pending" | "syncing" | "failed";

export type PendingSessionPayload = SaveSessionBodyDTO & {
  clientSessionId: string;
};

export type PendingSessionItem = {
  version: typeof PENDING_SESSION_QUEUE_VERSION;
  localId: string;
  clientSessionId: string;
  athleteId: string;
  athletePublicId: string;
  routineDayId: string;
  routineDayName: string;
  payload: PendingSessionPayload;
  createdAt: string;
  lastAttemptAt?: string;
  retryCount: number;
  status: PendingSessionStatus;
  attempts: number;
  lastError?: string;
};

export type PendingSessionSyncResult = {
  synced: number;
  failed: number;
  pending: number;
  skipped: boolean;
};

let activeSyncPromise: Promise<PendingSessionSyncResult> | null = null;

const createStableHash = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
};

const createPendingSessionLocalId = (payload: PendingSessionPayload) => {
  const payloadIdentity = JSON.stringify({
    athleteId: payload.id,
    dayIndex: payload.dayIndex,
    sessionProgress: payload.sessionProgress,
  });

  return `session:${payload.id}:day:${payload.dayIndex}:${createStableHash(
    payloadIdentity
  )}`;
};

const normalizePendingSessionItem = (
  item: unknown
): PendingSessionItem | null => {
  if (!item || typeof item !== "object") return null;
  const candidate = item as Partial<PendingSessionItem>;
  const payload = candidate.payload as Partial<PendingSessionPayload>;

  if (
    candidate.version === PENDING_SESSION_QUEUE_VERSION &&
    typeof candidate.clientSessionId === "string" &&
    candidate.clientSessionId.length > 0 &&
    typeof candidate.athleteId === "string" &&
    candidate.athleteId.length > 0 &&
    !!payload &&
    typeof payload === "object" &&
    typeof payload.id === "string" &&
    typeof payload.dayIndex === "number" &&
    Array.isArray(payload.sessionProgress)
  ) {
    const normalizedPayload: PendingSessionPayload = {
      id: payload.id,
      dayIndex: payload.dayIndex,
      clientSessionId: candidate.clientSessionId,
      sessionProgress: payload.sessionProgress,
    };
    const retryCount =
      typeof candidate.retryCount === "number"
        ? candidate.retryCount
        : candidate.attempts ?? 0;
    const status: PendingSessionStatus =
      candidate.status === "failed"
        ? "failed"
        : candidate.status === "syncing"
        ? "pending"
        : "pending";

    return {
      version: PENDING_SESSION_QUEUE_VERSION,
      localId:
        candidate.localId ?? createPendingSessionLocalId(normalizedPayload),
      clientSessionId: candidate.clientSessionId,
      athleteId: candidate.athleteId,
      athletePublicId: candidate.athletePublicId ?? candidate.athleteId,
      routineDayId: candidate.routineDayId ?? `day:${payload.dayIndex}`,
      routineDayName:
        candidate.routineDayName ?? `Dia ${payload.dayIndex + 1}`,
      payload: normalizedPayload,
      createdAt: candidate.createdAt ?? new Date().toISOString(),
      lastAttemptAt: candidate.lastAttemptAt,
      retryCount,
      status,
      attempts: candidate.attempts ?? retryCount,
      lastError: candidate.lastError,
    };
  }

  return null;
};

export const createClientSessionId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const listPendingSessions = (): PendingSessionItem[] => {
  const parsed = readOfflineJson<unknown>(PENDING_SESSION_QUEUE_KEY);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map(normalizePendingSessionItem)
    .filter((item): item is PendingSessionItem => item !== null);
};

const writePendingSessions = (items: PendingSessionItem[]) => {
  writeOfflineJson(PENDING_SESSION_QUEUE_KEY, items);
};

export const enqueuePendingSession = (payload: PendingSessionPayload) => {
  const queue = listPendingSessions();
  const now = new Date().toISOString();
  const localId = createPendingSessionLocalId(payload);
  const existingIndex = queue.findIndex(
    (item) =>
      item.localId === localId ||
      item.clientSessionId === payload.clientSessionId
  );
  const previousItem = queue[existingIndex];

  const nextItem: PendingSessionItem = {
    version: PENDING_SESSION_QUEUE_VERSION,
    localId,
    clientSessionId: payload.clientSessionId,
    athleteId: payload.id,
    athletePublicId: payload.id,
    routineDayId: `day:${payload.dayIndex}`,
    routineDayName: `Dia ${payload.dayIndex + 1}`,
    payload,
    createdAt: previousItem?.createdAt ?? now,
    lastAttemptAt: previousItem?.lastAttemptAt,
    retryCount: previousItem?.retryCount ?? 0,
    status: "pending",
    attempts: previousItem?.attempts ?? 0,
    lastError: previousItem?.lastError,
  };

  if (existingIndex >= 0) {
    queue[existingIndex] = nextItem;
  } else {
    queue.push(nextItem);
  }

  writePendingSessions(queue);
};

export const removePendingSession = (clientSessionId: string) => {
  writePendingSessions(
    listPendingSessions().filter(
      (item) => item.clientSessionId !== clientSessionId
    )
  );
};

export const hasPendingSessions = () => listPendingSessions().length > 0;

const markAttempt = (clientSessionId: string, lastError?: string) => {
  const now = new Date().toISOString();
  const queue = listPendingSessions().map((item) =>
    item.clientSessionId === clientSessionId
      ? {
          ...item,
          retryCount: item.retryCount + 1,
          attempts: item.attempts + 1,
          lastAttemptAt: now,
          status: "failed" as const,
          lastError,
        }
      : item
  );
  writePendingSessions(queue);
};

const markSessionStatus = (
  clientSessionId: string,
  status: PendingSessionStatus,
  lastError?: string
) => {
  const queue = listPendingSessions().map((item) =>
    item.clientSessionId === clientSessionId
      ? {
          ...item,
          status,
          lastError,
        }
      : item
  );
  writePendingSessions(queue);
};

export const isRetryableSessionSaveFailure = (response: Response) =>
  response.status >= 500 || response.status === 0;

const runPendingSessionSync = async (): Promise<PendingSessionSyncResult> => {
    if (
      !canUseAthleteOfflineStorage() ||
      (typeof navigator !== "undefined" && !navigator.onLine)
    ) {
      const pending = listPendingSessions().length;
      return { synced: 0, failed: 0, pending, skipped: true };
    }

    const queue = listPendingSessions();
    let synced = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        markSessionStatus(item.clientSessionId, "syncing");

        const response = await saveSession(
          item.payload.id,
          item.payload.dayIndex,
          item.payload.sessionProgress,
          item.payload.clientSessionId
        );

        if (response.ok) {
          removePendingSession(item.clientSessionId);
          synced += 1;
          continue;
        }

        failed += 1;
        markAttempt(
          item.clientSessionId,
          `HTTP ${response.status}: no se pudo sincronizar la sesion.`
        );
      } catch (error) {
        failed += 1;
        markAttempt(
          item.clientSessionId,
          error instanceof Error
            ? error.message
            : "Error de conexion al sincronizar."
        );
      }
    }

    return {
      synced,
      failed,
      pending: listPendingSessions().length,
      skipped: false,
    };
  };

export const syncPendingSessions =
  async (): Promise<PendingSessionSyncResult> => {
    if (activeSyncPromise) {
      return activeSyncPromise;
    }

    activeSyncPromise = runPendingSessionSync();

    try {
      return await activeSyncPromise;
    } finally {
      activeSyncPromise = null;
    }
  };
