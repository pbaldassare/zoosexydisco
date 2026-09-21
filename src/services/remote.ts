/**
 * Lettura da Supabase. Le righe del database (colonne _it/_en, path nei bucket)
 * vengono convertite nei tipi usati dalle pagine, così i componenti non sanno
 * da dove arrivano i dati. Le RLS decidono cosa è visibile: qui non si filtra
 * per sicurezza, solo per ordine e comodità.
 */
import type { EventItem, JobRole, L, Media, Promotion, Review, Show, SiteSettings, Theme, TimelineStep } from "@/data/types";
import { publicUrl, supabase } from "@/lib/supabase";

type Row = Record<string, unknown>;
const s = (v: unknown) => (typeof v === "string" ? v : "");
const l = (r: Row, k: string): L => ({ it: s(r[`${k}_it`]), en: s(r[`${k}_en`]) });

function db() {
  if (!supabase) throw new Error("Supabase non configurato");
  return supabase;
}

async function rows(table: string, build: (q: ReturnType<ReturnType<typeof db>["from"]>) => PromiseLike<{ data: unknown; error: unknown }>) {
  const { data, error } = await build(db().from(table));
  if (error) throw error;
  return (data ?? []) as Row[];
}

export const toSettings = (r: Row): SiteSettings => ({
  company_name: s(r.company_name),
  legal_address: s(r.legal_address),
  vat_number: s(r.vat_number),
  rea: s(r.rea),
  registry: s(r.registry),
  share_capital: s(r.share_capital),
  pec: s(r.pec),
  email: s(r.email),
  phone: s(r.phone),
  whatsapp: s(r.whatsapp),
  instagram_handle: s(r.instagram_handle),
  instagram_url: s(r.instagram_url),
  google_reviews_url: s(r.google_reviews_url),
  address_venue: s(r.address_venue),
  maps_query: s(r.maps_query),
  opening_hours: l(r, "opening_hours"),
  entry_prices: l(r, "entry_prices"),
  drink_prices: l(r, "drink_prices"),
  logo_path: r.logo_path ? publicUrl("theme-assets", s(r.logo_path)) : "/brand/logo-placeholder.svg",
  upload_video_max_mb: Number(r.upload_video_max_mb ?? 50),
  upload_video_max_seconds: Number(r.upload_video_max_seconds ?? 90),
});

export const toTheme = (r: Row): Theme => ({
  id: s(r.id),
  name: s(r.name),
  accent: s(r.accent),
  accent_hot: s(r.accent_hot),
  hero_image_path: publicUrl("theme-assets", s(r.hero_image_path)) || "/placeholders/hero-01.webp",
  hero_video_path: r.hero_video_path ? publicUrl("theme-assets", s(r.hero_video_path)) : undefined,
  logo_path: r.logo_path ? publicUrl("theme-assets", s(r.logo_path)) : undefined,
  starts_at: (r.starts_at as string) ?? undefined,
  ends_at: (r.ends_at as string) ?? undefined,
  is_default: !!r.is_default,
  force_active: !!r.force_active,
});

export const toEvent = (r: Row): EventItem => ({
  id: s(r.id),
  slug: s(r.slug),
  title: l(r, "title"),
  starts_at: s(r.starts_at),
  ends_at: s(r.ends_at),
  dress_code: l(r, "dress_code"),
  description: l(r, "description"),
  cover_path: publicUrl("public-media", s(r.cover_path)),
  entry: l(r, "entry"),
  theme_id: (r.theme_id as string) ?? undefined,
  members_only: !!r.members_only,
  published: !!r.published,
  is_sample: !!r.is_sample,
});

const toShow = (r: Row): Show => ({
  id: s(r.id),
  title: l(r, "title"),
  description: l(r, "description"),
  schedule: l(r, "schedule"),
  cover_path: publicUrl("public-media", s(r.cover_path)),
  sort: Number(r.sort ?? 0),
  published: !!r.published,
  is_sample: !!r.is_sample,
});

/** Media: i bucket privati non hanno URL pubblico; i video passano da sign-media. */
const toMedia = (r: Row): Media => {
  const bucket = s(r.bucket);
  const pub = bucket === "public-media";
  return {
    id: s(r.id),
    kind: r.kind === "video" ? "video" : "image",
    path: pub ? publicUrl(bucket, s(r.path)) : "",
    thumb_path: pub ? publicUrl(bucket, s(r.thumb_path)) : "",
    poster_path: r.poster_path ? publicUrl("public-media", s(r.poster_path)) : undefined,
    width: Number(r.width ?? 1600),
    height: Number(r.height ?? 1067),
    duration_s: r.duration_s != null ? Number(r.duration_s) : undefined,
    event_id: (r.event_id as string) ?? undefined,
    placement: (r.placement as Media["placement"]) ?? [],
    alt: r.alt_it || r.alt_en ? l(r, "alt") : undefined,
    visible: !!r.visible,
    sort: Number(r.sort ?? 0),
    is_sample: !!r.is_sample,
  };
};

