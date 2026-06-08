import { requireApiUrl } from "@/config/env";

export interface BetaRequestPayload {
  name: string;
  email: string;
  athleteCount: number;
  currentTool: string;
}

export const submitBetaRequest = async (payload: BetaRequestPayload) => {
  const API_URL = requireApiUrl();
  return fetch(`${API_URL}/api/beta/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

export const validateInviteToken = async (token: string) => {
  const API_URL = requireApiUrl();
  const res = await fetch(
    `${API_URL}/api/beta/validate-token?token=${encodeURIComponent(token)}`,
    { method: "GET" }
  );
  if (!res.ok) return { valid: false, reason: "error" as const };
  return res.json() as Promise<
    | { valid: true; email: string }
    | { valid: false; reason: "no_token" | "invalid" | "used" | "expired" | "error" }
  >;
};
