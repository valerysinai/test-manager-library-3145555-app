import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import { ApiError } from "./api";
import type { Page } from "./types";
export function Failure({ error }: { error: unknown }) {
  return error ? (
    <div className="notice error" role="alert">
      {error instanceof ApiError
        ? error.message
        : "No se pudo completar la operación."}
      {error instanceof ApiError && error.details.length > 0 && (
        <ul>
          {error.details.map((d, i) => (
            <li key={i}>
              {d.field}: {d.issue}
            </li>
          ))}
        </ul>
      )}
    </div>
  ) : null;
}
export function useLoad<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  keys: unknown[],
) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<unknown>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    setError(undefined);
    setData(undefined);
    loader(c.signal)
      .then((v) => {
        if (!c.signal.aborted) setData(v);
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(e);
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, keys);
  return { data, error, loading };
}
export function Loading() {
  return (
    <p role="status" className="muted">
      Consultando la biblioteca…
    </p>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
export function Pager({
  data,
  onPage,
}: {
  data: Page<unknown>;
  onPage: (n: number) => void;
}) {
  return (
    <div className="pager">
      <span>
        {data.total} resultados · Página {data.page}
      </span>
      <button disabled={data.page <= 1} onClick={() => onPage(data.page - 1)}>
        Anterior
      </button>
      <button
        disabled={data.page * data.size >= data.total}
        onClick={() => onPage(data.page + 1)}
      >
        Siguiente
      </button>
    </div>
  );
}
export function date(value: string) {
  return (
    new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(value)) + " UTC"
  );
}
export function ActionForm({
  children,
  onSubmit,
  label = "Guardar",
  onDone,
}: {
  children: ReactNode;
  onSubmit: (data: FormData) => Promise<unknown>;
  label?: string;
  onDone?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    setError(undefined);
    try {
      await onSubmit(values);
      form.reset();
      onDone?.();
    } catch (e) {
      setError(e);
    } finally {
      form
        .querySelectorAll<HTMLInputElement>('input[type="password"]')
        .forEach((input) => {
          input.value = "";
        });
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <Failure error={error} />
      <fieldset disabled={busy}>
        {children}
        <button className="primary" type="submit">
          {busy ? "Guardando…" : label}
        </button>
      </fieldset>
    </form>
  );
}
export const text = (f: FormData, k: string) => String(f.get(k) ?? "");
