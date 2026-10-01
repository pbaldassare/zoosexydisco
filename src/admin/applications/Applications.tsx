import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Mail, Phone } from "lucide-react";
import { Field, Select, Textarea } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { WhatsAppGlyph } from "@/components/ui/icons";
import { adminClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { telLink, waLink } from "@/lib/whatsapp";
import { Notice } from "../AuthShell";
import { removeFiles } from "../media/upload";
import { Sheet } from "../shared/Sheet";
import { listRows, saveRow } from "../shared/rows";

type Status = "new" | "contacted" | "trial" | "hired" | "rejected";
type Application = {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  city: string | null;
  phone: string;
  email: string;
  role_id: string | null;
  experience: string | null;
  availability: { days?: string[]; period?: string | null; travel?: boolean | null };
  photo_paths: string[];
  cv_path: string | null;
  extra_paths: string[];
  notes: string | null;
  status: Status;
  internal_notes: string | null;
  delete_after: string;
  created_at: string;
};

const STATUS: { id: Status; label: string; cls: string }[] = [
  { id: "new", label: "Nuova", cls: "bg-pink/15 text-pink-core" },
  { id: "contacted", label: "Contattata", cls: "bg-blue/15 text-blue-core" },
  { id: "trial", label: "In prova", cls: "bg-blue/15 text-blue-core" },
  { id: "hired", label: "Assunta", cls: "bg-ok/15 text-ok" },
  { id: "rejected", label: "Scartata", cls: "bg-line text-ink-dim" },
];
const WEEK = ["lun", "mar", "mer", "gio", "ven", "sab", "dom"];
const KEY = ["admin", "applications"];
const db = () => adminClient!;
const daysLeft = (iso: string) => Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 86_400_000));
const when = (iso: string) => new Date(iso).toLocaleDateString("it-IT", { timeZone: "Europe/Rome", day: "numeric", month: "short", year: "numeric" });

function age(birth: string) {
  const b = new Date(birth);
  const n = new Date();
  return n.getFullYear() - b.getFullYear() - (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate()) ? 1 : 0);
}

/** Tutti i file sono nel bucket privato: si aprono con link firmati di 5 minuti. */
async function signAll(paths: string[]): Promise<Record<string, string>> {
  if (!paths.length) return {};
  const { data } = await db().storage.from("applications").createSignedUrls(paths, 300);
  const out: Record<string, string> = {};
  for (const d of data ?? []) if (d.path && d.signedUrl) out[d.path] = d.signedUrl;
  return out;
}

async function removeApplications(rows: Application[]) {
  await removeFiles("applications", rows.flatMap((r) => [...r.photo_paths, r.cv_path, ...r.extra_paths]));
  const { error } = await db().from("applications").delete().in("id", rows.map((r) => r.id));
  if (error) throw error;
}

