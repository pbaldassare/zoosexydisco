import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Search } from "lucide-react";
import { Input, Textarea } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { adminClient } from "@/lib/supabase";
import { pathFor } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Notice } from "../AuthShell";
import { TEXT_GROUPS, type TextEntry } from "./catalog";

type Pair = { it: string; en: string };
type Blocks = Record<string, Pair>;

async function loadBlocks(): Promise<Blocks> {
  const { data, error } = await adminClient!.from("content_blocks").select("key, it, en");
  if (error) throw error;
  return Object.fromEntries(data.map((r) => [r.key as string, { it: (r.it as string) ?? "", en: (r.en as string) ?? "" }]));
}

/** Righe iniziali del riquadro: abbastanza per leggere il testo senza scorrere. */
const rowsFor = (s: string) => Math.min(10, Math.max(2, Math.ceil(s.length / 40)));

/**
 * Testi del sito, pagina per pagina, italiano e inglese affiancati.
 * Le modifiche si accumulano e si salvano insieme dalla barra in basso.
 */
export function Texts() {
  const qc = useQueryClient();
  const { data: saved, isLoading, error } = useQuery({ queryKey: ["admin", "content"], queryFn: loadBlocks });
  const [draft, setDraft] = useState<Blocks>({});
  const [group, setGroup] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [done, setDone] = useState(false);

  const dirty = useMemo(
    () => Object.keys(draft).filter((k) => saved && (draft[k]!.it !== saved[k]?.it || draft[k]!.en !== saved[k]?.en)),
    [draft, saved],
  );
  const emptyIt = dirty.filter((k) => !draft[k]!.it.trim());

  // Uscendo con modifiche non salvate il browser chiede conferma.
  useEffect(() => {
    if (!dirty.length) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty.length]);

  const save = useMutation({
    mutationFn: async () => {
      const rows = dirty.map((key) => ({ key, it: draft[key]!.it.trim(), en: draft[key]!.en.trim(), updated_at: new Date().toISOString() }));
      const { error: err } = await adminClient!.from("content_blocks").upsert(rows, { onConflict: "key" });
      if (err) throw err;
    },
    onSuccess: async () => {
      setDraft({});
      setDone(true);
      await qc.invalidateQueries({ queryKey: ["admin", "content"] });
      // Il sito, aperto in questa stessa finestra, rilegge i testi.
      await qc.invalidateQueries({ queryKey: ["content"] });
    },
  });

  const value = (key: string): Pair => draft[key] ?? saved?.[key] ?? { it: "", en: "" };
  function edit(key: string, lang: keyof Pair, text: string) {
    setDone(false);
    setDraft((d) => ({ ...d, [key]: { ...value(key), [lang]: text } }));
  }

  const q = query.trim().toLowerCase();
  const matches = (e: TextEntry) => {
    if (!q) return true;
    const v = value(e.key);
    return [e.label, v.it, v.en].some((s) => s.toLowerCase().includes(q));
  };
  const groups = TEXT_GROUPS.filter((g) => group === "all" || g.id === group)
    .map((g) => ({ ...g, entries: g.entries.filter(matches) }))
    .filter((g) => g.entries.length);

  if (isLoading) return <p className="text-ink-dim">Carico i testi…</p>;
  if (error) return <Notice tone="error">Non riesco a leggere i testi. Ricarica la pagina.</Notice>;

  return (
    <div className="pb-32">
      <h1 className="tube tube-pink text-3xl">Testi</h1>
      <p className="mt-3 max-w-prose text-sm text-ink-dim">
        Scrivi in italiano e in inglese. Se l'inglese resta vuoto, chi visita il sito in inglese legge l'italiano.
      </p>

      <div className="relative mt-8">
        <Search className="pointer-events-none absolute left-[18px] top-1/2 size-5 -translate-y-1/2 text-ink-faint" aria-hidden />
        <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca un testo" aria-label="Cerca un testo" className="pl-12" />
      </div>

      <div className="-mx-gutter mt-4 flex gap-2 overflow-x-auto px-gutter pb-1" role="group" aria-label="Pagina">
        {[{ id: "all", title: "Tutte" }, ...TEXT_GROUPS].map((g) => (
          <button
            key={g.id}
            type="button"
            aria-pressed={group === g.id}
            onClick={() => setGroup(g.id)}
            className={cn(
              "min-h-11 shrink-0 rounded-pill border px-4 text-[15px] transition-colors",
              group === g.id ? "border-transparent bg-pink font-bold text-[#12040F]" : "border-line text-ink-dim hover:text-ink",
            )}
          >
            {g.title}
          </button>
        ))}
      </div>

      {!groups.length && <p className="mt-10 text-ink-dim">Nessun testo corrisponde alla ricerca.</p>}

      {groups.map((g, gi) => (
        <section key={g.id} className="mt-12">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className={cn("tube text-2xl", gi % 2 === 0 ? "tube-blue" : "tube-pink")}>{g.title}</h2>
            <a href={pathFor(g.page, "it")} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-sm text-ink-dim hover:text-pink-core">
              Vedi la pagina <ExternalLink className="size-4" aria-hidden />
            </a>
          </div>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {g.entries.map((e) => {
              const v = value(e.key);
              const changed = dirty.includes(e.key);
              const Field = e.short ? Input : Textarea;
              return (
                <li key={e.key} className="py-6">
                  <p className="flex items-center gap-2 font-bold text-ink">
                    {e.label}
                    {changed && <span className="label rounded-pill bg-pink/15 px-2 py-1 text-pink-core">Da salvare</span>}
                  </p>
                  {e.note && <p className="mt-1 text-xs text-ink-faint">{e.note}</p>}
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {(["it", "en"] as const).map((lang) => (
                      <label key={lang} className="grid gap-1.5">
                        <span className="label text-ink-faint">{lang === "it" ? "Italiano" : "Inglese"}</span>
                        <Field
                          value={v[lang]}
                          onChange={(ev: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => edit(e.key, lang, ev.target.value)}
                          rows={e.short ? undefined : rowsFor(v.it.length > v.en.length ? v.it : v.en)}
                          placeholder={lang === "en" ? v.it : undefined}
                          aria-invalid={lang === "it" && changed && !v.it.trim()}
                          lang={lang}
                        />
                      </label>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {(dirty.length > 0 || done || save.isError) && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-wall/95 backdrop-blur-xl">
          <div className="container-site flex min-h-[76px] items-center justify-between gap-4 py-3">
            <div className="text-sm" aria-live="polite">
              {save.isError ? (
                <span className="text-danger">Salvataggio non riuscito. Riprova.</span>
              ) : emptyIt.length ? (
                <span className="text-danger">L'italiano non può restare vuoto.</span>
              ) : dirty.length ? (
                <span className="text-ink">{dirty.length === 1 ? "1 modifica da salvare" : `${dirty.length} modifiche da salvare`}</span>
              ) : (
                <span className="text-blue-core">Salvato. Il sito è già aggiornato.</span>
              )}
            </div>
            {dirty.length > 0 && (
              <div className="flex shrink-0 gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setDraft({})} disabled={save.isPending}>
                  Annulla
                </Button>
                <Button type="button" size="sm" onClick={() => save.mutate()} disabled={save.isPending || emptyIt.length > 0}>
                  {save.isPending ? "Salvo…" : "Salva"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
