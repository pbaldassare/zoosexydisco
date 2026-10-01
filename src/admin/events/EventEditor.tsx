import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ExternalLink, ImagePlus, Trash2 } from "lucide-react";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { pathFor } from "@/lib/routes";
import { Notice } from "../AuthShell";
import { coverUrl, deleteEvent, loadEvents, loadThemes, makeSlug, saveEvent, uploadCover, type EventRow } from "./data";
import { fromRome, nextDay, toRome } from "./rome";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Orario non valido.");
const schema = z.object({
  title_it: z.string().trim().min(1, "Scrivi il titolo."),
  title_en: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Scegli la data."),
  start: time,
  end: time,
  slug: z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Solo lettere minuscole, numeri e trattini."),
  dress_code_it: z.string(),
  dress_code_en: z.string(),
  description_it: z.string(),
  description_en: z.string(),
  entry_it: z.string(),
  entry_en: z.string(),
  theme_id: z.string(),
  members_only: z.boolean(),
  published: z.boolean(),
});
type Values = z.infer<typeof schema>;

const EMPTY: Values = {
  title_it: "", title_en: "", date: "", start: "22:30", end: "03:30", slug: "",
  dress_code_it: "", dress_code_en: "", description_it: "", description_en: "",
  entry_it: "", entry_en: "", theme_id: "", members_only: false, published: false,
};

function toValues(e: EventRow): Values {
  const s = fromRome(e.starts_at);
  return {
    title_it: e.title_it, title_en: e.title_en, date: s.date, start: s.time, end: fromRome(e.ends_at).time, slug: e.slug,
    dress_code_it: e.dress_code_it, dress_code_en: e.dress_code_en, description_it: e.description_it, description_en: e.description_en,
    entry_it: e.entry_it, entry_en: e.entry_en, theme_id: e.theme_id ?? "", members_only: e.members_only, published: e.published,
  };
}

/** Da una serata alla sua copia cambia solo l'indirizzo: la chiave fa ripartire il modulo da capo. */
export function EventEditorPage() {
  const { id = "nuova" } = useParams();
  const [params] = useSearchParams();
  return <EventEditor key={`${id}:${params.get("da") ?? ""}`} />;
}

