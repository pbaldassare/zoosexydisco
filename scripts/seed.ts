/**
 * Carica i contenuti di esempio su Supabase. Idempotente: gli id sono derivati
 * dal nome dell'elemento, quindi rilanciarlo aggiorna invece di duplicare.
 *
 *   npm run seed         genera i placeholder (se mancano) e carica tutto
 *   npm run seed:clean   cancella tutto ciò che ha is_sample = true
 *
 * Usa SUPABASE_SERVICE_ROLE_KEY da .env.local: mai nel frontend.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { settings } from "../src/data/settings";
import { content } from "../src/data/content";
import { themes } from "../src/data/themes";
import { events } from "../src/data/events";
import { jobRoles, media, promotions, reviews, shows, timeline } from "../src/data/catalog";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const file = path.join(root, ".env.local");
  if (!existsSync(file)) throw new Error("Manca .env.local");
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m && !process.env[m[1]!]) process.env[m[1]!] = m[2];
  }
}
loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Servono VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY in .env.local");
const db = createClient(url, key, { auth: { persistSession: false } });

/** uuid deterministico (formato v4-like) a partire da un nome. */
function stableId(name: string) {
  const h = createHash("sha1").update(`zoo:${name}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

/** Carica un file di public/placeholders e restituisce il path nel bucket (<uuid>.webp). */
async function upload(bucket: string, publicPath: string): Promise<string> {
  const local = path.join(root, "public", publicPath.replace(/^\//, ""));
  const ext = path.extname(local).slice(1);
  const objectPath = `${stableId(`${bucket}:${publicPath}`)}.${ext}`;
  const { error } = await db.storage.from(bucket).upload(objectPath, readFileSync(local), {
    contentType: ext === "webp" ? "image/webp" : `image/${ext}`,
    upsert: true,
    cacheControl: "31536000",
  });
  if (error) throw new Error(`upload ${bucket}/${publicPath}: ${error.message}`);
  return objectPath;
}

const thumbOf = (p: string) => p.replace(/\.webp$/, "-480.webp");

async function upsert(table: string, rows: Record<string, unknown>[], onConflict = "id") {
  if (!rows.length) return;
  const { error } = await db.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`  ${table}: ${rows.length}`);
}

async function seed() {
  if (!existsSync(path.join(root, "public", "placeholders", "hero-01.webp"))) {
    throw new Error("Mancano le immagini: esegui prima npm run placeholders");
  }
  console.log("Carico i contenuti di esempio…");

  await upsert(
    "site_settings",
    [
      {
        singleton: true,
        company_name: settings.company_name,
        legal_address: settings.legal_address,
        vat_number: settings.vat_number,
        rea: settings.rea,
        registry: settings.registry,
        share_capital: settings.share_capital,
        pec: settings.pec,
        email: settings.email,
        phone: settings.phone,
        whatsapp: settings.whatsapp,
        instagram_handle: settings.instagram_handle,
        instagram_url: settings.instagram_url,
        google_reviews_url: settings.google_reviews_url,
        address_venue: settings.address_venue,
        maps_query: settings.maps_query,
        opening_hours_it: settings.opening_hours.it,
        opening_hours_en: settings.opening_hours.en,
        entry_prices_it: settings.entry_prices.it,
        entry_prices_en: settings.entry_prices.en,
        drink_prices_it: settings.drink_prices.it,
        drink_prices_en: settings.drink_prices.en,
        upload_video_max_mb: settings.upload_video_max_mb,
        upload_video_max_seconds: settings.upload_video_max_seconds,
      },
    ],
    "singleton",
  );

  await upsert(
    "content_blocks",
    [
      ...Object.entries(content).map(([k, v]) => ({ key: k, it: v.it, en: v.en })),
      ...timeline.flatMap((st, i) =>
        (["year", "title", "text"] as const).map((f) => ({ key: `story.${i + 1}.${f}`, it: st[f].it, en: st[f].en })),
      ),
    ],
    "key",
  );

  const themeRows = [];
  for (const t of themes) {
    themeRows.push({
      id: stableId(t.id),
      name: t.name,
      accent: t.accent,
      accent_hot: t.accent_hot,
      hero_image_path: await upload("theme-assets", t.hero_image_path),
      starts_at: t.starts_at ?? null,
      ends_at: t.ends_at ?? null,
      is_default: t.is_default,
      force_active: false,
      is_sample: !t.is_default,
    });
  }
  await upsert("themes", themeRows);

  const eventRows = [];
  for (const e of events) {
    eventRows.push({
      id: stableId(e.id),
      slug: e.slug,
      title_it: e.title.it,
      title_en: e.title.en,
      starts_at: e.starts_at,
      ends_at: e.ends_at,
      dress_code_it: e.dress_code.it,
      dress_code_en: e.dress_code.en,
      description_it: e.description.it,
      description_en: e.description.en,
      cover_path: await upload("public-media", e.cover_path),
      entry_it: e.entry.it,
      entry_en: e.entry.en,
      theme_id: e.theme_id ? stableId(e.theme_id) : null,
      members_only: e.members_only,
      published: e.published,
      is_sample: true,
    });
  }
  await upsert("events", eventRows, "slug");

  const showRows = [];
  for (const s of shows) {
    showRows.push({
      id: stableId(s.id),
      title_it: s.title.it,
      title_en: s.title.en,
      description_it: s.description.it,
      description_en: s.description.en,
      schedule_it: s.schedule.it,
      schedule_en: s.schedule.en,
      cover_path: await upload("public-media", s.cover_path),
      sort: s.sort,
      published: s.published,
      is_sample: true,
    });
  }
  await upsert("shows", showRows);

  // Solo immagini: i video di esempio richiedono ffmpeg e arriveranno dall'admin.
  const mediaRows = [];
  for (const m of media.filter((x) => x.kind === "image")) {
    const members = m.placement.includes("members");
    const bucket = members ? "members-media" : "public-media";
    mediaRows.push({
      id: stableId(m.id),
      kind: "image",
      bucket,
      path: await upload(bucket, m.path),
      thumb_path: await upload(bucket, thumbOf(m.path)),
      width: m.width,
      height: m.height,
      event_id: m.event_id ? stableId(m.event_id) : null,
      placement: m.placement,
      visible: m.visible,
      sort: m.sort,
      is_sample: true,
    });
  }
  await upsert("media", mediaRows);

  await upsert(
    "reviews",
    reviews.map((r) => ({
      id: stableId(r.id),
      author_name: r.author_name,
      rating: r.rating,
      text_it: r.text.it,
      text_en: r.text.en,
      source: r.source,
      review_date: r.review_date.slice(0, 10),
      visible: r.visible,
      sort: r.sort,
      is_sample: true,
    })),
  );

  await upsert(
    "job_roles",
    jobRoles.map((j) => ({ id: stableId(j.id), name_it: j.name.it, name_en: j.name.en, active: j.active, sort: j.sort })),
  );

  await upsert(
    "promotions",
    promotions.map((p) => ({
      id: stableId(p.id),
      title_it: p.title.it,
      title_en: p.title.en,
      body_it: p.body.it,
      body_en: p.body.en,
      code: p.code ?? null,
      valid_from: p.valid_from,
      valid_to: p.valid_to,
      audience: p.audience,
      published: p.published,
      is_sample: true,
    })),
  );

  console.log("Fatto.");
}

async function clean() {
  console.log("Cancello i contenuti di esempio…");
  const { data: files, error } = await db.from("media").select("bucket, path, thumb_path, poster_path").eq("is_sample", true);
  if (error) throw error;
  const byBucket = new Map<string, string[]>();
  for (const f of files ?? []) {
    const list = byBucket.get(f.bucket) ?? [];
    list.push(...[f.path, f.thumb_path, f.poster_path].filter(Boolean));
    byBucket.set(f.bucket, list);
  }
  for (const [bucket, list] of byBucket) await db.storage.from(bucket).remove(list);

  for (const table of ["media", "events", "shows", "reviews", "promotions"]) {
    const { error: e, count } = await db.from(table).delete({ count: "exact" }).eq("is_sample", true);
    if (e) throw new Error(`${table}: ${e.message}`);
    console.log(`  ${table}: ${count ?? 0}`);
  }
  // I temi di esempio si cancellano; il Default resta (lo protegge un trigger).
  const { error: te, count: tc } = await db.from("themes").delete({ count: "exact" }).eq("is_sample", true).eq("is_default", false);
  if (te) throw te;
  console.log(`  themes: ${tc ?? 0}`);
  console.log("Fatto. Testi, impostazioni e ruoli restano: si modificano dall'admin.");
}

(process.argv.includes("--clean") ? clean() : seed()).catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
