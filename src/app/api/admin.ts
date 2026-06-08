import { requireApiUrl } from "@/config/env";

/** El secret se guarda en sessionStorage tras la primera visita al dashboard. */
export const getAdminSecret = (): string => {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("admin-secret") ?? "";
};

function adminHeaders(secret: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Admin-Secret": secret,
  };
}

const api = (path: string, secret: string, options?: RequestInit) => {
  const API_URL = requireApiUrl();
  return fetch(`${API_URL}/api/admin${path}`, {
    ...options,
    headers: { ...adminHeaders(secret), ...options?.headers },
  });
};

export const adminApi = {
  getActivity: (secret: string) => api("/activity", secret),
  getBetaRequests: (secret: string) => api("/beta-requests", secret),
  approveBetaRequest: (secret: string, id: string) =>
    api(`/beta-requests/${id}/approve`, secret, { method: "PATCH" }),
  rejectBetaRequest: (secret: string, id: string) =>
    api(`/beta-requests/${id}/reject`, secret, { method: "PATCH" }),
  getCoaches: (secret: string) => api("/coaches", secret),
  getTokens: (secret: string) => api("/tokens", secret),
  generateToken: (secret: string, email: string) =>
    api("/invite", secret, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  auditSessions: (secret: string) => api("/audit/sessions", secret),
  repairSnapshots: (secret: string) =>
    api("/audit/repair-snapshots", secret, { method: "POST" }),
};
