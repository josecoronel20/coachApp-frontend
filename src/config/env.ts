export const env = {
  apiUrl:
    process.env.NEXT_PUBLIC_USE_API_PROXY === "true"
      ? ""
      : process.env.NEXT_PUBLIC_API_URL,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  useApiProxy: process.env.NEXT_PUBLIC_USE_API_PROXY === "true",
} as const;

export function requireApiUrl(): string {
  if (env.useApiProxy) return "";

  if (!env.apiUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_URL. Add it to frontend/.env (e.g. http://localhost:3001) or enable NEXT_PUBLIC_USE_API_PROXY=true."
    );
  }
  return env.apiUrl;
}

