import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Star } from "lucide-react";
import { Field, Input, Select, Textarea } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Notice } from "../AuthShell";
import { Sheet } from "../shared/Sheet";
import { deleteRow, listRows, moveRow, nextSort, saveRow } from "../shared/rows";

type Review = {
  id: string;
  author_name: string;
  rating: number;
  text_it: string;
  text_en: string;
  source: "google" | "manual";
  review_date: string | null;
  visible: boolean;
  sort: number;
  is_sample: boolean;
};
type Draft = Omit<Review, "id" | "sort" | "is_sample">;

const EMPTY: Draft = { author_name: "", rating: 5, text_it: "", text_en: "", source: "google", review_date: new Date().toISOString().slice(0, 10), visible: true };
const KEY = ["admin", "reviews"];

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex" aria-label={`${n} stelle su 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("size-4", i <= n ? "fill-pink text-pink" : "text-line")} aria-hidden />
      ))}
    </span>
  );
}

/** Le recensioni della fascia che scorre in fondo al sito. Si vedono solo quelle visibili da 5 stelle. */
export function Reviews() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: KEY, queryFn: () => listRows<Review>("reviews", [{ column: "sort" }, { column: "created_at" }]) });
  const [editing, setEditing] = useState<Review | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const rows = list.data ?? [];

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: KEY });
    await qc.invalidateQueries({ queryKey: ["reviews"] });
  };
  const save = useMutation({
    mutationFn: () =>
      saveRow("reviews", editing === "new" ? null : editing!.id, {
        ...draft,
        author_name: draft.author_name.trim(),
        text_it: draft.text_it.trim(),
        text_en: draft.text_en.trim(),
        review_date: draft.review_date || null,
        ...(editing === "new" ? { sort: nextSort(rows) } : {}),
      }),
    onSuccess: async () => (await refresh(), setEditing(null)),
  });
  const remove = useMutation({ mutationFn: () => deleteRow("reviews", (editing as Review).id), onSuccess: async () => (await refresh(), setEditing(null)) });
  const quick = useMutation({ mutationFn: (fn: () => Promise<unknown>) => fn(), onSuccess: refresh });

  function open(r: Review | "new") {
    save.reset();
    setDraft(r === "new" ? EMPTY : { author_name: r.author_name, rating: r.rating, text_it: r.text_it, text_en: r.text_en, source: r.source, review_date: r.review_date, visible: r.visible });
    setEditing(r);
  }

  if (list.isLoading) return <p className="text-ink-dim">Carico le recensioni…</p>;
  if (list.error) return <Notice tone="error">Non riesco a leggere le recensioni. Ricarica la pagina.</Notice>;
  const shown = rows.filter((r) => r.visible && r.rating === 5).length;

  return (
    <div className="pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="tube tube-pink text-3xl">Recensioni</h1>
        <Button type="button" onClick={() => open("new")}>
          <Plus className="size-5" aria-hidden /> Aggiungi
        </Button>
      </div>
      <p className="mt-3 max-w-prose text-sm text-ink-dim">
        La fascia che scorre in fondo al sito, che dichiara di essere una selezione. Mostra solo le recensioni visibili da 5 stelle, in quest'ordine: adesso{" "}
        {shown === 1 ? "ne mostra 1" : `ne mostra ${shown}`}.
      </p>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {rows.map((r, i) => {
          const onSite = r.visible && r.rating === 5;
          return (
            <li key={r.id} className="flex items-start gap-2 py-4">
              <button type="button" onClick={() => open(r)} className="min-w-0 flex-1 text-left hover:text-pink-core">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-ink">{r.author_name}</span>
                  <Stars n={r.rating} />
                  {!onSite && <span className="label rounded-pill bg-line px-2 py-1 text-ink-dim">{r.visible ? "Non da 5 stelle" : "Nascosta"}</span>}
                  {r.is_sample && <span className="label rounded-pill bg-sample px-2 py-1 text-wall">Esempio</span>}
                </span>
                <span className={cn("mt-1 line-clamp-2 block text-sm", onSite ? "text-ink-dim" : "text-ink-faint")}>{r.text_it}</span>
              </button>
              <div className="flex shrink-0">
                <button type="button" aria-label={r.visible ? `Nascondi la recensione di ${r.author_name}` : `Mostra la recensione di ${r.author_name}`} disabled={quick.isPending} onClick={() => quick.mutate(() => saveRow("reviews", r.id, { visible: !r.visible }))} className="grid size-11 place-items-center rounded-pill text-ink-dim hover:text-pink-core">
                  {r.visible ? <Eye className="size-5" aria-hidden /> : <EyeOff className="size-5" aria-hidden />}
                </button>
                <button type="button" aria-label="Sposta su" disabled={i === 0 || quick.isPending} onClick={() => quick.mutate(() => moveRow("reviews", rows, i, -1))} className="grid size-11 place-items-center rounded-pill text-ink-dim hover:text-pink-core disabled:opacity-30">
                  <ArrowUp className="size-5" aria-hidden />
                </button>
                <button type="button" aria-label="Sposta giù" disabled={i === rows.length - 1 || quick.isPending} onClick={() => quick.mutate(() => moveRow("reviews", rows, i, 1))} className="grid size-11 place-items-center rounded-pill text-ink-dim hover:text-pink-core disabled:opacity-30">
                  <ArrowDown className="size-5" aria-hidden />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {!rows.length && <p className="mt-6 text-ink-dim">Nessuna recensione.</p>}

      {editing && (
        <Sheet
          title={editing === "new" ? "Nuova recensione" : "Recensione"}
          saving={save.isPending || remove.isPending}
          error={save.error ?? remove.error}
          canSave={!!draft.author_name.trim() && !!draft.text_it.trim()}
          onSave={() => save.mutate()}
          onClose={() => setEditing(null)}
          onDelete={editing === "new" ? undefined : () => remove.mutate()}
        >
          <Field label="Nome di chi l'ha scritta" hint="Come compare su Google: di solito nome e iniziale del cognome.">
            {(id, d) => <Input id={id} aria-describedby={d} value={draft.author_name} onChange={(e) => setDraft({ ...draft, author_name: e.target.value })} />}
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Stelle">
              {(id) => (
                <Select id={id} value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {"★".repeat(n)} {n}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Data">{(id) => <Input id={id} type="date" value={draft.review_date ?? ""} onChange={(e) => setDraft({ ...draft, review_date: e.target.value })} />}</Field>
          </div>
          {draft.rating < 5 && <p className="-mt-3 text-xs text-ink-dim">Con meno di 5 stelle resta qui ma non compare sul sito.</p>}
          <Field label="Testo · italiano">{(id) => <Textarea id={id} rows={4} value={draft.text_it} onChange={(e) => setDraft({ ...draft, text_it: e.target.value })} />}</Field>
          <Field label="Testo · inglese" hint="Facoltativo: se resta vuoto, in inglese si legge l'italiano.">
            {(id, d) => <Textarea id={id} aria-describedby={d} lang="en" rows={4} value={draft.text_en} onChange={(e) => setDraft({ ...draft, text_en: e.target.value })} />}
          </Field>
          <Field label="Da dove viene">
            {(id) => (
              <Select id={id} value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value as Review["source"] })}>
                <option value="google">Google</option>
                <option value="manual">Altro (scritta a mano)</option>
              </Select>
            )}
          </Field>
        </Sheet>
      )}
    </div>
  );
}
