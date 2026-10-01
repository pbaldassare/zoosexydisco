import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Notice } from "../AuthShell";
import { forceTheme, invalidateThemes, loadActiveId, loadThemeEvents, loadThemes, type ThemeRow } from "./data";

const day = (iso: string) => new Date(iso).toLocaleDateString("it-IT", { timeZone: "Europe/Rome", day: "numeric", month: "short" });

/** Perché un tema si accende: forzato, per date o per una serata. */
function when(t: ThemeRow, events: { title: string; starts_at: string }[] = []) {
  if (t.is_default) return "Il tema di tutti i giorni";
  if (t.force_active) return "Attivato a mano";
  const parts = [];
  if (t.starts_at && t.ends_at) parts.push(`Dal ${day(t.starts_at)} al ${day(t.ends_at)}`);
  if (events.length) parts.push(`Serate: ${events.map((e) => `${e.title} (${day(e.starts_at)})`).join(", ")}`);
  return parts.join(" · ") || "Non programmato";
}

/** I temi: colori dei tubi e video della home. Uno solo è acceso alla volta. */
export function Themes() {
  const qc = useQueryClient();
  const themes = useQuery({ queryKey: ["admin", "themes"], queryFn: loadThemes });
  const active = useQuery({ queryKey: ["admin", "theme-active"], queryFn: loadActiveId });
  const events = useQuery({ queryKey: ["admin", "theme-events"], queryFn: loadThemeEvents });
  const reset = useMutation({ mutationFn: () => forceTheme(null), onSuccess: () => invalidateThemes(qc) });

  if (themes.isLoading) return <p className="text-ink-dim">Carico i temi…</p>;
  if (themes.error) return <Notice tone="error">Non riesco a leggere i temi. Ricarica la pagina.</Notice>;
  const forced = themes.data?.find((t) => t.force_active);

  return (
    <div className="pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="tube tube-pink text-3xl">Temi</h1>
        <Button asChild>
          <Link to="nuovo">
            <Plus className="size-5" aria-hidden /> Nuovo tema
          </Link>
        </Button>
      </div>
      <p className="mt-3 max-w-prose text-sm text-ink-dim">
        Un tema cambia i colori delle scritte al neon e il video dietro l'insegna in home. Si accende da solo nelle sue date o dalle 12 del giorno di una
        serata che lo usa; altrimenti vale il Default.
      </p>

      {forced && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-tile border border-pink/40 bg-pink/10 p-4">
          <p className="text-sm text-ink">
            <b>{forced.name}</b> è attivato a mano e resta acceso finché non lo spegni.
          </p>
          <Button type="button" size="sm" variant="outline" disabled={reset.isPending} onClick={() => reset.mutate()}>
            Torna al Default
          </Button>
        </div>
      )}

      <ul className="mt-6 divide-y divide-line border-y border-line">
        {themes.data?.map((t) => (
          <li key={t.id}>
            <Link to={t.id} className="flex items-center gap-4 py-4 hover:text-pink-core">
              <span className="flex shrink-0 -space-x-2" aria-hidden>
                <span className="size-9 rounded-full border-2 border-wall" style={{ background: t.accent, boxShadow: `0 0 14px ${t.accent}` }} />
                <span className="size-9 rounded-full border-2 border-wall" style={{ background: t.accent_hot, boxShadow: `0 0 14px ${t.accent_hot}` }} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-bold text-ink">{t.name}</span>
                  {active.data === t.id && <span className="label rounded-pill bg-ok/15 px-2 py-1 text-ok">Acceso adesso</span>}
                  {t.is_sample && <span className="label rounded-pill bg-sample px-2 py-1 text-wall">Esempio</span>}
                </span>
                <span className={cn("block text-sm", t.force_active ? "text-pink-core" : "text-ink-dim")}>{when(t, events.data?.[t.id])}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-ink-dim" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
