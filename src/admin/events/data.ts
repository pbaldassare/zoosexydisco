import { adminClient } from "@/lib/supabase";
import { processImage } from "../media/process";
import { removeFiles, uploadSmall } from "../media/upload";

export type EventRow = {
  id: string;
  slug: string;
  title_it: string;
  title_en: string;
  starts_at: string;
  ends_at: string;
  dress_code_it: string;
  dress_code_en: string;
  description_it: string;
  description_en: string;
  cover_path: string | null;
  entry_it: string;
  entry_en: string;
  theme_id: string | null;
  members_only: boolean;
  published: boolean;
  is_sample: boolean;
};

export type ThemeOption = { id: string; name: string; is_default: boolean };

const db = () => adminClient!;

export async function loadEvents(): Promise<EventRow[]> {
  const { data, error } = await db().from("events").select("*").order("starts_at", { ascending: false });
  if (error) throw error;
  return data as EventRow[];
}

export async function loadThemes(): Promise<ThemeOption[]> {
  const { data, error } = await db().from("themes").select("id, name, is_default").order("name");
  if (error) throw error;
  return (data as ThemeOption[]).filter((t) => !t.is_default);
}

/** Quante foto e video sono collegati a ogni serata. */
export async function loadMediaCounts(): Promise<Record<string, number>> {
  const { data } = await db().from("media").select("event_id").not("event_id", "is", null);
  const out: Record<string, number> = {};
  for (const r of data ?? []) out[r.event_id as string] = (out[r.event_id as string] ?? 0) + 1;
  return out;
}

export const coverUrl = (path: string | null) => (path ? (path.startsWith("/") ? path : db().storage.from("public-media").getPublicUrl(path).data.publicUrl) : "");

/** Copertina: stessa lavorazione delle foto (1600px WebP, niente metadati). */
export async function uploadCover(file: File) {
  const img = await processImage(file);
  const path = `${crypto.randomUUID()}.webp`;
  await uploadSmall("public-media", path, img.large);
  return path;
}

/** «Halloween al ZOO!» del 31/10/2026 → «halloween-al-zoo-2026-10-31». */
export function makeSlug(title: string, date: string) {
  const base = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return [base || "serata", date].filter(Boolean).join("-");
}

export async function saveEvent(id: string | null, row: Omit<EventRow, "id" | "is_sample">) {
  const payload = { ...row, updated_at: new Date().toISOString() };
  const q = id ? db().from("events").update(payload).eq("id", id).select("id").single() : db().from("events").insert(payload).select("id").single();
  const { data, error } = await q;
  if (error) {
    if (error.code === "23505") throw new Error("Esiste già una serata con questo indirizzo: cambialo.");
    throw new Error(`Salvataggio non riuscito: ${error.message}`);
  }
  return data.id as string;
}

/** Cancella la serata; la copertina solo se nessun'altra serata la usa (i duplicati la condividono). */
export async function deleteEvent(row: EventRow) {
  const { error } = await db().from("events").delete().eq("id", row.id);
  if (error) throw error;
  if (row.cover_path && !row.cover_path.startsWith("/")) {
    const { count } = await db().from("events").select("id", { count: "exact", head: true }).eq("cover_path", row.cover_path);
    if (!count) await removeFiles("public-media", [row.cover_path]);
  }
}
