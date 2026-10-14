export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: { field: string; issue: string }[] = [],
  ) {
    super(message);
  }
}
export type Options = {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
  binary?: boolean;
};
export class Api {
  constructor(
    private base: string,
    private token: () => string | null,
    private expired: () => void,
  ) {}
  async call<T>(
    path: string,
    { method = "GET", body, signal, binary = false }: Options = {},
  ): Promise<T> {
    const base = new URL(
      this.base.replace(/\/$/, "") + "/",
      window.location.origin,
    );
    if (
      base.protocol !== "https:" ||
      base.username ||
      base.password ||
      base.search ||
      base.hash
    )
      throw new ApiError(
        0,
        "TRANSPORT_REQUIRED",
        "Abre la aplicación con HTTPS y un certificado confiable para conectar con la biblioteca.",
      );
    const headers = new Headers({
      Accept: binary ? "image/jpeg,image/png" : "application/json",
    });
    const token = this.token();
    if (token) headers.set("Authorization", "Bearer " + token);
    const multipart = body instanceof FormData;
    if (body !== undefined && !multipart)
      headers.set("Content-Type", "application/json");
    let response: Response;
    try {
      response = await fetch(new URL(path.replace(/^\//, ""), base), {
        method,
        headers,
        body:
          body === undefined
            ? undefined
            : multipart
              ? body
              : JSON.stringify(body),
        signal,
        credentials: "omit",
        cache: "no-store",
        redirect: "error",
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new ApiError(
        0,
        "NETWORK_ERROR",
        "No se pudo conectar. Revisa la conexión e inténtalo de nuevo.",
      );
    }
    if (!response.ok) {
      if (response.status === 401 && token) this.expired();
      let error: unknown;
      try {
        error = await response.json();
      } catch {}
      const e = error as
        { code?: unknown; message?: unknown; details?: unknown } | undefined;
      const valid =
        e &&
        typeof e.code === "string" &&
        typeof e.message === "string" &&
        Array.isArray(e.details);
      throw new ApiError(
        response.status,
        valid ? (e.code as string) : "HTTP_ERROR",
        valid ? (e.message as string) : "No se pudo completar la operación.",
        valid
          ? (e.details as unknown[]).filter(
              (d): d is { field: string; issue: string } =>
                !!d &&
                typeof d === "object" &&
                typeof (d as { field?: unknown }).field === "string" &&
                typeof (d as { issue?: unknown }).issue === "string",
            )
          : [],
      );
    }
    if (response.status === 204) return undefined as T;
    if (binary) return (await response.blob()) as T;
    return (await response.json()) as T;
  }
}
export function query(values: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(values))
    if (v !== undefined && v !== "") q.set(k, String(v));
  return "?" + q.toString();
}
