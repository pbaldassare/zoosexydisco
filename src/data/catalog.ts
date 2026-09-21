import type { JobRole, Media, Promotion, Review, Show, TimelineStep } from "./types";

const ph = (f: string) => `/placeholders/${f}`;

/* ---------- media ---------- */
const galleryEvents = ["e-black-and-gold", "e-neon-summer", "e-chiusura-estiva"];

export const media: Media[] = [
  ...Array.from({ length: 16 }, (_, i): Media => {
    const n = String(i + 1).padStart(2, "0");
    const land = (i + 1) % 2 === 1;
    const placement: Media["placement"] = ["gallery"];
    if ([0, 5, 10].includes(i)) placement.push("home");
    return {
      id: `m-img-${n}`,
      kind: "image",
      path: ph(`gallery-${n}.webp`),
      thumb_path: ph(`gallery-${n}-480.webp`),
      width: land ? 1600 : 1067,
      height: land ? 1067 : 1600,
      event_id: galleryEvents[i % 3],
      placement,
      visible: true,
      sort: i,
      is_sample: true,
    };
  }),
  // Contenuti per iscritti: visibili solo nell'area riservata.
  ...[3, 8].map(
    (n, i): Media => ({
      id: `m-members-${i}`,
      kind: "image",
      path: ph(`show-0${(i % 4) + 1}.webp`),
      thumb_path: ph(`show-0${(i % 4) + 1}-480.webp`),
      width: 1600,
      height: 1067,
      placement: ["members"],
      visible: true,
      sort: n,
      is_sample: true,
    }),
  ),
  // Video di esempio: solo il poster. Il file arriverà su Supabase Storage (bucket privato).
  ...[
    { id: "m-vid-1", poster: "show-01", dur: 42, ev: "e-black-and-gold" },
    { id: "m-vid-2", poster: "show-03", dur: 67, ev: "e-neon-summer" },
    { id: "m-vid-3", poster: "hero-02", dur: 88, ev: "e-chiusura-estiva" },
  ].map(
    (v, i): Media => ({
      id: v.id,
      kind: "video",
      path: "",
      thumb_path: ph(`${v.poster}-480.webp`),
      poster_path: ph(`${v.poster}.webp`),
      width: 1920,
      height: 1080,
      duration_s: v.dur,
      event_id: v.ev,
      placement: ["gallery"],
      visible: true,
      sort: i,
      is_sample: true,
    }),
  ),
];

/* ---------- spettacoli ---------- */
export const shows: Show[] = [
  {
    id: "s-apertura",
    title: { it: "Apertura di sala", en: "Opening set" },
    description: {
      it: "La prima uscita della notte: luci che salgono piano, musica che cambia passo, il palco che si accende.",
      en: "The first set of the night: lights rising slowly, the music changing pace, the stage coming alive.",
    },
    schedule: { it: "Poco dopo l'apertura", en: "Shortly after opening" },
    cover_path: ph("show-01.webp"),
    sort: 1,
    published: true,
    is_sample: true,
  },
  {
    id: "s-palco",
    title: { it: "Palco centrale", en: "Centre stage" },
    description: {
      it: "Esibizioni a rotazione sul palco centrale, con coreografie studiate per la serata.",
      en: "Rotating performances on the centre stage, with choreography built for the night.",
    },
    schedule: { it: "Per tutta la notte, a rotazione", en: "All night, in rotation" },
    cover_path: ph("show-02.webp"),
    sort: 2,
    published: true,
    is_sample: true,
  },
  {
    id: "s-tema",
    title: { it: "Show a tema", en: "Theme show" },
    description: {
      it: "Nelle serate a tema lo spettacolo principale segue il dress code: costumi, luci e musica dedicati.",
      en: "On theme nights the main show follows the dress code: dedicated costumes, lights and music.",
    },
    schedule: { it: "Nel cuore della notte", en: "At the heart of the night" },
    cover_path: ph("show-03.webp"),
    sort: 3,
    published: true,
    is_sample: true,
  },
  {
    id: "s-prive",
    title: { it: "Privé", en: "Private room" },
    description: {
      it: "Uno spazio più raccolto, lontano dalla sala. Riservatezza prima di tutto.",
      en: "A more intimate space, away from the main room. Discretion above all.",
    },
    schedule: { it: "Su richiesta, in serata", en: "On request, during the night" },
    cover_path: ph("show-04.webp"),
    sort: 4,
    published: true,
    is_sample: true,
  },
];

