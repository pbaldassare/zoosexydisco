import type { RouteKey } from "@/lib/routes";

/** `hash` porta a una sezione della pagina invece che in cima. */
export type NavItem = { key: RouteKey; label: string; hash?: string };

/**
 * Menu principale: le sei voci del riferimento di design, riordinate per
 * accompagnare la visita — prima quando siamo aperti, poi dov'è il locale,
 * poi cosa ci si trova. «Le notti» non è una pagina: è la sezione degli
 * orari in home.
 */
export const MAIN_NAV: NavItem[] = [
  { key: "home", label: "nav.nights", hash: "#notti" },
  { key: "club", label: "nav.club" },
  { key: "events", label: "nav.events" },
  { key: "photos", label: "nav.gallery" },
  { key: "work", label: "nav.work" },
  { key: "contacts", label: "nav.contacts" },
];

/** Percorso completo di una voce, ancora compresa. */
export const navHref = (item: NavItem, path: string) => path + (item.hash ?? "");
