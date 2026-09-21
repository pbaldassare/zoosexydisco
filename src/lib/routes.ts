export type Lang = "it" | "en";
export const LANGS: Lang[] = ["it", "en"];

/**
 * Mappa delle pagine pubbliche. Ogni chiave ha il suo percorso nelle due lingue:
 * il selettore di lingua usa la chiave per portare alla pagina equivalente.
 */
export const ROUTES = {
  home: { it: "", en: "" },
  club: { it: "il-locale", en: "the-club" },
  events: { it: "eventi", en: "events" },
  event: { it: "eventi/:slug", en: "events/:slug" },
  shows: { it: "spettacoli", en: "shows" },
  parties: { it: "feste-private", en: "private-parties" },
  photos: { it: "gallery/foto", en: "gallery/photos" },
  videos: { it: "gallery/video", en: "gallery/videos" },
  work: { it: "lavora-con-noi", en: "work-with-us" },
  contacts: { it: "contatti", en: "contacts" },
  newsletter: { it: "newsletter", en: "newsletter" },
  newsletterConfirm: { it: "newsletter/conferma", en: "newsletter/confirm" },
  members: { it: "area-riservata", en: "members" },
  privacy: { it: "privacy", en: "privacy" },
} as const;

export type RouteKey = keyof typeof ROUTES;

export function pathFor(key: RouteKey, lang: Lang, params: Record<string, string> = {}) {
  let p: string = ROUTES[key][lang];
  for (const [k, v] of Object.entries(params)) p = p.replace(`:${k}`, encodeURIComponent(v));
  return `/${lang}${p ? `/${p}` : ""}`;
}

/** Trova la chiave di rotta e i parametri di un percorso, per cambiare lingua. */
export function matchPath(pathname: string): { key: RouteKey; lang: Lang; params: Record<string, string> } | null {
  const parts = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  const lang = parts[0] as Lang;
  if (!LANGS.includes(lang)) return null;
  const rest = parts.slice(1);
  for (const key of Object.keys(ROUTES) as RouteKey[]) {
    const pattern = ROUTES[key][lang].split("/").filter(Boolean);
    if (pattern.length !== rest.length) continue;
    const params: Record<string, string> = {};
    const ok = pattern.every((seg, i) => {
      const actual = rest[i]!;
      if (seg.startsWith(":")) {
        params[seg.slice(1)] = decodeURIComponent(actual);
        return true;
      }
      return seg === actual;
    });
    if (ok) return { key, lang, params };
  }
  return null;
}

export function switchLangPath(pathname: string, to: Lang) {
  const m = matchPath(pathname);
  return m ? pathFor(m.key, to, m.params) : pathFor("home", to);
}
