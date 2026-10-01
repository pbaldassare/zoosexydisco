import type { QueryClient } from "@tanstack/react-query";
import { adminClient } from "@/lib/supabase";
import { removeFiles } from "../media/upload";

export type ThemeRow = {
  id: string;
  name: string;
  accent: string;
  accent_hot: string;
  hero_image_path: string | null;
  hero_video_path: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_default: boolean;
  force_active: boolean;
  is_sample: boolean;
};

const db = () => adminClient!;

export async function loadThemes(): Promise<ThemeRow[]> {
  const { data, error } = await db().from("themes").select("*").order("is_default", { ascending: false }).order("name");
  if (error) throw error;
  return data as ThemeRow[];
}

/** Quale tema vede adesso un visitatore: stessa funzione che usa il sito. */
export async function loadActiveId(): Promise<string | null> {
  const { data } = await db().rpc("active_theme");
  return ((data as ThemeRow[] | null)?.[0]?.id as string) ?? null;
}

/** Serate che usano ogni tema, per dire all'admin quando si accende da solo. */
export async function loadThemeEvents(): Promise<Record<string, { title: string; starts_at: string }[]>> {
  const { data } = await db().from("events").select("theme_id, title_it, starts_at").eq("published", true).not("theme_id", "is", null).gt("ends_at", new Date().toISOString()).order("starts_at");
  const out: Record<string, { title: string; starts_at: string }[]> = {};
  for (const e of data ?? []) (out[e.theme_id as string] ??= []).push({ title: e.title_it as string, starts_at: e.starts_at as string });
  return out;
}

export const assetUrl = (path: string | null) => (path ? db().storage.from("theme-assets").getPublicUrl(path).data.publicUrl : "");

export async function saveTheme(id: string | null, row: Partial<ThemeRow>) {
  const payload = { ...row, updated_at: new Date().toISOString() };
  const q = id ? db().from("themes").update(payload).eq("id", id).select("id").single() : db().from("themes").insert(payload).select("id").single();
  const { data, error } = await q;
  if (error) {
    if (error.code === "23505") throw new Error("Esiste già un tema con questo nome.");
    throw new Error(`Salvataggio non riuscito: ${error.message}`);
  }
  return data.id as string;
}

/** «Attiva adesso»: un solo tema forzato alla volta, quindi prima si spengono gli altri. */
export async function forceTheme(id: string | null) {
  const { error } = await db().from("themes").update({ force_active: false }).eq("force_active", true);
  if (error) throw error;
  if (id) {
    const { error: e2 } = await db().from("themes").update({ force_active: true }).eq("id", id);
    if (e2) throw e2;
  }
}

export async function deleteTheme(t: ThemeRow) {
  const { error } = await db().from("themes").delete().eq("id", t.id);
  if (error) throw error;
  await removeFiles("theme-assets", [t.hero_video_path, t.hero_image_path]);
}

export function invalidateThemes(qc: QueryClient) {
  return Promise.all(
    [["admin", "themes"], ["admin", "theme-active"], ["admin", "themes-options"], ["active-theme"]].map((k) => qc.invalidateQueries({ queryKey: k })),
  );
}
