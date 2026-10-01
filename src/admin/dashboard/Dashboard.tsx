import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, ChevronRight, Minus } from "lucide-react";
import { adminClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Notice } from "../AuthShell";

type Stats = {
  from: string;
  to: string;
  visits: number;
  visits_prev: number;
  views: number;
  views_prev: number;
  whatsapp: number;
  whatsapp_prev: number;
  phone: number;
  phone_prev: number;
  series: { day: string; visits: number; views: number }[];
  pages: { path: string; views: number }[];
  sources: { source: string; visits: number }[];
  devices: { device: string; visits: number }[];
  messages_open: number;
  applications_new: number;
};

const PERIODS = [7, 30, 90] as const;
const SOURCE: Record<string, string> = { direct: "Diretto o app", instagram: "Instagram", google: "Google", facebook: "Facebook", other: "Altri siti" };
const DEVICE: Record<string, string> = { mobile: "Telefono", tablet: "Tablet", desktop: "Computer" };
const nf = new Intl.NumberFormat("it-IT");
const visite = (n: number) => `${n} ${n === 1 ? "visita" : "visite"}`;
const pagine = (n: number) => `${n} ${n === 1 ? "pagina" : "pagine"}`;
const dayLabel = (d: string, long = false) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("it-IT", long ? { weekday: "long", day: "numeric", month: "long" } : { day: "numeric", month: "short" });

/** Nomi leggibili per i percorsi del sito. */
function pageName(path: string) {
  const map: Record<string, string> = {
    "": "Home", "il-locale": "Il locale", "the-club": "Il locale", eventi: "Serate", events: "Serate", "lavora-con-noi": "Lavora con noi",
    "work-with-us": "Lavora con noi", contatti: "Contatti", contacts: "Contatti", "gallery/foto": "Gallery foto", "gallery/photos": "Gallery foto",
    "gallery/video": "Gallery video", "gallery/videos": "Gallery video", newsletter: "Newsletter", privacy: "Privacy", "area-riservata": "Area riservata", members: "Area riservata",
  };
  const [, lang = "", ...rest] = path.split("/");
  const tail = rest.join("/");
  const ev = tail.match(/^(eventi|events)\/(.+)$/);
  const name = ev ? `Serata: ${ev[2]}` : (map[tail] ?? path);
  return lang === "en" ? `${name} (EN)` : name;
}

async function load(days: number): Promise<Stats> {
  const { data, error } = await adminClient!.rpc("dashboard_stats", { p_days: days });
  if (error) throw error;
  return data as Stats;
}

/** Confronto con il periodo prima: freccia e testo, mai solo colore. */
function Delta({ now, prev }: { now: number; prev: number }) {
  if (!prev && !now) return <span className="text-xs text-ink-faint">nessun dato prima</span>;
  if (!prev) return <span className="text-xs text-ink-dim">prima: 0</span>;
  const pct = Math.round(((now - prev) / prev) * 100);
  const Icon = pct > 0 ? ArrowUpRight : pct < 0 ? ArrowDownRight : Minus;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", pct > 0 ? "text-ok" : "text-ink-dim")}>
      <Icon className="size-3.5" aria-hidden />
      {pct > 0 ? "+" : ""}
      {pct}% · prima {nf.format(prev)}
    </span>
  );
}

