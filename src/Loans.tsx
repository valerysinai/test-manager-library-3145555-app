import { useState } from "react";
import { Api, ApiError, query } from "./api";
import type { Book, Loan, Member, Page, Overdue } from "./types";
import {
  ActionForm,
  date,
  Failure,
  Field,
  Loading,
  Pager,
  Panel,
  text,
  useLoad,
} from "./ui";
function Picker<T extends Book | Member>({
  api,
  kind,
  onPick,
}: {
  api: Api;
  kind: "books" | "members";
  onPick: (value: T) => void;
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { data, error, loading } = useLoad<Page<T>>(
    (s) => api.call("/" + kind + query({ q, page, size: 5 }), { signal: s }),
    [api, kind, q, page],
  );
  return (
    <div className="picker">
      <Field
        label={
          kind === "books"
            ? "Buscar libro para prestar"
            : "Buscar socio para el préstamo"
        }
      >
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
      </Field>
      <Failure error={error} />
      {loading && <Loading />}
      {data && (
        <>
          <ul className="choices">
            {data.items.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  disabled={"available_copies" in v && v.available_copies === 0}
                  onClick={() => onPick(v)}
                >
                  {"title" in v ? (
                    <>
                      {v.title}{" "}
                      <small>
                        {v.author} · {v.available_copies} disponibles
                      </small>
                    </>
                  ) : (
                    <>
                      {v.full_name} <small>{v.document_number}</small>
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
          {data.items.length === 0 && <p>No hay resultados.</p>}
          <Pager data={data} onPage={setPage} />
        </>
      )}
    </div>
  );
}
function NewLoan({ api, onDone }: { api: Api; onDone: (id?: string) => void }) {
  const [member, setMember] = useState<Member>();
  const [books, setBooks] = useState<Book[]>([]);
  const detail = useLoad<Member | undefined>(
    (s) =>
      member
        ? api.call(`/members/${member.id}`, { signal: s })
        : Promise.resolve(undefined),
    [api, member],
  );
  return (
    <Panel title="Registrar préstamo">
      <p className="muted">
        Selecciona un socio y de uno a tres libros distintos. Un ejemplar de
        cada libro.
      </p>
      <div className="form-grid">
        <Picker<Member> api={api} kind="members" onPick={setMember} />
        <Picker<Book>
          api={api}
          kind="books"
          onPick={(b) =>
            setBooks((current) =>
              current.some((v) => v.id === b.id) || current.length === 3
                ? current
                : [...current, b],
            )
          }
        />
      </div>
      <Failure error={detail.error} />
      <div className="selection">
        <h3>{member ? member.full_name : "Selecciona un socio"}</h3>
        {detail.data && (
          <p>{detail.data.active_loans} libros sin devolver actualmente</p>
        )}
        <ul>
          {books.map((b) => (
            <li key={b.id}>
              {b.title}{" "}
              <button
                type="button"
                onClick={() =>
                  setBooks((current) => current.filter((v) => v.id !== b.id))
                }
                aria-label={`Quitar ${b.title}`}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
        <p>{books.length} de 3 libros seleccionados</p>
      </div>
      <ActionForm
        label="Confirmar préstamo"
        onSubmit={async () => {
          if (!member || books.length === 0)
            throw new ApiError(
              422,
              "VALIDATION_ERROR",
              "Selecciona un socio y al menos un libro.",
            );
          const loan = await api.call<Loan>("/loans", {
            method: "POST",
            body: {
              member_id: member.id,
              items: books.map((b) => ({ book_id: b.id })),
            },
          });
          onDone(loan.id);
        }}
      >
        <span />
      </ActionForm>
      <button className="quiet" onClick={() => onDone()}>
        Cancelar
      </button>
    </Panel>
  );
}
function LoanDetail({
  api,
  id,
  onChange,
}: {
  api: Api;
  id: string;
  onChange: () => void;
}) {
  const [revision, setRevision] = useState(0);
  const { data, error, loading } = useLoad<Loan>(
    (s) => api.call(`/loans/${id}`, { signal: s }),
    [api, id, revision],
  );
  return (
    <Panel title="Detalle del préstamo">
      <Failure error={error} />
      {loading && <Loading />}
      {data && (
        <>
          <p className="muted">
            {date(data.loaned_at)} · {statusName(data.status)}
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Libro e ISBN congelados</th>
                  <th>Categoría</th>
                  <th>Vencimiento</th>
                  <th>Devolución</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.book_title}</strong>
                      <small>{item.isbn}</small>
                    </td>
                    <td>{item.category_name}</td>
                    <td>{date(item.due_at)}</td>
                    <td>
                      {item.returned_at ? (
                        date(item.returned_at)
                      ) : (
                        <ActionForm
                          label="Devolver ejemplar"
                          onSubmit={() =>
                            api.call(`/loans/${id}/items/${item.id}/return`, {
                              method: "POST",
                            })
                          }
                          onDone={() => {
                            setRevision((n) => n + 1);
                            onChange();
                          }}
                        >
                          <span />
                        </ActionForm>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Panel>
  );
}
const statusName = (status: Loan["status"]) =>
  ({ open: "Abierto", overdue: "Vencido", closed: "Cerrado" })[status];
function MemberFilter({ api }: { api: Api }) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState("");
  const { data, error } = useLoad<Page<Member>>(
    (s) => api.call("/members" + query({ q, size: 50 }), { signal: s }),
    [api, q],
  );
  return (
    <>
      <Field label="Buscar socio (opcional)">
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSelected("");
          }}
        />
      </Field>
      <Field label="Socio">
        <select
          name="member_id"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Todos los socios</option>
          {data?.items.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name} · {m.document_number}
            </option>
          ))}
        </select>
      </Field>
      <Failure error={error} />
    </>
  );
}
function MemberName({ api, id }: { api: Api; id: string }) {
  const { data, error } = useLoad<Member>(
    (s) => api.call(`/members/${id}`, { signal: s }),
    [api, id],
  );
  return (
    <>{data?.full_name ?? (error ? "No disponible" : "Consultando socio…")}</>
  );
}
export function Loans({ api }: { api: Api }) {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    status: "",
    member_id: "",
    page: 1,
  });
  const [revision, setRevision] = useState(0);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<string>();
  const { data, error, loading } = useLoad<Page<Loan>>(
    (s) => api.call("/loans" + query({ ...filters, size: 20 }), { signal: s }),
    [api, filters, revision],
  );
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">CIRCULACIÓN</p>
          <h1>Préstamos y devoluciones</h1>
          <p className="muted">
            Cada libro lleva su propio plazo y devolución.
          </p>
        </div>
        <button className="primary" onClick={() => setCreating((v) => !v)}>
          Nuevo préstamo
        </button>
      </div>
      {creating && (
        <NewLoan
          api={api}
          onDone={(id) => {
            setCreating(false);
            if (id) setSelected(id);
            setRevision((n) => n + 1);
          }}
        />
      )}
      <form
        className="filters"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setFilters({
            from: text(f, "from"),
            to: text(f, "to"),
            status: text(f, "status"),
            member_id: text(f, "member_id"),
            page: 1,
          });
        }}
      >
        <Field label="Desde">
          <input type="date" name="from" />
        </Field>
        <Field label="Hasta">
          <input type="date" name="to" />
        </Field>
        <Field label="Estado">
          <select name="status">
            <option value="">Todos</option>
            <option value="open">Abiertos</option>
            <option value="overdue">Vencidos</option>
            <option value="closed">Cerrados</option>
          </select>
        </Field>
        <MemberFilter api={api} />
        <button>Filtrar</button>
      </form>
      <Failure error={error} />
      {loading && <Loading />}
      {data && (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha del préstamo</th>
                  <th>Socio</th>
                  <th>Libros</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((l) => (
                  <tr key={l.id}>
                    <td>{date(l.loaned_at)}</td>
                    <td>
                      <MemberName api={api} id={l.member_id} />
                    </td>
                    <td>{l.items.length}</td>
                    <td>
                      <span className={"badge " + l.status}>
                        {statusName(l.status)}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => setSelected(l.id)}>
                        Ver préstamo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.items.length === 0 && (
            <p className="empty">No hay préstamos para estos filtros.</p>
          )}
          <Pager
            data={data}
            onPage={(page) => setFilters({ ...filters, page })}
          />
        </>
      )}
      {selected && (
        <LoanDetail
          key={selected}
          api={api}
          id={selected}
          onChange={() => setRevision((n) => n + 1)}
        />
      )}
    </>
  );
}
export function Overdues({ api }: { api: Api }) {
  const [selected, setSelected] = useState<string>();
  const [revision, setRevision] = useState(0);
  const { data, error, loading } = useLoad<{ items: Overdue[] }>(
    (s) => api.call("/loans/overdue", { signal: s }),
    [api, revision],
  );
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">SEGUIMIENTO</p>
          <h1>Libros vencidos</h1>
          <p className="muted">
            Ordenados por días de atraso, de mayor a menor.
          </p>
        </div>
        <button onClick={() => setRevision((n) => n + 1)}>Actualizar</button>
      </div>
      <Failure error={error} />
      {loading && <Loading />}
      {data && (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Libro</th>
                  <th>Socio</th>
                  <th>Vencimiento</th>
                  <th>Días de atraso</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((i) => (
                  <tr key={i.item_id}>
                    <td>{i.book_title}</td>
                    <td>{i.member_name}</td>
                    <td>{date(i.due_at)}</td>
                    <td>
                      <span className="badge overdue">{i.days_late}</span>
                    </td>
                    <td>
                      <button onClick={() => setSelected(i.loan_id)}>
                        Ver y devolver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.items.length === 0 && (
            <p className="empty">No hay libros vencidos.</p>
          )}
        </>
      )}
      {selected && (
        <LoanDetail
          api={api}
          id={selected}
          onChange={() => setRevision((n) => n + 1)}
        />
      )}
    </>
  );
}
