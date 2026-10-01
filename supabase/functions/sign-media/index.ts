/**
 * sign-media: riceve { media_id } e restituisce un URL firmato di 300 secondi.
 * Solo per contenuti visibili; quelli dell'area riservata solo a un iscritto
 * confermato. I bucket privati non hanno altre strade di lettura.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";

const URL_TTL = 300;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "method" }, 405);

  let mediaId: unknown;
  try {
    ({ media_id: mediaId } = await req.json());
  } catch {
    return json(req, { error: "body" }, 400);
  }
  if (typeof mediaId !== "string" || !/^[0-9a-f-]{36}$/i.test(mediaId)) return json(req, { error: "media_id" }, 400);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: media, error } = await admin.from("media").select("bucket, path, visible, placement").eq("id", mediaId).maybeSingle();
  if (error) return json(req, { error: "db" }, 500);
  // Stessa risposta per «non esiste» e «nascosto»: non diciamo cosa c'è.
  if (!media || !media.visible) return json(req, { error: "not_found" }, 404);

  if ((media.placement as string[]).includes("members")) {
    const auth = req.headers.get("authorization") ?? "";
    const asUser = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
      auth: { persistSession: false },
    });
    const { data: member } = await asUser.rpc("is_member");
    if (member !== true) return json(req, { error: "members_only" }, 403);
  }

  const { data: signed, error: signError } = await admin.storage.from(media.bucket).createSignedUrl(media.path, URL_TTL);
  if (signError || !signed) return json(req, { error: "sign" }, 500);
  return json(req, { url: signed.signedUrl, expires_in: URL_TTL });
});
