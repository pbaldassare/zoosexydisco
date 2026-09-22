import type { OpeningWindow } from "@/data/types";

/**
 * Stato «siamo aperti adesso?» calcolato sempre sull'ora di Roma, non su
 * quella del telefono: chi guarda il sito dall'estero deve vedere la serata
 * giusta. Stessa logica che andrà nella funzione SQL lato Supabase.
 */

const WEEKDAY: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export type RomeParts = { y: number; m: number; d: number; h: number; min: number; wd: number };

export function romeParts(date = new Date()): RomeParts {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  }).formatToParts(date);

  const o: Record<string, string> = {};
  for (const p of parts) o[p.type] = p.value;

  return {
    y: Number(o.year),
    m: Number(o.month),
    d: Number(o.day),
    h: Number(o.hour) % 24,
    min: Number(o.minute),
    wd: WEEKDAY[o.weekday ?? "Mon"] ?? 1,
  };
}

const WEEK = 7 * 1440;
const toMinutes = (hhmm: string) => {
  const [h = "0", m = "0"] = hhmm.split(":");
  return Number(h) * 60 + Number(m);
};
/** Minuti dall'inizio della settimana, con lunedì 00:00 = 0. */
const weekMinutes = (wd: number, h: number, min: number) => ((wd + 6) % 7) * 1440 + h * 60 + min;

export type OpenState = {
  /** Siamo aperti in questo momento. */
  open: boolean;
  /** Giorno della finestra di turno (0 = domenica), per accendere il tubo giusto. */
  day: number;
  /** Orario di apertura e chiusura di quella finestra. */
  opensAt: string;
  closesAt: string;
  /** Notti che mancano: 0 = stasera, 1 = domani, oltre = si dice il giorno. */
  inDays: number;
};

/**
 * La finestra di turno: quella in corso, altrimenti la prossima.
 * Non esiste uno stato «chiuso» — c'è sempre una prossima serata
 * (DESIGN.md: mai la parola «Chiuso» in home).
 */
export function openState(windows: OpeningWindow[], now = new Date()): OpenState | null {
  if (!windows.length) return null;
  const p = romeParts(now);
  const mow = weekMinutes(p.wd, p.h, p.min);

  const spans = windows.map((w) => {
    const openMin = toMinutes(w.open);
    const closeMin = toMinutes(w.close);
    const span = closeMin > openMin ? closeMin - openMin : closeMin + 1440 - openMin;
    return { w, start: weekMinutes(w.day, 0, 0) + openMin, span };
  });

  // Una finestra che scavalca la fine della settimana va cercata anche una
  // settimana avanti, altrimenti il sabato notte dopo mezzanotte risulta chiuso.
  for (const s of spans) {
    for (const t of [mow, mow + WEEK]) {
      if (t >= s.start && t < s.start + s.span) {
        return { open: true, day: s.w.day, opensAt: s.w.open, closesAt: s.w.close, inDays: 0 };
      }
    }
  }

  let next = spans[0]!;
  let delta = WEEK;
  for (const s of spans) {
    const d = (s.start - mow + WEEK) % WEEK;
    if (d < delta) {
      delta = d;
      next = s;
    }
  }

  return {
    open: false,
    day: next.w.day,
    opensAt: next.w.open,
    closesAt: next.w.close,
    // Quante mezzanotti ci sono tra adesso e l'apertura.
    inDays: Math.floor((delta + p.h * 60 + p.min) / 1440),
  };
}

/** Nome del giorno nella lingua della pagina, dal numero 0-6. */
export function weekdayName(day: number, lang: string) {
  // 2024-01-07 è una domenica: sommando `day` si ottiene il giorno giusto.
  const d = new Date(Date.UTC(2024, 0, 7 + day));
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "it-IT", { weekday: "long", timeZone: "UTC" }).format(d);
}