function Tile({ label, value, children, hero }: { label: string; value: number; children?: React.ReactNode; hero?: boolean }) {
  return (
    <div className={cn("rounded-tile border border-line bg-panel/60", hero ? "p-5" : "p-3")}>
      <p className={cn("text-ink-dim", hero ? "text-sm" : "text-xs")}>{label}</p>
      <p className={cn("mt-1 font-body font-bold text-ink", hero ? "text-5xl" : "text-2xl")}>{nf.format(value)}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

/** Colonne delle visite per giorno: una sola serie, un solo colore, tooltip su ogni colonna. */
function DailyChart({ series }: { series: Stats["series"] }) {
  const [hover, setHover] = useState<number | null>(null);
  const titleId = useId();
  // Si disegna alla larghezza vera: rimpicciolito, il testo degli assi sul telefono diventa illeggibile.
  const box = useRef<HTMLElement>(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e!.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = 180;
  const pad = { top: 12, right: 8, bottom: 24, left: 32 };
  const max = Math.max(4, ...series.map((d) => d.visits));
  const step = Math.ceil(max / 4);
  const top = step * 4;
  const slot = (W - pad.left - pad.right) / series.length;
  const bw = Math.min(24, Math.max(2, slot - 2));
  const y = (v: number) => pad.top + (H - pad.top - pad.bottom) * (1 - v / top);
  const every = Math.ceil(series.length / Math.max(3, Math.floor(W / 90)));
  const h = hover !== null ? series[hover] : null;

  return (
    <figure ref={box} className="relative" aria-labelledby={titleId}>
      <figcaption id={titleId} className="sr-only">
        Visite per giorno, dal {dayLabel(series[0]!.day)} al {dayLabel(series.at(-1)!.day)}
      </figcaption>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block" role="img" aria-labelledby={titleId} onPointerLeave={() => setHover(null)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={pad.left} x2={W - pad.right} y1={y(step * i)} y2={y(step * i)} stroke="rgb(var(--line))" strokeWidth={1} />
            <text x={pad.left - 6} y={y(step * i) + 4} textAnchor="end" className="fill-ink-faint text-[11px] tabular-nums">
              {step * i}
            </text>
          </g>
        ))}
        {series.map((d, i) => {
          const x = pad.left + slot * i + (slot - bw) / 2;
          const bh = Math.max(0, y(0) - y(d.visits));
          const r = Math.min(4, bw / 2, bh);
          return (
            <g key={d.day}>
              {/* Bersaglio grande quanto la fascia, non quanto la colonna. */}
              <rect
                x={pad.left + slot * i}
                y={pad.top}
                width={slot}
                height={H - pad.top - pad.bottom}
                fill="transparent"
                tabIndex={0}
                aria-label={`${dayLabel(d.day, true)}: ${visite(d.visits)}, ${pagine(d.views)}`}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="outline-none"
              />
              {bh > 0 && (
                <path
                  d={`M${x},${y(0)} V${y(0) - bh + r} Q${x},${y(0) - bh} ${x + r},${y(0) - bh} H${x + bw - r} Q${x + bw},${y(0) - bh} ${x + bw},${y(0) - bh + r} V${y(0)} Z`}
                  fill="rgb(var(--pink))"
                  opacity={hover === null || hover === i ? 1 : 0.45}
                  pointerEvents="none"
                />
              )}
              {i % every === 0 && (
                <text x={pad.left + slot * i + slot / 2} y={H - 6} textAnchor="middle" className="fill-ink-faint text-[11px]">
                  {dayLabel(d.day)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {h && (
        <div
          className="pointer-events-none absolute top-0 z-10 rounded-[12px] border border-line bg-wall px-3 py-2 text-sm shadow-lg"
          style={{ left: `clamp(0px, calc(${((pad.left + slot * hover! + slot / 2) / W) * 100}% - 70px), calc(100% - 150px))` }}
        >
          <p className="text-xs capitalize text-ink-dim">{dayLabel(h.day, true)}</p>
          <p className="text-ink">
            {visite(h.visits)} · {pagine(h.views)}
          </p>
        </div>
      )}
    </figure>
  );
}

/** Classifica a barre orizzontali: nome sopra, barra e numero sotto. */
function BarList({ rows, empty }: { rows: { label: string; value: number }[]; empty: string }) {
  if (!rows.length) return <p className="text-sm text-ink-faint">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <ul className="grid gap-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-ink">{r.label}</span>
            <span className="shrink-0 tabular-nums text-ink-dim">{nf.format(r.value)}</span>
          </div>
          <div className="mt-1.5 h-2 rounded-r-[4px] bg-pink" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
        </li>
      ))}
    </ul>
  );
}

export function Dashboard() {
  const [days, setDays] = useState<(typeof PERIODS)[number]>(7);
  const [table, setTable] = useState(false);
  const stats = useQuery({ queryKey: ["admin", "stats", days], queryFn: () => load(days) });
  const s = stats.data;
  const chip = (active: boolean) =>
    cn("min-h-11 shrink-0 rounded-pill border px-4 text-[15px] transition-colors", active ? "border-transparent bg-pink font-bold text-[#12040F]" : "border-line text-ink-dim hover:text-ink");

  return (
    <div className="pb-16">
      <h1 className="tube tube-pink text-3xl">Dashboard</h1>
      <p className="mt-3 max-w-prose text-sm text-ink-dim">
        Statistiche raccolte dal sito stesso, senza Google Analytics né cookie: nessun dato personale, nessun indirizzo IP. Una visita è la prima pagina aperta da
        qualcuno; le pagine viste contano anche quelle dopo.
      </p>

      <div className="mt-8 flex gap-2" role="group" aria-label="Periodo">
        {PERIODS.map((p) => (
          <button key={p} type="button" aria-pressed={days === p} onClick={() => setDays(p)} className={chip(days === p)}>
            {p} giorni
          </button>
        ))}
      </div>

      {stats.isLoading && <p className="mt-8 text-ink-dim">Calcolo…</p>}
      {stats.error && (
        <div className="mt-8">
          <Notice tone="error">Non riesco a calcolare le statistiche. Ricarica la pagina.</Notice>
        </div>
      )}

      {s && (
        <>
          {(s.messages_open > 0 || s.applications_new > 0) && (
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {s.messages_open > 0 && (
                <Link to="/admin/messaggi" className="flex items-center justify-between rounded-tile border border-pink/40 bg-pink/10 p-4 text-ink hover:border-pink">
                  <span>
                    <b>{s.messages_open}</b> {s.messages_open === 1 ? "messaggio da gestire" : "messaggi da gestire"}
                  </span>
                  <ChevronRight className="size-5" aria-hidden />
                </Link>
              )}
              {s.applications_new > 0 && (
                <Link to="/admin/candidature" className="flex items-center justify-between rounded-tile border border-pink/40 bg-pink/10 p-4 text-ink hover:border-pink">
                  <span>
                    <b>{s.applications_new}</b> {s.applications_new === 1 ? "candidatura nuova" : "candidature nuove"}
                  </span>
                  <ChevronRight className="size-5" aria-hidden />
                </Link>
              )}
            </div>
          )}

          <div className="mt-6">
            <Tile label="Visite" value={s.visits} hero>
              <Delta now={s.visits} prev={s.visits_prev} />
            </Tile>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <Tile label="Pagine viste" value={s.views}>
              <Delta now={s.views} prev={s.views_prev} />
            </Tile>
            <Tile label="Tocchi su WhatsApp" value={s.whatsapp}>
              <Delta now={s.whatsapp} prev={s.whatsapp_prev} />
            </Tile>
            <Tile label="Tocchi sul telefono" value={s.phone}>
              <Delta now={s.phone} prev={s.phone_prev} />
            </Tile>
          </div>

          <section className="mt-12">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="tube tube-blue text-2xl">Visite per giorno</h2>
              <button type="button" onClick={() => setTable((t) => !t)} className="min-h-11 text-sm text-ink-dim underline-offset-4 hover:text-ink hover:underline">
                {table ? "Vedi il grafico" : "Vedi i numeri"}
              </button>
            </div>
            <div className="mt-4">
              {table ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-ink-faint">
                      <th className="py-2 font-normal">Giorno</th>
                      <th className="py-2 text-right font-normal">Visite</th>
                      <th className="py-2 text-right font-normal">Pagine viste</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {[...s.series].reverse().map((d) => (
                      <tr key={d.day}>
                        <td className="py-2 capitalize text-ink">{dayLabel(d.day, true)}</td>
                        <td className="py-2 text-right tabular-nums text-ink">{d.visits}</td>
                        <td className="py-2 text-right tabular-nums text-ink-dim">{d.views}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <DailyChart series={s.series} />
              )}
            </div>
          </section>

          <div className="mt-12 grid gap-12 md:grid-cols-3">
            <section>
              <h2 className="tube tube-pink text-2xl">Da dove arrivano</h2>
              <div className="mt-4">
                <BarList rows={s.sources.map((r) => ({ label: SOURCE[r.source] ?? r.source, value: r.visits }))} empty="Ancora nessuna visita." />
              </div>
            </section>
            <section>
              <h2 className="tube tube-blue text-2xl">Con cosa</h2>
              <div className="mt-4">
                <BarList rows={s.devices.map((r) => ({ label: DEVICE[r.device] ?? r.device, value: r.visits }))} empty="Ancora nessuna visita." />
              </div>
            </section>
            <section>
              <h2 className="tube tube-pink text-2xl">Pagine più viste</h2>
              <div className="mt-4">
                <BarList rows={s.pages.map((r) => ({ label: pageName(r.path), value: r.views }))} empty="Ancora nessuna pagina vista." />
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
