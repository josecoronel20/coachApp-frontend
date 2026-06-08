import useSWR from "swr";
import { isAuthenticated } from "@/app/api/auth";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

async function authStatusFetcher(): Promise<AuthStatus> {
  const res = await isAuthenticated();
  return res.ok ? "authenticated" : "unauthenticated";
}

/**
 * Fuente única de verdad para auth del coach (cookie en backend).
 * Centraliza el request y permite deduplicación/caching.
 */
export function useAuthStatus() {
  const { data, isLoading, mutate, error } = useSWR<AuthStatus>(
    "auth-status",
    authStatusFetcher,
    {
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    }
  );

  const status: AuthStatus = isLoading ? "loading" : data ?? "unauthenticated";

  return { status, isLoading: status === "loading", mutate, error };
}

