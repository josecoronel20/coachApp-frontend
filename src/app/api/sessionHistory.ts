import { requireApiUrl } from "@/config/env";
import type { SessionHistoryItem } from "@/types/sessionHistoryType";

export async function getCoachAthleteHistory(
  athleteId: string
): Promise<SessionHistoryItem[]> {
  const API_URL = requireApiUrl();
  const response = await fetch(
    `${API_URL}/api/coach/getAthleteHistory/${athleteId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!response.ok) return [];
  const data = (await response.json()) as { sessions?: SessionHistoryItem[] };
  return data.sessions || [];
}

export async function getPublicAthleteHistory(
  athleteId: string
): Promise<SessionHistoryItem[]> {
  const API_URL = requireApiUrl();
  const response = await fetch(`${API_URL}/api/athletes/${athleteId}/history`, {
    method: "GET",
  });

  if (!response.ok) return [];
  const data = (await response.json()) as { sessions?: SessionHistoryItem[] };
  return data.sessions || [];
}
