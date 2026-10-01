import { adminClient } from "@/lib/supabase";
import { deleteMedia, type MediaRow } from "../media/data";
import { removeFiles } from "../media/upload";

const db = () => adminClient!;

export const SAMPLES_KEY = ["admin", "samples"];

/** Le tabelle con contenuti di esempio, con il nome che legge l'admin. */
export const SAMPLE_TABLES = [
  { table: "media", label: "Foto e video" },
  { table: "events", label: "Serate" },
  { table: "themes", label: "Temi (il Default resta)" },
  { table: "reviews", label: "Recensioni" },
  { table: "promotions", label: "Promozioni" },
  { table: "shows", label: "Spettacoli" },
] as const;

export async function countSamples(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const { table } of SAMPLE_TABLES) {
    let q = db().from(table).select("id", { count: "exact", head: true }).eq("is_sample", true);
    if (table === "themes") q = q.eq("is_default", false);
    const { count } = await q;
    out[table] = count ?? 0;
  }
  return out;
}

/** Toglie righe e file di esempio. Prima ciò che dipende da altro: media, poi serate, poi temi. */
export async function removeSamples() {
  const { data: media } = await db().from("media").select("*").eq("is_sample", true);
  if (media?.length) await deleteMedia(media as MediaRow[]);

  const { data: events } = await db().from("events").select("cover_path").eq("is_sample", true);
  const { error: e1 } = await db().from("events").delete().eq("is_sample", true);
  if (e1) throw e1;
  // Copertine non più usate da nessuna serata.
  for (const path of new Set((events ?? []).map((e) => e.cover_path as string | null).filter(Boolean))) {
    const { count } = await db().from("events").select("id", { count: "exact", head: true }).eq("cover_path", path!);
    if (!count) await removeFiles("public-media", [path]);
  }

  const { data: themes } = await db().from("themes").select("hero_image_path, hero_video_path").eq("is_sample", true).eq("is_default", false);
  const { error: e2 } = await db().from("themes").delete().eq("is_sample", true).eq("is_default", false);
  if (e2) throw e2;
  for (const t of themes ?? []) await removeFiles("theme-assets", [t.hero_image_path as string | null, t.hero_video_path as string | null]);

  const { data: promos } = await db().from("promotions").select("image_path").eq("is_sample", true);
  for (const table of ["reviews", "promotions", "shows"]) {
    const { error } = await db().from(table).delete().eq("is_sample", true);
    if (error) throw error;
  }
  await removeFiles("public-media", (promos ?? []).map((p) => p.image_path as string | null));
}
