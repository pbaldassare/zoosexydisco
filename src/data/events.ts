import type { EventItem, EventStatus } from "./types";
import { sameDay } from "@/lib/format";

/* Date di esempio calcolate dal giorno corrente, come farà lo script di seed. */

function at(d: Date, hour: number) {
  const x = new Date(d);
  x.setHours(hour, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function nextSaturday(from: Date) {
  const d = at(from, 0);
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  return d;
}
/** Pasqua (algoritmo di Meeus) → sabato di Carnevale = Pasqua − 50 giorni. */
function carnivalSaturday(year: number) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return addDays(new Date(year, month - 1, day), -50);
}

const today = new Date();
const sat1 = nextSaturday(today);
const sat2 = addDays(sat1, 7);
const sat3 = addDays(sat1, 14);
let halloween = new Date(today.getFullYear(), 9, 31);
if (halloween < at(today, 0)) halloween = new Date(today.getFullYear() + 1, 9, 31);
const sat4 = addDays(halloween, 14);
let carnival = carnivalSaturday(today.getFullYear());
if (carnival < today) carnival = carnivalSaturday(today.getFullYear() + 1);

const night = (d: Date) => ({ starts_at: at(d, 23).toISOString(), ends_at: at(addDays(d, 1), 5).toISOString() });
const cover = (t: string) => `/placeholders/event-${t}.webp`;

const entrySample = {
  it: "[da completare]",
  en: "[to be completed]",
};

export const events: EventItem[] = [
  {
    id: "e-notte-bianca",
    slug: "notte-bianca",
    title: { it: "Notte Bianca", en: "White Night" },
    ...night(sat1),
    dress_code: { it: "Total white, dettagli argento", en: "Total white, silver details" },
    description: {
      it: "Una sala vestita di bianco, luci fredde e un solo colore in pista. La serata che apre la stagione.",
      en: "A room dressed in white, cool lights and a single colour on the floor. The night that opens the season.",
    },
    cover_path: cover("notte-bianca"),
    entry: entrySample,
    theme_id: "t-notte-bianca",
    members_only: false,
    published: true,
    is_sample: true,
  },
  {
    id: "e-red-velvet",
    slug: "red-velvet",
    title: { it: "Red Velvet", en: "Red Velvet" },
    ...night(sat2),
    dress_code: { it: "Rosso profondo, velluto e pizzo", en: "Deep red, velvet and lace" },
    description: {
      it: "Velluto, luci basse e rosso ovunque. Una notte lenta, da tavolo e da brindisi.",
      en: "Velvet, low lights and red everywhere. A slow night, made for tables and toasts.",
    },
    cover_path: cover("red-velvet"),
    entry: entrySample,
    theme_id: "t-red-velvet",
    members_only: false,
    published: true,
    is_sample: true,
  },
  {
    id: "e-uniform",
    slug: "uniform-night",
    title: { it: "Uniform Night", en: "Uniform Night" },
    ...night(sat3),
    dress_code: { it: "Divise: hostess, ufficiale, infermiera", en: "Uniforms: flight crew, officer, nurse" },
    description: {
      it: "Una serata a divisa, con lo staff in uniforme dall'apertura alla chiusura.",
      en: "A uniform night, with the whole staff in costume from opening to closing.",
    },
    cover_path: cover("uniform"),
    entry: entrySample,
    members_only: false,
    published: true,
    is_sample: true,
  },
  {
    id: "e-halloween",
    slug: "halloween-night",
    title: { it: "Halloween Night", en: "Halloween Night" },
    ...night(halloween),
    dress_code: { it: "Maschere, nero e arancio", en: "Masks, black and orange" },
    description: {
      it: "La notte più lunga dell'anno ha le luci arancio e i volti coperti. Si entra in maschera.",
      en: "The longest night of the year, lit in orange with faces covered. Masks at the door.",
    },
    cover_path: cover("halloween"),
    entry: entrySample,
    theme_id: "t-halloween",
    members_only: false,
    published: true,
    is_sample: true,
  },
  {
    id: "e-gatsby",
    slug: "gatsby-20s",
    title: { it: "Gatsby '20s", en: "Gatsby '20s" },
    ...night(sat4),
    dress_code: { it: "Frange, perle e piume", en: "Fringes, pearls and feathers" },
    description: {
      it: "Oro, jazz rivisto e coppe da champagne. Una festa anni Venti, con cento anni di ritardo.",
      en: "Gold, reworked jazz and champagne coupes. A Roaring Twenties party, a century late.",
    },
    cover_path: cover("gatsby"),
    entry: entrySample,
    theme_id: "t-gatsby",
    members_only: false,
    published: true,
    is_sample: true,
  },
  {
    id: "e-carnevale",
    slug: "carnevale-veneziano",
    title: { it: "Carnevale Veneziano", en: "Venetian Carnival" },
    ...night(carnival),
    dress_code: { it: "Maschere veneziane, broccato", en: "Venetian masks, brocade" },
    description: {
      it: "Maschere dorate e tessuti pesanti: il Carnevale arriva a Madone per una notte.",
      en: "Gilded masks and heavy fabrics: Carnival comes to Madone for one night.",
    },
    cover_path: cover("carnevale"),
    entry: entrySample,
    members_only: false,
    published: true,
    is_sample: true,
  },
  // Serate passate, per popolare l'archivio.
  ...[
    { slug: "black-and-gold", it: "Black & Gold", en: "Black & Gold", days: -9, t: "gatsby" },
    { slug: "neon-summer", it: "Neon Summer", en: "Neon Summer", days: -30, t: "uniform" },
    { slug: "chiusura-estiva", it: "Chiusura estiva", en: "Summer closing", days: -58, t: "red-velvet" },
  ].map(
    (p): EventItem => ({
      id: `e-${p.slug}`,
      slug: p.slug,
      title: { it: p.it, en: p.en },
      ...night(addDays(at(today, 0), p.days)),
      dress_code: { it: "Libero, elegante", en: "Free, elegant" },
      description: {
        it: "Serata di esempio in archivio. Le foto della serata compaiono qui sotto.",
        en: "Sample archived night. Photos from the night appear below.",
      },
      cover_path: cover(p.t),
      entry: entrySample,
      members_only: false,
      published: true,
      is_sample: true,
    }),
  ),
];

/** Stato calcolato, mai salvato: stasera / prossima / archiviata. */
export function eventStatus(e: EventItem, now = new Date()): EventStatus {
  const start = new Date(e.starts_at);
  const end = new Date(e.ends_at);
  if (end <= now) return "archived";
  if (sameDay(start, now) || start <= now) return "tonight";
  return "upcoming";
}
