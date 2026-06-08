export type ParsedApiError = {
  message: string;
  code?: string;
};

/** Lee `{ message }` legacy o `{ message, error: { code, message } }` (DEC-010). */
export function parseApiErrorBody(body: unknown): ParsedApiError {
  if (!body || typeof body !== "object") {
    return { message: "Error desconocido" };
  }

  const root = body as Record<string, unknown>;
  const nested = root.error;

  if (nested && typeof nested === "object") {
    const err = nested as Record<string, unknown>;
    const message =
      (typeof err.message === "string" && err.message.trim()) ||
      (typeof root.message === "string" && root.message.trim()) ||
      "";
    if (message) {
      return {
        message,
        code: typeof err.code === "string" ? err.code : undefined,
      };
    }
  }

  if (typeof root.message === "string" && root.message.trim()) {
    return { message: root.message.trim() };
  }

  return { message: "Error desconocido" };
}

/** Mensaje legible desde un `Response` fallido (consume el body JSON). */
export async function getApiErrorMessage(
  res: Response,
  fallback?: string
): Promise<string> {
  try {
    const body = await res.json();
    const parsed = parseApiErrorBody(body);
    if (parsed.message !== "Error desconocido") {
      return parsed.message;
    }
  } catch {
    // body vacío o no JSON
  }
  return fallback ?? `Error HTTP ${res.status}`;
}
