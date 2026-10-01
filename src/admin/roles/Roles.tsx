import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { Checkbox, Field, Input } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Notice } from "../AuthShell";
import { Sheet } from "../shared/Sheet";
import { deleteRow, listRows, moveRow, nextSort, saveRow } from "../shared/rows";

type Role = { id: string; name_it: string; name_en: string; active: boolean; sort: number };
type Draft = Omit<Role, "id" | "sort">;
const KEY = ["admin", "job-roles"];

/** I ruoli di «Lavora con noi»: l'elenco in pagina e la tendina del modulo di candidatura. */
export function Roles() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: KEY, queryFn: () => listRows<Role>("job_roles", [{ column: "sort" }]) });
  const [editing, setEditing] = useState<Role | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>({ name_it: "", name_en: "", active: true });
  const rows = list.data ?? [];

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: KEY });
    await qc.invalidateQueries({ queryKey: ["job-roles"] });
  };
  const save = useMutation({
    mutationFn: () =>
      saveRow("job_roles", editing === "new" ? null : editing!.id, {
        name_it: draft.name_it.trim(),
        name_en: draft.name_en.trim(),
        active: draft.active,
        ...(editing === "new" ? { sort: nextSort(rows) } : {}),
      }),
    onSuccess: async () => (await refresh(), setEditing(null)),
  });
  const remove = useMutation({ mutationFn: () => deleteRow("job_roles", (editing as Role).id), onSuccess: async () => (await refresh(), setEditing(null)) });
  const move = useMutation({ mutationFn: ([i, d]: [number, -1 | 1]) => moveRow("job_roles", rows, i, d), onSuccess: refresh });

  function open(r: Role | "new") {
    save.reset();
    remove.reset();
    setDraft(r === "new" ? { name_it: "", name_en: "", active: true } : { name_it: r.name_it, name_en: r.name_en, active: r.active });
    setEditing(r);
  }

  if (list.isLoading) return <p className="text-ink-dim">Carico i ruoli…</p>;
  if (list.error) return <Notice tone="error">Non riesco a leggere i ruoli. Ricarica la pagina.</Notice>;

  return (
    <div className="pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="tube tube-pink text-3xl">Ruoli</h1>
        <Button type="button" onClick={() => open("new")}>
          <Plus className="size-5" aria-hidden /> Aggiungi
        </Button>
      </div>
      <p className="mt-3 max-w-prose text-sm text-ink-dim">
        Le figure che cercate: compaiono in home, nella pagina Lavora con noi e nella tendina del modulo di candidatura, in quest'ordine. Usate titoli
        neutri rispetto al genere quando potete (per esempio «Barman / Barlady»).
      </p>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {rows.map((r, i) => (
          <li key={r.id} className="flex items-center gap-2 py-3">
            <button type="button" onClick={() => open(r)} className="min-w-0 flex-1 py-1 text-left hover:text-pink-core">
              <span className={cn("block text-lg font-bold", r.active ? "text-ink" : "text-ink-faint")}>{r.name_it}</span>
              <span className="block text-sm text-ink-dim">
                {r.name_en || "—"}
                {!r.active && " · non cercato adesso"}
              </span>
            </button>
            <button type="button" aria-label={`Sposta su ${r.name_it}`} disabled={i === 0 || move.isPending} onClick={() => move.mutate([i, -1])} className="grid size-11 place-items-center rounded-pill text-ink-dim hover:text-pink-core disabled:opacity-30">
              <ArrowUp className="size-5" aria-hidden />
            </button>
            <button type="button" aria-label={`Sposta giù ${r.name_it}`} disabled={i === rows.length - 1 || move.isPending} onClick={() => move.mutate([i, 1])} className="grid size-11 place-items-center rounded-pill text-ink-dim hover:text-pink-core disabled:opacity-30">
              <ArrowDown className="size-5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      {editing && (
        <Sheet
          title={editing === "new" ? "Nuovo ruolo" : "Ruolo"}
          saving={save.isPending || remove.isPending}
          error={save.error ?? remove.error}
          canSave={!!draft.name_it.trim()}
          onSave={() => save.mutate()}
          onClose={() => setEditing(null)}
          onDelete={editing === "new" ? undefined : () => remove.mutate()}
          deleteNote="Le candidature già arrivate per questo ruolo restano, senza ruolo."
        >
          <Field label="Nome · italiano">{(id) => <Input id={id} value={draft.name_it} onChange={(e) => setDraft({ ...draft, name_it: e.target.value })} />}</Field>
          <Field label="Nome · inglese" hint="Facoltativo: se resta vuoto, in inglese si legge l'italiano.">
            {(id, d) => <Input id={id} aria-describedby={d} lang="en" value={draft.name_en} onChange={(e) => setDraft({ ...draft, name_en: e.target.value })} />}
          </Field>
          <Checkbox
            checked={draft.active}
            onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
            label={
              <span>
                <span className="font-bold text-ink">Lo cerchiamo adesso</span>
                <span className="block text-xs">Senza la spunta resta qui ma sparisce dal sito.</span>
              </span>
            }
          />
        </Sheet>
      )}
    </div>
  );
}
