/**
 * purge-expired: chiamata ogni notte da pg_cron. Cancella candidature (con
 * foto e allegati) e messaggi oltre `delete_after`, e gli iscritti rimasti
 * «pending» da più di 7 giorni. Risponde solo a chi ha CRON_SECRET.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) return new Response("forbidden", { status: 403 });

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const now = new Date().toISOString();
  const report: Record<string, number> = {};

  const { data: apps, error } = await db.from("applications").select("id, photo_paths, cv_path, extra_paths").lt("delete_after", now);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  const files = (apps ?? []).flatMap((a) => [...(a.photo_paths ?? []), a.cv_path, ...(a.extra_paths ?? [])]).filter(Boolean) as string[];
  // Prima i file, poi le righe: se lo Storage non risponde, la riga resta e si riprova domani.
  if (files.length) {
    const { error: e } = await db.storage.from("applications").remove(files);
    if (e) return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
  if (apps?.length) await db.from("applications").delete().in("id", apps.map((a) => a.id));
  report.applications = apps?.length ?? 0;

  const { count: messages } = await db.from("contact_messages").delete({ count: "exact" }).lt("delete_after", now);
  report.contact_messages = messages ?? 0;

  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { count: pending } = await db.from("subscribers").delete({ count: "exact" }).eq("status", "pending").lt("created_at", weekAgo);
  report.pending_subscribers = pending ?? 0;

  console.log(JSON.stringify({ purge: report }));
  return new Response(JSON.stringify(report), { headers: { "Content-Type": "application/json" } });
});
