import type { RouteKey } from "@/lib/routes";

/**
 * I testi modificabili, nell'ordine in cui si incontrano sul sito, con un nome
 * che l'admin capisce. Le chiavi sono quelle di content_blocks; quelle che il
 * sito non mostra (per esempio le tappe della storia) restano fuori.
 */
export type TextEntry = { key: string; label: string; short?: boolean; note?: string };
export type TextGroup = { id: string; title: string; page: RouteKey; entries: TextEntry[] };

export const TEXT_GROUPS: TextGroup[] = [
  {
    id: "home",
    title: "Home",
    page: "home",
    entries: [
      { key: "home.since", label: "Scritta blu sotto l'insegna", short: true },
      { key: "home.heroCopy", label: "Presentazione in apertura", note: "È anche la descrizione che mostra Google." },
      { key: "home.nights.title", label: "Le nostre notti · titolo", short: true },
      { key: "home.nights.lead", label: "Le nostre notti · introduzione" },
      { key: "home.nights.holidays", label: "Aperture extra e festività", note: "Compare anche in fondo a ogni pagina." },
      { key: "home.events.title", label: "Serate a tema · titolo", short: true },
      { key: "home.events.lead", label: "Serate a tema · introduzione" },
      { key: "home.club.p1", label: "Il locale · primo paragrafo", note: "Compare anche nella pagina Il locale." },
      { key: "home.club.p2", label: "Il locale · secondo paragrafo", note: "Compare anche nella pagina Il locale." },
      { key: "home.feat.bar.title", label: "Bar · titolo", short: true },
      { key: "home.feat.bar.body", label: "Bar · descrizione" },
      { key: "home.feat.shows.title", label: "Spettacoli · titolo", short: true },
      { key: "home.feat.shows.body", label: "Spettacoli · descrizione" },
      { key: "home.feat.tables.title", label: "Tavoli e privé · titolo", short: true },
      { key: "home.feat.tables.body", label: "Tavoli e privé · descrizione" },
      { key: "home.feat.access.title", label: "Accessibilità · titolo", short: true },
      { key: "home.feat.access.body", label: "Accessibilità · descrizione" },
      { key: "home.rules.title", label: "Regole della casa · titolo", short: true },
      { key: "home.rules.photo.title", label: "Regola foto · titolo", short: true },
      { key: "home.rules.photo.body", label: "Regola foto · testo" },
      { key: "home.rules.age.title", label: "Regola età · titolo", short: true },
      { key: "home.rules.age.body", label: "Regola età · testo" },
      { key: "home.rules.respect.title", label: "Regola rispetto · titolo", short: true },
      { key: "home.rules.respect.body", label: "Regola rispetto · testo" },
      { key: "home.gallery.note", label: "Gallery · nota sotto le foto" },
      { key: "home.job.title", label: "Lavora con noi · titolo", short: true },
      { key: "home.job.lead", label: "Lavora con noi · introduzione" },
    ],
  },
  {
    id: "club",
    title: "Il locale",
    page: "club",
    entries: [
      { key: "club.intro", label: "Introduzione in alto" },
      { key: "club.room.sala", label: "La sala" },
      { key: "club.room.tavoli", label: "I tavoli" },
      { key: "club.room.prive", label: "Il privé" },
      { key: "club.experience.title", label: "Un'esperienza da vivere · titolo", short: true },
      { key: "club.experience.p1", label: "Un'esperienza da vivere · primo paragrafo" },
      { key: "club.experience.p2", label: "Un'esperienza da vivere · secondo paragrafo" },
      { key: "club.experience.p3", label: "Un'esperienza da vivere · terzo paragrafo" },
      { key: "club.new.title", label: "Sempre qualcosa di nuovo · titolo", short: true },
      { key: "club.new.body", label: "Sempre qualcosa di nuovo · testo" },
      { key: "club.new.closing", label: "Frase di chiusura" },
      { key: "club.directions", label: "Come arrivare e parcheggio" },
    ],
  },
  {
    id: "events",
    title: "Serate a tema",
    page: "events",
    entries: [{ key: "events.intro", label: "Introduzione in alto" }],
  },
  {
    id: "work",
    title: "Lavora con noi",
    page: "work",
    entries: [
      { key: "work.intro", label: "Introduzione in alto" },
      { key: "work.offer", label: "Cosa offriamo" },
    ],
  },
  {
    id: "newsletter",
    title: "Newsletter",
    page: "newsletter",
    entries: [
      { key: "newsletter.title", label: "Titolo", short: true },
      { key: "newsletter.body", label: "Cosa si riceve" },
      { key: "newsletter.gift", label: "Regalo di benvenuto" },
    ],
  },
  {
    id: "contacts",
    title: "Contatti",
    page: "contacts",
    entries: [{ key: "contacts.intro", label: "Introduzione in alto" }],
  },
];
