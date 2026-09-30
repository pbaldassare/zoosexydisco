import { useEffect, useState } from "react";
import { useFieldArray, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { Checkbox, Field, Input } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { weekdayName } from "@/lib/opening";
import { adminClient } from "@/lib/supabase";
import { waNumber } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { Notice } from "../AuthShell";
import { SaveBar } from "../SaveBar";

const required = z.string().trim().min(1, "Campo obbligatorio.");
const phone = z
  .string()
  .trim()
  .regex(/^\+?[\d\s./-]+$/, "Solo cifre e spazi, per esempio 347 587 2376.")
  .refine((v) => v.replace(/\D/g, "").length >= 6, "Numero troppo corto.");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Orario non valido.");
const optionalUrl = z.union([z.literal(""), z.string().trim().url("Incolla un indirizzo completo, che inizia con https://")]);

const schema = z.object({
  contacts: z.array(z.object({ name: required, phone })).min(1, "Serve almeno un contatto."),
  whatsapp: phone,
  phone,
  email: z.string().trim().email("Indirizzo email non valido."),
  days: z.array(z.object({ day: z.number(), open: z.boolean(), from: time, to: time })),
  opening_hours_it: required,
  opening_hours_en: z.string(),
  entry_prices_it: required,
  entry_prices_en: z.string(),
  drink_prices_it: required,
  drink_prices_en: z.string(),
  address_venue: required,
  maps_query: required,
  instagram_handle: z
    .string()
    .trim()
    .transform((v) => v.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/.*$/, ""))
    .pipe(z.union([z.literal(""), z.string().regex(/^[A-Za-z0-9._]{1,30}$/, "Nome utente non valido.")])),
  google_reviews_url: optionalUrl,
  company_name: required,
  legal_address: required,
  vat_number: required,
  rea: required,
  registry: required,
  share_capital: required,
  pec: z.string().trim().email("Indirizzo PEC non valido."),
});
type Values = z.input<typeof schema>;
type Row = Record<string, unknown>;

/** Da lunedì a domenica, come si legge un calendario; `day` segue Date.getDay(). */
const WEEK = [1, 2, 3, 4, 5, 6, 0];
const TEXT_KEYS = [
  "opening_hours_it", "opening_hours_en", "entry_prices_it", "entry_prices_en", "drink_prices_it", "drink_prices_en",
  "address_venue", "maps_query", "google_reviews_url", "company_name", "legal_address", "vat_number", "rea", "registry",
  "share_capital", "pec", "email", "phone", "whatsapp", "instagram_handle",
] as const;

async function loadSettings(): Promise<Row> {
  const { data, error } = await adminClient!.from("site_settings").select("*").eq("singleton", true).single();
  if (error) throw error;
  return data as Row;
}

function toValues(r: Row): Values {
  const windows = (Array.isArray(r.opening_windows) ? r.opening_windows : []) as { day: number; open: string; close: string }[];
  const text = Object.fromEntries(TEXT_KEYS.map((k) => [k, typeof r[k] === "string" ? (r[k] as string) : ""]));
  return {
    ...(text as Record<(typeof TEXT_KEYS)[number], string>),
    contacts: Array.isArray(r.contacts) ? (r.contacts as { name: string; phone: string }[]) : [],
    days: WEEK.map((day) => {
      const w = windows.find((x) => x.day === day);
      return { day, open: !!w, from: w?.open ?? "22:30", to: w?.close ?? "03:30" };
    }),
  };
}

