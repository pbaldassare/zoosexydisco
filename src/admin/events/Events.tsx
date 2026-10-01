import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Notice } from "../AuthShell";
import { coverUrl, loadEvents, loadMediaCounts, loadThemes } from "./data";

const when = (iso: string) =>
  new Date(iso).toLocaleString("it-IT", { timeZone: "Europe/Rome", weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Elenco delle serate: in arrivo prima, in ordine di data; le passate a parte. */
export function Events() {
  const events = useQuery({ queryKey: ["admin", "events"], queryFn: loadEvents });
  const themes = useQuery({ queryKey: ["admin", "themes-options"], queryFn: loadThemes });
  const counts = useQuery({ queryKey: ["admin", "media-counts"], queryFn: loadMediaCounts });
  const [tab, setTab] = useState<"next" | "past">("next");

  if (events.isLoading) return <p className="text-ink-dim">Carico le serate…</p>;
  if (events.error) return <Notice tone="error">Non riesco a leggere le serate. Ricarica la pagina.</Notice>;

  const now = Date.now();
  const all = events.data ?? [];
  const next = all.filter((e) => Date.parse(e.ends_at) > now).sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));
  const past = all.filter((e) => Date.parse(e.ends_at) <= now);
  const list = tab === "next" ? next : past;

  const chip = (active: boolean) =>
    cn("min-h-11 shrink-0 rounded-pill border px-4 text-[15px] transition-colors", active ? "border-transparent bg-pink font-bold text-[#12040F]" : "border-line text-ink-dim hover:text-ink");
  const badge = "label rounded-pill px-2 py-1";

  return (
    <div className="pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="tube tube-pink text-3xl">Serate</h1>
        <Button asChild>
          <Link to="nuova">
            <Plus className="size-5" aria-hidden /> Nuova serata
          </Link>
        </Button>
      </div>
      <p className="mt-3 max-w-prose text-sm text-ink-dim">
        Una serata compare sul sito solo quando è pubblicata. Se ha un tema, il sito ne prende i colori dalle 12 del giorno della serata.
      </p>

      <div className="mt-8 flex gap-2" role="group" aria-label="Quali serate">
        <button type="button" aria-pressed={tab === "next"} onClick={() => setTab("next")} className={chip(tab === "next")}>
          In arrivo ({next.length})
        </button>
        <button type="button" aria-pressed={tab === "past"} onClick={() => setTab("past")} className={chip(tab === "past")}>
          Passate ({past.length})
        </button>
      </div>

      {!list.length && <p className="mt-8 text-ink-dim">{tab === "next" ? "Nessuna serata in programma." : "Nessuna serata passata."}</p>}
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {list.map((e) => {
          const theme = themes.data?.find((t) => t.id === e.theme_id);
          const n = counts.data?.[e.id] ?? 0;
          return (
            <li key={e.id}>
              <Link to={e.id} className="flex items-center gap-4 py-4 hover:text-pink-core">
                <span className="size-16 shrink-0 overflow-hidden rounded-[18px] bg-panel">
                  {e.cover_path && <img src={coverUrl(e.cover_path)} alt="" loading="lazy" className="h-full w-full object-cover" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm capitalize text-ink-dim">{when(e.starts_at)}</span>
                  <span className="block truncate text-lg font-bold text-ink">{e.title_it}</span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    <span className={cn(badge, e.published ? "bg-blue/15 text-blue-core" : "bg-line text-ink-dim")}>{e.published ? "Pubblicata" : "Bozza"}</span>
                    {e.members_only && <span className={cn(badge, "bg-pink/15 text-pink-core")}>Solo iscritti</span>}
                    {theme && <span className={cn(badge, "border border-line text-ink-dim")}>{theme.name}</span>}
                    {n > 0 && <span className={cn(badge, "border border-line text-ink-dim")}>{n} foto/video</span>}
                    {e.is_sample && <span className={cn(badge, "bg-sample text-wall")}>Esempio</span>}
                  </span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-ink-dim" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