const toReview = (r: Row): Review => ({
  id: s(r.id),
  author_name: s(r.author_name),
  rating: Number(r.rating) as Review["rating"],
  text: l(r, "text"),
  source: r.source === "google" ? "google" : "manual",
  review_date: s(r.review_date),
  visible: !!r.visible,
  sort: Number(r.sort ?? 0),
  is_sample: !!r.is_sample,
});

const toPromotion = (r: Row): Promotion => ({
  id: s(r.id),
  title: l(r, "title"),
  body: l(r, "body"),
  code: (r.code as string) ?? undefined,
  image_path: r.image_path ? publicUrl("public-media", s(r.image_path)) : undefined,
  valid_from: s(r.valid_from),
  valid_to: s(r.valid_to),
  audience: r.audience === "members" ? "members" : "public",
  published: !!r.published,
});

const toJobRole = (r: Row): JobRole => ({ id: s(r.id), name: l(r, "name"), active: !!r.active, sort: Number(r.sort ?? 0) });

const EVENT_COLS = "id, slug, title_it, title_en, starts_at, ends_at, dress_code_it, dress_code_en, description_it, description_en, cover_path, entry_it, entry_en, theme_id, members_only, published, is_sample";

export const remote = {
  async settings() {
    const [r] = await rows("site_settings", (q) => q.select("*").limit(1));
    if (!r) throw new Error("site_settings vuota: esegui npm run seed");
    return toSettings(r);
  },
  async content() {
    const data = await rows("content_blocks", (q) => q.select("key, it, en"));
    return Object.fromEntries(data.map((r) => [s(r.key), { it: s(r.it), en: s(r.en) }])) as Record<string, L>;
  },
  async activeTheme() {
    const { data, error } = await db().rpc("active_theme");
    if (error) throw error;
    const r = (data as Row[] | null)?.[0];
    if (!r) throw new Error("nessun tema: esegui npm run seed");
    return toTheme(r);
  },
  /** La storia del locale vive in content_blocks: story.<n>.year / .title / .text */
  async timeline() {
    const data = await rows("content_blocks", (q) => q.select("key, it, en").like("key", "story.%"));
    const steps = new Map<number, Partial<TimelineStep>>();
    for (const r of data) {
      const [, n, field] = s(r.key).split(".");
      const i = Number(n);
      if (!Number.isFinite(i) || !field) continue;
      const step = steps.get(i) ?? {};
      (step as Record<string, L>)[field] = { it: s(r.it), en: s(r.en) };
      steps.set(i, step);
    }
    return [...steps.entries()].sort(([a], [b]) => a - b).map(([, v]) => v as TimelineStep);
  },
  async themes() {
    return (await rows("themes", (q) => q.select("*").order("name"))).map(toTheme);
  },
  async events() {
    return (await rows("events", (q) => q.select(EVENT_COLS).eq("published", true).eq("members_only", false).order("starts_at"))).map(toEvent);
  },
  async event(slug: string) {
    const [r] = await rows("events", (q) => q.select(EVENT_COLS).eq("slug", slug).eq("published", true).eq("members_only", false).limit(1));
    return r ? toEvent(r) : null;
  },
  async nextEvent() {
    const [r] = await rows("events", (q) => q.select(EVENT_COLS).eq("published", true).eq("members_only", false).gt("ends_at", new Date().toISOString()).order("starts_at").limit(1));
    return r ? toEvent(r) : null;
  },
  async shows() {
    return (await rows("shows", (q) => q.select("*").eq("published", true).order("sort"))).map(toShow);
  },
  async jobRoles() {
    return (await rows("job_roles", (q) => q.select("*").eq("active", true).order("sort"))).map(toJobRole);
  },
  async reviews() {
    return (await rows("reviews", (q) => q.select("*").eq("visible", true).eq("rating", 5).order("sort"))).map(toReview);
  },
  async promotions(audience: "public" | "members") {
    return (await rows("promotions", (q) => {
      const now = new Date().toISOString();
      return q.select("*").eq("published", true).eq("audience", audience).lte("valid_from", now).gt("valid_to", now);
    })).map(toPromotion);
  },
  async media(opts: { kind?: Media["kind"]; placement?: "gallery" | "home"; eventId?: string }) {
    const data = await rows("media", (q) => {
      let x = q.select("*").eq("visible", true).not("placement", "cs", "{members}").order("sort");
      if (opts.kind) x = x.eq("kind", opts.kind);
      if (opts.placement) x = x.contains("placement", [opts.placement]);
      if (opts.eventId) x = x.eq("event_id", opts.eventId);
      return x;
    });
    return data.map(toMedia);
  },
  async membersMedia() {
    return (await rows("media", (q) => q.select("*").eq("visible", true).contains("placement", ["members"]).order("sort"))).map(toMedia);
  },
};
