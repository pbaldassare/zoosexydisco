/**
 * track: statistiche in-house (brief §13). Riceve { path, lang, referrer, type, entry }
 * e scrive in page_views o site_events. Del referrer tiene solo il dominio, del
 * browser solo il tipo di dispositivo. Non salva IP né user agent, ignora i bot.
 * Si chiama senza JWT (sendBeacon non manda intestazioni): verify_jwt è spento.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const BOTS = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|preview|headless|lighthouse|pingdom|uptime|curl|wget|python|axios|node-fetch/i;
const EVENTS = ["whatsapp_click", "phone_click", "table_booking_click", "newsletter_signup", "application_sent", "party_request"];
const OWN = /(^|\.)zoosexydisco\.(it|pages\.dev)$/;

function device(ua: string) {
  if (/ipad|tablet|kindle|silk|playbook|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android/i.test(ua)) return "mobile";
  return "desktop";
}

function host(referrer: unknown) {
  if (typeof referrer !== "string" || !referrer) return null;
  try {
    const h = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
    // La navigazione interna non è una provenienza.
    return OWN.test(h) || h === "localhost" ? null : h.slice(0, 100);
  } catch {
    return null;
  }
}

const romeDay = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());
const done = (req: Request) => new Response(null, { status: 204, headers: corsHeaders(req) });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return done(req);
  const ua = req.headers.get("user-agent") ?? "";
  // Ai bot si risponde come a tutti, ma non si scrive niente.
  if (!ua || BOTS.test(ua)) return done(req);

  let b: Record<string, unknown>;
  try {
    b = JSON.parse(await req.text());
  } catch {
    return done(req);
  }
  const path = typeof b.path === "string" && b.path.startsWith("/") ? b.path.split(/[?#]/)[0]!.slice(0, 200) : null;
  if (!path || path.startsWith("/admin")) return done(req);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const day = romeDay();
  if (typeof b.type === "string" && b.type !== "pageview") {
    if (EVENTS.includes(b.type)) await db.from("site_events").insert({ day, type: b.type, path });
  } else {
    await db.from("page_views").insert({
      day,
      path,
      lang: b.lang === "en" ? "en" : "it",
      referrer_host: b.entry === true ? host(b.referrer) : null,
      device: device(ua),
      entry: b.entry === true,
    });
  }
  return done(req);
});