/** Candidature: riservate, si leggono solo qui. Si cancellano da sole dopo 12 mesi. */
export function Applications() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: KEY, queryFn: () => listRows<Application>("applications", [{ column: "created_at", ascending: false }]) });
  const roles = useQuery({ queryKey: ["admin", "job-roles"], queryFn: () => listRows<{ id: string; name_it: string; sort: number }>("job_roles", [{ column: "sort" }]) });
  const rows = useMemo(() => list.data ?? [], [list.data]);
  const thumbs = useQuery({ queryKey: ["admin", "application-thumbs", rows.map((r) => r.id).join()], queryFn: () => signAll(rows.map((r) => r.photo_paths[0]).filter(Boolean) as string[]), enabled: rows.length > 0, staleTime: 240_000 });

  const [status, setStatus] = useState<Status | "all">("all");
  const [role, setRole] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [confirmMany, setConfirmMany] = useState(false);
  const [open, setOpen] = useState<Application | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: KEY });
  const removeMany = useMutation({ mutationFn: () => removeApplications(rows.filter((r) => picked.includes(r.id))), onSuccess: async () => (setPicked([]), setConfirmMany(false), refresh()) });

  if (list.isLoading) return <p className="text-ink-dim">Carico le candidature…</p>;
  if (list.error) return <Notice tone="error">Non riesco a leggere le candidature. Ricarica la pagina.</Notice>;

  const roleName = (id: string | null) => roles.data?.find((r) => r.id === id)?.name_it ?? "Ruolo tolto";
  const shown = rows.filter((r) => (status === "all" || r.status === status) && (!role || r.role_id === role));
  const count = (s: Status) => rows.filter((r) => r.status === s).length;

  return (
    <div className="pb-16">
      <h1 className="tube tube-pink text-3xl">Candidature</h1>
      <p className="mt-3 max-w-prose text-sm text-ink-dim">
        Arrivano dal modulo di Lavora con noi e le vedete solo voi. Ognuna si cancella da sola, con foto e allegati, 12 mesi dopo l'invio.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Select aria-label="Stato" value={status} onChange={(e) => setStatus(e.target.value as Status | "all")}>
          <option value="all">Tutti gli stati ({rows.length})</option>
          {STATUS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label} ({count(s.id)})
            </option>
          ))}
        </Select>
        <Select aria-label="Ruolo" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Tutti i ruoli</option>
          {(roles.data ?? []).map((r) => (
            <option key={r.id} value={r.id}>
              {r.name_it}
            </option>
          ))}
        </Select>
      </div>

      {picked.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-tile border border-danger/40 p-3">
          <span className="text-sm text-ink">{picked.length} selezionate</span>
          {confirmMany ? (
            <>
              <Button type="button" size="sm" className="bg-danger text-wall" disabled={removeMany.isPending} onClick={() => removeMany.mutate()}>
                Sì, cancella con foto e allegati
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmMany(false)}>
                No
              </Button>
            </>
          ) : (
            <Button type="button" variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={() => setConfirmMany(true)}>
              Elimina le selezionate
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={() => setPicked([])}>
            Deseleziona
          </Button>
        </div>
      )}

      {!shown.length && <p className="mt-8 text-ink-dim">Nessuna candidatura{rows.length ? " con questi filtri" : ""}.</p>}
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {shown.map((r) => {
          const s = STATUS.find((x) => x.id === r.status)!;
          const left = daysLeft(r.delete_after);
          const name = `${r.first_name} ${r.last_name}`;
          return (
            <li key={r.id} className="flex items-center gap-3 py-3">
              <input
                type="checkbox"
                aria-label={`Seleziona ${name}`}
                checked={picked.includes(r.id)}
                onChange={(e) => setPicked((p) => (e.target.checked ? [...p, r.id] : p.filter((x) => x !== r.id)))}
                className="size-5 shrink-0 accent-pink"
              />
              <button type="button" onClick={() => setOpen(r)} className="flex min-w-0 flex-1 items-center gap-3 text-left hover:text-pink-core">
                <span className="size-14 shrink-0 overflow-hidden rounded-[14px] bg-panel">
                  {thumbs.data?.[r.photo_paths[0] ?? ""] && <img src={thumbs.data[r.photo_paths[0]!]} alt="" className="h-full w-full object-cover" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-ink">{name}</span>
                    <span className={cn("label rounded-pill px-2 py-1", s.cls)}>{s.label}</span>
                  </span>
                  <span className="block truncate text-sm text-ink-dim">
                    {roleName(r.role_id)} · {age(r.birth_date)} anni{r.city ? ` · ${r.city}` : ""} · {when(r.created_at)}
                  </span>
                  <span className={cn("block text-xs", left <= 30 ? "text-danger" : "text-ink-faint")}>si cancella tra {left} giorni</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {removeMany.isError && <p className="mt-4 text-sm text-danger">Cancellazione non riuscita. Riprova.</p>}

      {open && <Detail key={open.id} app={open} roleName={roleName(open.role_id)} onClose={() => setOpen(null)} onChanged={refresh} />}
    </div>
  );
}

function Detail({ app, roleName, onClose, onChanged }: { app: Application; roleName: string; onClose: () => void; onChanged: () => Promise<unknown> }) {
  const [status, setStatus] = useState<Status>(app.status);
  const [notes, setNotes] = useState(app.internal_notes ?? "");
  const files = useQuery({ queryKey: ["admin", "application-files", app.id], queryFn: () => signAll([...app.photo_paths, app.cv_path, ...app.extra_paths].filter(Boolean) as string[]), staleTime: 240_000 });
  const save = useMutation({ mutationFn: () => saveRow("applications", app.id, { status, internal_notes: notes.trim() || null }), onSuccess: async () => (await onChanged(), onClose()) });
  const remove = useMutation({ mutationFn: () => removeApplications([app]), onSuccess: async () => (await onChanged(), onClose()) });
  const tel = telLink(app.phone);
  const a = app.availability ?? {};
  const name = `${app.first_name} ${app.last_name}`;

  return (
    <Sheet
      title={name}
      saving={save.isPending || remove.isPending}
      error={save.error ?? remove.error}
      onSave={() => save.mutate()}
      onClose={onClose}
      onDelete={() => remove.mutate()}
      deleteNote="Si cancella con foto e allegati, per sempre."
    >
      <p className="-mt-3 text-ink-dim">
        {roleName} · {age(app.birth_date)} anni{app.city ? ` · ${app.city}` : ""}
      </p>

      <div className="grid grid-cols-3 gap-2">
        {app.photo_paths.map((p) => (
          <a key={p} href={files.data?.[p]} target="_blank" rel="noreferrer" className="block aspect-[3/4] overflow-hidden rounded-[14px] bg-panel">
            {files.data?.[p] && <img src={files.data[p]} alt={`Foto di ${name}`} className="h-full w-full object-cover" />}
          </a>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <a href={waLink(app.phone, `Ciao ${app.first_name}, ti scriviamo da ZOO Sexy Disco per la tua candidatura.`)} target="_blank" rel="noopener">
            <WhatsAppGlyph className="size-4" /> WhatsApp
          </a>
        </Button>
        {tel && (
          <Button asChild variant="outline" size="sm">
            <a href={tel}>
              <Phone className="size-4" aria-hidden /> {app.phone}
            </a>
          </Button>
        )}
        <Button asChild variant="outline" size="sm">
          <a href={`mailto:${app.email}`}>
            <Mail className="size-4" aria-hidden /> {app.email}
          </a>
        </Button>
      </div>

      {(app.cv_path || app.extra_paths.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {[app.cv_path, ...app.extra_paths].filter(Boolean).map((p, i) => (
            <Button key={p} asChild variant="ghost" size="sm">
              <a href={files.data?.[p!]} target="_blank" rel="noreferrer">
                <FileText className="size-4" aria-hidden /> {i === 0 && app.cv_path ? "Curriculum" : `Allegato ${app.cv_path ? i : i + 1}`}
              </a>
            </Button>
          ))}
        </div>
      )}

      <dl className="grid gap-4 text-sm">
        <Row k="Disponibilità">
          {a.days?.length ? a.days.map((d) => WEEK[Number(d) - 1]).join(", ") : "—"}
          {a.period ? ` · ${a.period}` : ""}
          {a.travel != null ? ` · trasferte: ${a.travel ? "sì" : "no"}` : ""}
        </Row>
        <Row k="Esperienza">{app.experience || "—"}</Row>
        <Row k="Note della candidata">{app.notes || "—"}</Row>
        <Row k="Data di nascita">{new Date(app.birth_date).toLocaleDateString("it-IT")}</Row>
        <Row k="Arrivata il">{when(app.created_at)} · si cancella tra {daysLeft(app.delete_after)} giorni</Row>
      </dl>

      <Field label="Stato">
        {(id) => (
          <Select id={id} value={status} onChange={(e) => setStatus(e.target.value as Status)}>
            {STATUS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="Note interne" hint="Le leggete solo voi.">
        {(id, d) => <Textarea id={id} aria-describedby={d} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />}
      </Field>
    </Sheet>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="label text-ink-faint">{k}</dt>
      <dd className="mt-1 whitespace-pre-line text-ink">{children}</dd>
    </div>
  );
}
