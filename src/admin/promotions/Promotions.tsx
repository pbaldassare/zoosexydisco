import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Plus } from "lucide-react";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Notice } from "../AuthShell";
import { coverUrl, uploadCover } from "../events/data";
import { fromRome, toRome } from "../events/rome";
import { removeFiles } from "../media/upload";
import { Sheet } from "../shared/Sheet";
import { deleteRow, listRows, saveRow } from "../shared/rows";

type Promo = {
  id: string;
  title_it: string;
  title_en: string;
  body_it: string;
  body_en: string;
  code: string | null;
  image_path: string | null;
  valid_from: string;
  valid_to: string;
  audience: "public" | "members";
  published: boolean;
  is_sample: boolean;
};
type Draft = { title_it: string; title_en: string; body_it: string; body_en: string; code: string; from: string; to: string; audience: Promo["audience"]; published: boolean };
const KEY = ["admin", "promotions"];
const today = () => fromRome(new Date().toISOString()).date;
const day = (iso: string) => new Date(iso).toLocaleDateString("it-IT", { timeZone: "Europe/Rome", day: "numeric", month: "short", year: "numeric" });

function status(p: Promo) {
  const now = Date.now();
  if (!p.published) return { label: "Bozza", cls: "bg-line text-ink-dim" };
  if (Date.parse(p.valid_to) <= now) return { label: "Scaduta", cls: "bg-line text-ink-faint" };
  if (Date.parse(p.valid_from) > now) return { label: `Dal ${day(p.valid_from)}`, cls: "border border-line text-ink-dim" };
  return { label: "In corso", cls: "bg-ok/15 text-ok" };
}

