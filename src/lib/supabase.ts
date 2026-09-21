import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Fonte dei dati: "supabase" solo se richiesto esplicitamente e configurato.
 * Con VITE_DATA_SOURCE=local (o senza variabili) il sito usa i dati di src/data.
 */
export const DATA_SOURCE: "local" | "supabase" = import.meta.env.VITE_DATA_SOURCE === "supabase" && url && key ? "supabase" : "local";

export const supabase: SupabaseClient | null = DATA_SOURCE === "supabase" ? createClient(url!, key!) : null;

/** URL pubblico di un file in un bucket pubblico; i path già assoluti passano invariati. */
export function publicUrl(bucket: string, path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}