/* ---------- recensioni (esempi, mai in produzione) ---------- */
const reviewTexts: Array<[string, string]> = [
  ["Serata organizzata bene, staff gentile e locale molto curato.", "Well-run night, kind staff and a very well-kept venue."],
  ["Siamo venuti per un addio al celibato: tavolo pronto e tutto come promesso.", "We came for a stag night: table ready and everything as promised."],
  ["Atmosfera elegante, musica giusta, nessuna sorpresa sul conto.", "Elegant atmosphere, the right music, no surprises on the bill."],
  ["Ambiente discreto e sicuro. Ci torneremo per la prossima serata a tema.", "Discreet and safe. We'll be back for the next theme night."],
  ["Spettacoli ben fatti e sala pulita. Personale all'ingresso cortese.", "Well-staged shows and a clean room. Courteous door staff."],
  ["Compleanno festeggiato qui: hanno pensato a tutto loro.", "Celebrated a birthday here: they took care of everything."],
];

export const reviews: Review[] = reviewTexts.map(([it, en], i) => ({
  id: `r-${i}`,
  author_name: `Esempio ${String.fromCharCode(65 + i)}.`,
  rating: 5,
  text: { it, en },
  source: "manual",
  review_date: new Date(Date.now() - (i + 1) * 12 * 86400000).toISOString(),
  visible: true,
  sort: i,
  is_sample: true,
}));

/* ---------- ruoli aperti (titoli neutri rispetto al genere) ---------- */
export const jobRoles: JobRole[] = [
  { id: "j-ballo", name: { it: "Ballerina / Ballerino", en: "Dancer" }, active: true, sort: 1 },
  { id: "j-cubo", name: { it: "Cubista", en: "Podium dancer" }, active: true, sort: 2 },
  { id: "j-sala", name: { it: "Cameriere / Cameriera", en: "Waiting staff" }, active: true, sort: 3 },
  { id: "j-bar", name: { it: "Barman / Barlady", en: "Bartender" }, active: true, sort: 4 },
  { id: "j-pr", name: { it: "PR", en: "PR" }, active: true, sort: 5 },
  { id: "j-sec", name: { it: "Sicurezza", en: "Security" }, active: true, sort: 6 },
];

/* ---------- promozioni ---------- */
const inDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString();
export const promotions: Promotion[] = [
  {
    id: "p-public",
    title: { it: "Compleanno? Il brindisi lo offriamo noi", en: "Birthday? The toast is on us" },
    body: {
      it: "Nel mese del tuo compleanno, prenotando un tavolo, la bottiglia per il brindisi è offerta. Condizioni: [da completare].",
      en: "In your birthday month, book a table and the toasting bottle is on the house. Terms: [to be completed].",
    },
    valid_from: inDays(-5),
    valid_to: inDays(90),
    audience: "public",
    published: true,
  },
  {
    id: "p-members",
    title: { it: "In lista: ingresso ridotto", en: "On the list: reduced entry" },
    body: {
      it: "Mostra questo codice all'ingresso per l'ingresso ridotto il venerdì. Condizioni: [da completare].",
      en: "Show this code at the door for reduced entry on Fridays. Terms: [to be completed].",
    },
    code: "ZOO-LISTA",
    valid_from: inDays(-5),
    valid_to: inDays(60),
    audience: "members",
    published: true,
  },
];

/* ---------- storia del locale ---------- */
export const timeline: TimelineStep[] = [
  {
    year: { it: "Fine anni '90", en: "Late '90s" },
    title: { it: "Si accendono le luci", en: "The lights come on" },
    text: {
      it: "ZOO apre a Madone. Anno esatto e racconto dell'apertura: [da completare con il proprietario].",
      en: "ZOO opens in Madone. Exact year and opening story: [to be completed with the owner].",
    },
  },
  {
    year: { it: "[anno]", en: "[year]" },
    title: { it: "Seconda tappa", en: "Second chapter" },
    text: { it: "[da completare con il proprietario]", en: "[to be completed with the owner]" },
  },
  {
    year: { it: "[anno]", en: "[year]" },
    title: { it: "Terza tappa", en: "Third chapter" },
    text: { it: "[da completare con il proprietario]", en: "[to be completed with the owner]" },
  },
  {
    year: { it: "Oggi", en: "Today" },
    title: { it: "La notte continua", en: "The night goes on" },
    text: { it: "[da completare con il proprietario]", en: "[to be completed with the owner]" },
  },
];