/** Promozioni: per gli iscritti nell'area riservata. Valgono dal primo giorno a mezzanotte all'ultimo a fine giornata. */
export function Promotions() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: KEY, queryFn: () => listRows<Promo>("promotions", [{ column: "valid_to", ascending: false }]) });
  const [editing, setEditing] = useState<Promo | "new" | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [dropImage, setDropImage] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const imagePreview = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: KEY });
    await qc.invalidateQueries({ queryKey: ["promotions"] });
  };
  const current = editing && editing !== "new" ? editing : null;
  const save = useMutation({
    mutationFn: async () => {
      const d = draft!;
      let image_path = current?.image_path ?? null;
      if (image) image_path = await uploadCover(image);
      else if (dropImage) image_path = null;
      await saveRow("promotions", current?.id ?? null, {
        title_it: d.title_it.trim(),
        title_en: d.title_en.trim(),
        body_it: d.body_it.trim(),
        body_en: d.body_en.trim(),
        code: d.code.trim() || null,
        image_path,
        valid_from: toRome(d.from, "00:00"),
        valid_to: toRome(d.to, "23:59"),
        audience: d.audience,
        published: d.published,
      });
      if (current?.image_path && current.image_path !== image_path) await removeFiles("public-media", [current.image_path]);
    },
    onSuccess: async () => (await refresh(), setEditing(null)),
  });
  const remove = useMutation({
    mutationFn: async () => {
      await deleteRow("promotions", current!.id);
      await removeFiles("public-media", [current!.image_path]);
    },
    onSuccess: async () => (await refresh(), setEditing(null)),
  });

  function open(p: Promo | "new") {
    save.reset();
    remove.reset();
    setImage(null);
    setDropImage(false);
    if (input.current) input.current.value = "";
    setDraft(
      p === "new"
        ? { title_it: "", title_en: "", body_it: "", body_en: "", code: "", from: today(), to: "", audience: "members", published: true }
        : { title_it: p.title_it, title_en: p.title_en, body_it: p.body_it, body_en: p.body_en, code: p.code ?? "", from: fromRome(p.valid_from).date, to: fromRome(p.valid_to).date, audience: p.audience, published: p.published },
    );
    setEditing(p);
  }

  if (list.isLoading) return <p className="text-ink-dim">Carico le promozioni…</p>;
  if (list.error) return <Notice tone="error">Non riesco a leggere le promozioni. Ricarica la pagina.</Notice>;
  const rows = list.data ?? [];
  const d = draft;
  const badDates = !!d && !!d.from && !!d.to && d.to < d.from;
  const preview = imagePreview ?? (dropImage ? "" : coverUrl(current?.image_path ?? null));

  return (
    <div className="pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="tube tube-pink text-3xl">Promozioni</h1>
        <Button type="button" onClick={() => open("new")}>
          <Plus className="size-5" aria-hidden /> Nuova
        </Button>
      </div>
      <p className="mt-3 max-w-prose text-sm text-ink-dim">
        Le promozioni per gli iscritti compaiono nella loro area riservata, solo nei giorni in cui valgono. Quelle pubbliche per ora non hanno un posto sul
        sito.
      </p>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {rows.map((p) => {
          const s = status(p);
          return (
            <li key={p.id}>
              <button type="button" onClick={() => open(p)} className="block w-full py-4 text-left hover:text-pink-core">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-ink">{p.title_it}</span>
                  <span className={cn("label rounded-pill px-2 py-1", s.cls)}>{s.label}</span>
                  <span className="label rounded-pill border border-line px-2 py-1 text-ink-dim">{p.audience === "members" ? "Iscritti" : "Pubblica"}</span>
                  {p.is_sample && <span className="label rounded-pill bg-sample px-2 py-1 text-wall">Esempio</span>}
                </span>
                <span className="mt-1 block text-sm text-ink-dim">
                  {day(p.valid_from)} – {day(p.valid_to)}
                  {p.code && ` · codice ${p.code}`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {!rows.length && <p className="mt-6 text-ink-dim">Nessuna promozione.</p>}

      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/heic" className="sr-only" aria-label="Scegli l'immagine" onChange={(e) => (setImage(e.target.files?.[0] ?? null), setDropImage(false))} />

      {editing && d && (
        <Sheet
          title={editing === "new" ? "Nuova promozione" : "Promozione"}
          saving={save.isPending || remove.isPending}
          error={save.error ?? remove.error}
          canSave={!!d.title_it.trim() && !!d.from && !!d.to && !badDates}
          onSave={() => save.mutate()}
          onClose={() => setEditing(null)}
          onDelete={current ? () => remove.mutate() : undefined}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Titolo · italiano">{(id) => <Input id={id} value={d.title_it} onChange={(e) => setDraft({ ...d, title_it: e.target.value })} />}</Field>
            <Field label="Titolo · inglese">{(id) => <Input id={id} lang="en" value={d.title_en} onChange={(e) => setDraft({ ...d, title_en: e.target.value })} />}</Field>
            <Field label="Testo · italiano">{(id) => <Textarea id={id} rows={4} value={d.body_it} onChange={(e) => setDraft({ ...d, body_it: e.target.value })} />}</Field>
            <Field label="Testo · inglese">{(id) => <Textarea id={id} lang="en" rows={4} value={d.body_en} onChange={(e) => setDraft({ ...d, body_en: e.target.value })} />}</Field>
          </div>
          <Field label="Codice" hint="Facoltativo: la parola da dire alla cassa, per esempio ZOO10.">
            {(id, dd) => <Input id={id} aria-describedby={dd} className="font-mono uppercase" value={d.code} onChange={(e) => setDraft({ ...d, code: e.target.value.toUpperCase() })} />}
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Vale dal">{(id) => <Input id={id} type="date" value={d.from} onChange={(e) => setDraft({ ...d, from: e.target.value })} />}</Field>
            <Field label="Fino al" error={badDates ? "Viene prima dell'inizio." : undefined}>
              {(id) => <Input id={id} type="date" value={d.to} onChange={(e) => setDraft({ ...d, to: e.target.value })} />}
            </Field>
          </div>
          <div>
            <p className="label mb-3 text-ink-faint">Immagine</p>
            <div className="flex flex-wrap items-center gap-4">
              {preview && <img src={preview} alt="" className="aspect-[4/3] w-40 rounded-tile bg-panel object-cover" />}
              <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}>
                <ImagePlus className="size-4" aria-hidden /> {preview ? "Cambia" : "Scegli"} immagine
              </Button>
              {preview && (
                <Button type="button" variant="ghost" size="sm" onClick={() => (setImage(null), setDropImage(true))}>
                  Togli
                </Button>
              )}
            </div>
          </div>
          <Field label="Per chi">
            {(id) => (
              <Select id={id} value={d.audience} onChange={(e) => setDraft({ ...d, audience: e.target.value as Promo["audience"] })}>
                <option value="members">Iscritti alla newsletter (area riservata)</option>
                <option value="public">Tutti</option>
              </Select>
            )}
          </Field>
          <Checkbox checked={d.published} onChange={(e) => setDraft({ ...d, published: e.target.checked })} label={<span><span className="font-bold text-ink">Pubblicata</span><span className="block text-xs">Senza la spunta è una bozza.</span></span>} />
        </Sheet>
      )}
    </div>
  );
}
