import type { EventItem, Theme } from "./types";

const img = (f: string) => `/placeholders/${f}`;

export const themes: Theme[] = [
  {
    id: "t-default",
    name: "Default",
    accent: "#E939D7",
    accent_hot: "#3B81E9",
    hero_image_path: img("hero-01.webp"),
    is_default: true,
    force_active: false,
  },
  {
    id: "t-notte-bianca",
    name: "Notte Bianca",
    accent: "#E8B7F0",
    accent_hot: "#7FB2FF",
    hero_image_path: img("theme-bg-notte-bianca.webp"),
    is_default: false,
    force_active: false,
  },
  {
    id: "t-red-velvet",
    name: "Red Velvet",
    accent: "#FF2E83",
    accent_hot: "#8E1F83",
    hero_image_path: img("theme-bg-red-velvet.webp"),
    is_default: false,
    force_active: false,
  },
  {
    id: "t-halloween",
    name: "Halloween",
    accent: "#F06A2A",
    accent_hot: "#A34BE8",
    hero_image_path: img("theme-bg-halloween.webp"),
    is_default: false,
    force_active: false,
  },
  {
    id: "t-gatsby",
    name: "Gatsby '20s",
    accent: "#E9C349",
    accent_hot: "#3B81E9",
    hero_image_path: img("theme-bg-gatsby.webp"),
    is_default: false,
    force_active: false,
  },
];

/**
 * Stessa logica della futura funzione SQL active_theme():
 * 1. tema con force_active; 2. tema nella sua finestra di date (il più recente);
 * 3. tema collegato a una serata in corso oggi; 4. tema Default.
 */
export function resolveActiveTheme(all: Theme[], events: EventItem[], now = new Date()): Theme {
  const forced = all.find((t) => t.force_active);
  if (forced) return forced;

  const t = now.getTime();
  const windowed = all
    .filter((th) => th.starts_at && th.ends_at && Date.parse(th.starts_at) <= t && t < Date.parse(th.ends_at))
    .sort((a, b) => Date.parse(b.starts_at!) - Date.parse(a.starts_at!));
  if (windowed[0]) return windowed[0];

  // Il tema di una serata vale dalle 12:00 del giorno fino alla chiusura.
  const live = events.find((e) => {
    if (!e.theme_id || !e.published) return false;
    const start = new Date(e.starts_at);
    start.setHours(12, 0, 0, 0);
    return start.getTime() <= t && t < Date.parse(e.ends_at);
  });
  const linked = live && all.find((th) => th.id === live.theme_id);
  if (linked) return linked;

  return all.find((th) => th.is_default) ?? all[0]!;
}