/** Contatti, orari, prezzi, indirizzo, social e dati societari: la riga unica di site_settings. */
export function Settings() {
  const qc = useQueryClient();
  const { data: row, isLoading, error } = useQuery({ queryKey: ["admin", "settings"], queryFn: loadSettings });
  const form = useForm<Values>({ resolver: zodResolver(schema) });
  const { register, control, handleSubmit, reset, watch, formState } = form;
  const contacts = useFieldArray({ control, name: "contacts" });
  const [saved, setSaved] = useState(false);
  const e = formState.errors;

  useEffect(() => {
    if (row) reset(toValues(row));
  }, [row, reset]);

  const save = useMutation({
    mutationFn: async (v: z.output<typeof schema>) => {
      const { days, contacts: people, instagram_handle, ...rest } = v;
      const { error: err } = await adminClient!
        .from("site_settings")
        .update({
          ...rest,
          contacts: people.map((c) => ({ name: c.name.trim(), phone: c.phone.trim() })),
          opening_windows: days.filter((d) => d.open).map((d) => ({ day: d.day, open: d.from, close: d.to })),
          instagram_handle,
          instagram_url: instagram_handle ? `https://www.instagram.com/${instagram_handle}/` : "",
          updated_at: new Date().toISOString(),
        })
        .eq("singleton", true);
      if (err) throw err;
    },
    onSuccess: async () => {
      setSaved(true);
      await qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      await qc.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  // Ogni campo toccato ricomincia il ciclo «da salvare»; il reset dopo il salvataggio no.
  useEffect(() => {
    const sub = watch((_v, { type }) => type === "change" && setSaved(false));
    return () => sub.unsubscribe();
  }, [watch]);

  if (isLoading || (row && !formState.defaultValues)) return <p className="text-ink-dim">Carico le impostazioni…</p>;
  if (error || !row) return <Notice tone="error">Non riesco a leggere le impostazioni. Ricarica la pagina.</Notice>;

  const dirtyCount = Object.keys(formState.dirtyFields).length;
  const invalid = Object.keys(e).length > 0;
  const days = watch("days");

  /** Campo di testo con etichetta ed errore, collegato al modulo. */
  const text = (name: FieldPath<Values>, label: string, opts: { hint?: string; type?: string; inputMode?: "tel" | "email" | "url"; lang?: string } = {}) => {
    const err = name.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], e) as { message?: string } | undefined;
    return (
      <Field label={label} hint={opts.hint} error={err?.message}>
        {(id, d) => <Input id={id} type={opts.type ?? "text"} inputMode={opts.inputMode} lang={opts.lang} aria-describedby={d} aria-invalid={!!err} {...register(name)} />}
      </Field>
    );
  };
  /** Coppia italiano / inglese: l'inglese vuoto mostra l'italiano. */
  const pair = (base: "opening_hours" | "entry_prices" | "drink_prices", label: string, hint?: string) => (
    <div className="grid gap-4 md:grid-cols-2">
      {text(`${base}_it`, `${label} · italiano`, { hint, lang: "it" })}
      {text(`${base}_en`, `${label} · inglese`, { lang: "en" })}
    </div>
  );

  const onSave = handleSubmit((v) => save.mutate(v as unknown as z.output<typeof schema>));
  const handle = watch("instagram_handle");
  const wa = watch("whatsapp");

  return (
    <form noValidate onSubmit={onSave} className="pb-32">
      <h1 className="tube tube-pink text-3xl">Impostazioni</h1>
      <p className="mt-3 max-w-prose text-sm text-ink-dim">Contatti, orari, prezzi e dati del locale. Quello che salvi compare subito sul sito.</p>

      <section className="mt-12">
        <h2 className="tube tube-blue text-2xl">Contatti</h2>
        <p className="mt-2 text-sm text-ink-dim">Le persone da contattare: ognuna ha i pulsanti WhatsApp e Chiama, in home, nel menu e in fondo alle pagine.</p>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {contacts.fields.map((f, i) => (
            <li key={f.id} className="grid grid-cols-[1fr_auto] items-end gap-3 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {text(`contacts.${i}.name`, "Nome")}
                {text(`contacts.${i}.phone`, "Telefono (anche WhatsApp)", { type: "tel", inputMode: "tel" })}
              </div>
              <button
                type="button"
                onClick={() => contacts.remove(i)}
                disabled={contacts.fields.length === 1}
                aria-label={`Togli ${watch(`contacts.${i}.name`) || "questo contatto"}`}
                className="mb-1 grid size-11 place-items-center rounded-pill text-ink-dim hover:text-danger disabled:opacity-30"
              >
                <Trash2 className="size-5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        {e.contacts?.root?.message && <p className="mt-2 text-xs text-danger">{e.contacts.root.message}</p>}
        <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={() => contacts.append({ name: "", phone: "" })}>
          <Plus className="size-4" aria-hidden /> Aggiungi un contatto
        </Button>

        <div className="mt-8 grid gap-6">
          {text("whatsapp", "Numero del pulsante WhatsApp fisso", {
            type: "tel",
            inputMode: "tel",
            hint: `Il pulsante verde sempre visibile e le prenotazioni delle serate.${waNumber(wa ?? "") ? ` Apre wa.me/${waNumber(wa ?? "")}.` : ""}`,
          })}
          {text("phone", "Telefono principale", { type: "tel", inputMode: "tel", hint: "Pagina Contatti e dati per Google." })}
          {text("email", "Email", { type: "email", inputMode: "email" })}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="tube tube-pink text-2xl">Orari e prezzi</h2>
        <p className="mt-2 text-sm text-ink-dim">
          Le sere in cui aprite. L'ora di chiusura non si legge sul sito: serve a calcolare se in quel momento siete aperti.
        </p>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {WEEK.map((day, i) => {
            const open = days?.[i]?.open;
            const name = weekdayName(day, "it");
            return (
              <li key={day} className="grid gap-3 py-4 sm:grid-cols-[180px_1fr] sm:items-center">
                <Checkbox label={<span className={cn("text-base capitalize", open ? "font-bold text-ink" : "text-ink-dim")}>{name}</span>} {...register(`days.${i}.open`)} />
                {open && (
                  <div className="grid grid-cols-2 gap-3">
                    <label className="grid gap-1.5">
                      <span className="label text-ink-faint">Apre</span>
                      <Input type="time" aria-label={`${name}, apertura`} {...register(`days.${i}.from`)} />
                    </label>
                    <label className="grid gap-1.5">
                      <span className="label text-ink-faint">Chiude</span>
                      <Input type="time" aria-label={`${name}, chiusura`} {...register(`days.${i}.to`)} />
                    </label>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {!days?.some((d) => d.open) && <p className="mt-2 text-xs text-danger">Nessuna sera aperta: in home il pannello non saprà quando riaprite.</p>}

        <div className="mt-8 grid gap-6">
          {pair("opening_hours", "Orari in una frase", "Nella pagina Il locale, in Contatti e per Google. Senza ora di chiusura.")}
          {pair("entry_prices", "Ingresso")}
          {pair("drink_prices", "Consumazione")}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="tube tube-blue text-2xl">Indirizzo</h2>
        <div className="mt-4 grid gap-6">
          {text("address_venue", "Indirizzo del locale")}
          {text("maps_query", "Cosa cercare su Google Maps", { hint: "Il testo con cui il pulsante del navigatore trova il locale." })}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="tube tube-pink text-2xl">Instagram e recensioni</h2>
        <div className="mt-4 grid gap-6">
          {text("instagram_handle", "Nome utente Instagram", {
            hint: handle ? `Il profilo: instagram.com/${String(handle).replace(/^@/, "")}` : "Senza @. Si può anche incollare il link del profilo.",
          })}
          {text("google_reviews_url", "Link alle recensioni Google", { type: "url", inputMode: "url", hint: "Facoltativo. Se c'è, sotto le recensioni compare il pulsante per leggerle tutte." })}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="tube tube-blue text-2xl">Dati societari</h2>
        <p className="mt-2 text-sm text-ink-dim">In fondo a ogni pagina, come richiesto dalla legge.</p>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {text("company_name", "Ragione sociale")}
          {text("legal_address", "Sede legale")}
          {text("vat_number", "Partita IVA")}
          {text("rea", "REA")}
          {text("registry", "Registro imprese")}
          {text("share_capital", "Capitale sociale")}
          {text("pec", "PEC", { type: "email", inputMode: "email" })}
        </div>
      </section>

      <SaveBar
        dirty={dirtyCount}
        saving={save.isPending}
        failed={save.isError}
        saved={saved && !dirtyCount}
        blocked={invalid ? "C'è un campo da correggere: è segnato in rosso." : undefined}
        onSave={() => void onSave()}
        onCancel={() => reset(toValues(row))}
      />
    </form>
  );
}
