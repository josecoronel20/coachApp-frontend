export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ path?: string[] }> | { path?: string[] };
};

const hopByHopHeaders = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function getProxyTarget(): string {
  const target = process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_URL;
  if (!target) {
    throw new Error("Missing API_PROXY_TARGET for Next API proxy.");
  }
  return target.replace(/\/+$/, "");
}

async function getPath(context: RouteContext): Promise<string> {
  const params = await context.params;
  return (params.path || []).map(encodeURIComponent).join("/");
}

function buildBackendUrl(request: Request, path: string): string {
  const incomingUrl = new URL(request.url);
  const backendUrl = new URL(`/api/${path}`, getProxyTarget());
  backendUrl.search = incomingUrl.search;
  return backendUrl.toString();
}

function buildRequestHeaders(request: Request): Headers {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  return headers;
}

function buildResponseHeaders(backendResponse: Response): Headers {
  const headers = new Headers();
  backendResponse.headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key.toLowerCase()) && key.toLowerCase() !== "set-cookie") {
      headers.set(key, value);
    }
  });

  const cookieHeaders =
    typeof backendResponse.headers.getSetCookie === "function"
      ? backendResponse.headers.getSetCookie()
      : [];

  if (cookieHeaders.length > 0) {
    cookieHeaders.forEach((cookie) => headers.append("set-cookie", cookie));
  } else {
    const cookie = backendResponse.headers.get("set-cookie");
    if (cookie) headers.append("set-cookie", cookie);
  }

  return headers;
}

async function proxyRequest(request: Request, context: RouteContext): Promise<Response> {
  try {
    const path = await getPath(context);
    const body =
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer();

    const backendResponse = await fetch(buildBackendUrl(request, path), {
      method: request.method,
      headers: buildRequestHeaders(request),
      body,
      cache: "no-store",
      redirect: "manual",
    });

    const responseBody =
      request.method === "HEAD" ? undefined : await backendResponse.arrayBuffer();

    return new Response(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: buildResponseHeaders(backendResponse),
    });
  } catch (error) {
    console.error("Next API proxy error:", error);
    return Response.json(
      { message: "No se pudo conectar con el backend" },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