/** Crea, modifica, duplica una serata. Italiano e inglese affiancati su schermo largo, uno sotto l'altro sul telefono. */
function EventEditor() {
  const { id = "nuova" } = useParams();
  const isNew = id === "nuova";
  const [params] = useSearchParams();
  const copyFrom = params.get("da");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const events = useQuery({ queryKey: ["admin", "events"], queryFn: loadEvents });
  const themes = useQuery({ queryKey: ["admin", "themes-options"], queryFn: loadThemes });
  const original = events.data?.find((e) => e.id === (isNew ? copyFrom : id));

  const { register, handleSubmit, reset, watch, setValue, formState } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: EMPTY });
  const e = formState.errors;
  const [cover, setCover] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const filePreview = useMemo(() => (coverFile ? URL.createObjectURL(coverFile) : null), [coverFile]);
  useEffect(() => () => void (filePreview && URL.revokeObjectURL(filePreview)), [filePreview]);
  const loaded = useRef(false);

  // Carica i valori una volta: dalla serata, da quella da duplicare, o vuoti con il prezzo dell'ultima.
  useEffect(() => {
    if (loaded.current || !events.data) return;
    loaded.current = true;
    if (original) {
      const v = toValues(original);
      if (isNew) {
        // Duplicato: stessa serata una settimana dopo, in bozza, con un indirizzo nuovo.
        const d = new Date(`${v.date}T12:00:00Z`);
        d.setUTCDate(d.getUTCDate() + 7);
        reset({ ...v, date: d.toISOString().slice(0, 10), published: false, slug: "" });
      } else reset(v);
      setCover(original.cover_path);
    } else if (isNew) {
      const last = events.data.find((x) => x.entry_it);
      reset({ ...EMPTY, entry_it: last?.entry_it ?? "", entry_en: last?.entry_en ?? "" });
    }
  }, [events.data, original, isNew, reset]);

  const title = watch("title_it");
  const date = watch("date");
  useEffect(() => {
    if (!slugTouched) setValue("slug", makeSlug(title ?? "", date ?? ""));
  }, [title, date, slugTouched, setValue]);

  const refresh = async () => {
    for (const k of [["admin", "events"], ["admin", "events-options"], ["events"], ["event"], ["next-event"], ["active-theme"]]) await qc.invalidateQueries({ queryKey: k });
  };

  const save = useMutation({
    mutationFn: async (v: Values) => {
      const cover_path = coverFile ? await uploadCover(coverFile) : cover;
      const endDate = v.end <= v.start ? nextDay(v.date) : v.date;
      const { date: _d, start, end, theme_id, ...rest } = v;
      return saveEvent(isNew ? null : id, {
        ...rest,
        title_it: rest.title_it.trim(),
        title_en: rest.title_en.trim(),
        slug: rest.slug.trim(),
        starts_at: toRome(v.date, start),
        ends_at: toRome(endDate, end),
        theme_id: theme_id || null,
        cover_path,
      });
    },
    onSuccess: async () => {
      await refresh();
      navigate("/admin/eventi");
    },
  });
  const remove = useMutation({
    mutationFn: () => deleteEvent(original!),
    onSuccess: async () => {
      await refresh();
      navigate("/admin/eventi");
    },
  });

  if (events.isLoading) return <p className="text-ink-dim">Carico…</p>;
  if (!isNew && !original) return <Notice tone="error">Questa serata non esiste più.</Notice>;

  const err = (name: FieldPath<Values>) => (e[name] as { message?: string } | undefined)?.message;
  const text = (name: FieldPath<Values>, label: string, opts: { hint?: string; lang?: string; type?: string } = {}) => (
    <Field label={label} hint={opts.hint} error={err(name)}>
      {(fid, d) => <Input id={fid} type={opts.type ?? "text"} lang={opts.lang} aria-describedby={d} aria-invalid={!!err(name)} {...register(name)} />}
    </Field>
  );
  const area = (name: FieldPath<Values>, label: string, lang: string) => (
    <Field label={label}>{(fid) => <Textarea id={fid} lang={lang} rows={5} {...register(name)} />}</Field>
  );
  const preview = filePreview ?? coverUrl(cover);
  const end = watch("end");
  const start = watch("start");
  const slug = watch("slug");

  return (
    <form noValidate onSubmit={handleSubmit((v) => save.mutate(v))} className="pb-16">
      <h1 className="tube tube-pink text-3xl">{isNew ? (copyFrom ? "Copia della serata" : "Nuova serata") : "Modifica serata"}</h1>
      {original?.is_sample && !isNew && <p className="mt-3 text-sm text-ink-dim">Serata di esempio: puoi modificarla o cancellarla.</p>}

      <section className="mt-10 grid gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          {text("title_it", "Titolo · italiano", { lang: "it" })}
          {text("title_en", "Titolo · inglese", { lang: "en", hint: "Se resta vuoto, in inglese si legge l'italiano." })}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-1">{text("date", "Data", { type: "date" })}</div>
          {text("start", "Inizio", { type: "time" })}
          {text("end", "Fine", { type: "time" })}
        </div>
        {end && start && end <= start && <p className="-mt-3 text-xs text-ink-dim">Finisce dopo mezzanotte, il giorno dopo.</p>}
      </section>

      <section className="mt-10">
        <h2 className="tube tube-blue text-2xl">Copertina</h2>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="sr-only"
          aria-label="Scegli la copertina"
          onChange={(ev) => setCoverFile(ev.target.files?.[0] ?? null)}
        />
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="aspect-[4/3] w-40 overflow-hidden rounded-tile bg-panel">{preview && <img src={preview} alt="" className="h-full w-full object-cover" />}</div>
          <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
            <ImagePlus className="size-4" aria-hidden /> {preview ? "Cambia copertina" : "Scegli copertina"}
          </Button>
        </div>
      </section>

      <section className="mt-10 grid gap-6">
        <h2 className="tube tube-pink text-2xl">Dettagli</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {text("dress_code_it", "Dress code · italiano", { lang: "it" })}
          {text("dress_code_en", "Dress code · inglese", { lang: "en" })}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {area("description_it", "Descrizione · italiano", "it")}
          {area("description_en", "Descrizione · inglese", "en")}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {text("entry_it", "Ingresso · italiano", { lang: "it", hint: "Se resta vuoto, si legge il prezzo delle impostazioni." })}
          {text("entry_en", "Ingresso · inglese", { lang: "en" })}
        </div>
        <Field label="Tema" hint="Dalle 12 del giorno della serata il sito prende i colori e lo sfondo del tema.">
          {(fid, d) => (
            <Select id={fid} aria-describedby={d} {...register("theme_id")}>
              <option value="">Nessun tema</option>
              {(themes.data ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </section>

      <section className="mt-10 grid gap-5">
        <h2 className="tube tube-blue text-2xl">Pubblicazione</h2>
        <Checkbox label={<span><span className="font-bold text-ink">Pubblicata</span><span className="block text-xs">Senza la spunta è una bozza: sul sito non si vede.</span></span>} {...register("published")} />
        <Checkbox label={<span><span className="font-bold text-ink">Solo per gli iscritti</span><span className="block text-xs">Serata su invito: la vede solo chi è iscritto alla newsletter, nell'area riservata.</span></span>} {...register("members_only")} />
        <Field
          label="Indirizzo della pagina"
          hint={slug ? `zoosexydisco.it${pathFor("event", "it", { slug })}` : "Si compone da titolo e data."}
          error={err("slug")}
        >
          {(fid, d) => (
            <Input
              id={fid}
              aria-describedby={d}
              aria-invalid={!!err("slug")}
              {...register("slug", { onChange: () => setSlugTouched(true) })}
            />
          )}
        </Field>
      </section>

      {(save.error || remove.error) && (
        <div className="mt-8">
          <Notice tone="error">{(save.error ?? remove.error) instanceof Error ? (save.error ?? remove.error)!.message : "Operazione non riuscita."}</Notice>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-6">
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Salvo…" : "Salva"}
        </Button>
        <Button asChild variant="ghost">
          <Link to="/admin/eventi">Annulla</Link>
        </Button>
        {!isNew && (
          <>
            <Button asChild variant="ghost">
              <Link to={`/admin/eventi/nuova?da=${id}`}>
                <Copy className="size-4" aria-hidden /> Duplica
              </Link>
            </Button>
            {original?.published && !original.members_only && (
              <Button asChild variant="ghost">
                <a href={pathFor("event", "it", { slug: original.slug })} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" aria-hidden /> Vedi sul sito
                </a>
              </Button>
            )}
            <span className="flex-1" />
            {confirmDelete ? (
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-danger">Si cancella per sempre.</span>
                <Button type="button" size="sm" className="bg-danger text-wall" disabled={remove.isPending} onClick={() => remove.mutate()}>
                  Sì, cancella
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                  No
                </Button>
              </span>
            ) : (
              <Button type="button" variant="ghost" className="text-danger hover:text-danger" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="size-4" aria-hidden /> Elimina
              </Button>
            )}
          </>
        )}
      </div>
    </form>
  );
}
