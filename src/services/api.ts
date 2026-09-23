/**
 * Unico punto di accesso ai dati. Oggi legge i file in src/data;
 * quando si collega Supabase, queste funzioni diventano query con RLS
 * e le firme restano uguali, così pagine e componenti non cambiano.
 */
import { settings } from "@/data/settings";
import { content } from "@/data/content";
import { themes, resolveActiveTheme } from "@/data/themes";
import { events, eventStatus } from "@/data/events";
import { jobRoles, media, promotions, reviews, timeline } from "@/data/catalog";
import type { EventItem, Media } from "@/data/types";
import { DATA_SOURCE } from "@/lib/supabase";
import { remote } from "./remote";

const delay = <T,>(v: T) => Promise.resolve(v);

/** Dati locali di esempio (src/data): usati senza Supabase o con VITE_DATA_SOURCE=local. */
const local = {
  settings: () => delay(settings),
  content: () => delay(content),
  activeTheme: () => delay(resolveActiveTheme(themes, events)),
  themes: () => delay(themes),

  /** Eventi pubblici (esclusi quelli su invito, riservati agli iscritti). */
  events: () =>
    delay(
      events
        .filter((e) => e.published && !e.members_only)
        .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at)),
    ),
  event: (slug: string) => delay(events.find((e) => e.slug === slug && e.published && !e.members_only) ?? null),
  nextEvent: () =>
    delay(
      events
        .filter((e) => e.published && !e.members_only && eventStatus(e) !== "archived")
        .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at))[0] ?? null,
    ),

  timeline: () => delay(timeline),
  jobRoles: () => delay(jobRoles.filter((r) => r.active).sort((a, b) => a.sort - b.sort)),
  reviews: () => delay(reviews.filter((r) => r.visible && r.rating === 5).sort((a, b) => a.sort - b.sort)),
  promotions: (audience: "public" | "members") =>
    delay(
      promotions.filter(
        (p) => p.published && p.audience === audience && Date.parse(p.valid_from) <= Date.now() && Date.now() < Date.parse(p.valid_to),
      ),
    ),

  /** Media pubblici: visibili e non riservati agli iscritti. */
  media: (opts: { kind?: Media["kind"]; placement?: "gallery" | "home"; eventId?: string } = {}) =>
    delay(
      media
        .filter((m) => m.visible && !m.placement.includes("members"))
        .filter((m) => !opts.kind || m.kind === opts.kind)
        .filter((m) => !opts.placement || m.placement.includes(opts.placement))
        .filter((m) => !opts.eventId || m.event_id === opts.eventId)
        .sort((a, b) => a.sort - b.sort),
    ),
  membersMedia: () => delay(media.filter((m) => m.visible && m.placement.includes("members"))),
};

const reads = DATA_SOURCE === "supabase" ? remote : local;

export const api = {
  ...reads,

  /**
   * Chiederà a sign-media un URL firmato di 300 secondi. Senza Supabase non c'è
   * nessun file video da firmare: restituisce null e il player lo dice.
   */
  signMedia: async (_mediaId: string): Promise<string | null> => null,

  /* Invii dei moduli: in anteprima si limitano a simulare la risposta. */
  submitContact: async (_payload: Record<string, unknown>) => {
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true as const, demo: true };
  },
  submitApplication: async (_payload: FormData) => {
    await new Promise((r) => setTimeout(r, 900));
    return { ok: true as const, demo: true };
  },
  subscribe: async (_payload: { name: string; email: string; lang: string }) => {
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true as const, demo: true };
  },
};

export type { EventItem };
