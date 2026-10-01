/**
 * contact-submit: modulo contatti (e, quando servirà, richiesta di festa privata).
 * Verifica Turnstile, controlla i campi, salva in contact_messages con il
 * service role e avvisa l'admin. Nessun accesso anonimo diretto alla tabella.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";
import { adminNotice, sendEmail, siteUrl } from "../_shared/email.ts";
import { clientIp, verifyTurnstile } from "../_shared/turnstile.ts";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s().-]{6,20}$/;
const PARTY = ["celibato", "compleanno", "aziendale", "altro"];
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "method" }, 405);

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return json(req, { error: "body" }, 400);
  }
  if (!(await verifyTurnstile(b.turnstile, clientIp(req)))) return json(req, { error: "turnstile" }, 403);

  const kind = b.kind === "party" ? "party" : "contact";
  const row = {
    kind,
    name: str(b.name, 120),
    email: str(b.email, 200).toLowerCase(),
    phone: str(b.phone, 30) || null,
    message: str(b.message, 4000) || null,
    party_type: kind === "party" && PARTY.includes(b.party_type as string) ? (b.party_type as string) : null,
    party_date: kind === "party" && /^\d{4}-\d{2}-\d{2}$/.test(str(b.party_date, 10)) ? str(b.party_date, 10) : null,
    guests: kind === "party" && Number.isInteger(b.guests) && (b.guests as number) >= 1 && (b.guests as number) <= 500 ? (b.guests as number) : null,
    consent_at: new Date().toISOString(),
  };
  const invalid: string[] = [];
  if (row.name.length < 2) invalid.push("name");
  if (!EMAIL.test(row.email)) invalid.push("email");
  if (row.phone && !PHONE.test(row.phone)) invalid.push("phone");
  if (kind === "contact" && (row.message ?? "").length < 5) invalid.push("message");
  if (b.consent !== true) invalid.push("consent");
  if (invalid.length) return json(req, { error: "invalid", fields: invalid }, 422);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { error } = await db.from("contact_messages").insert(row);
  if (error) {
    console.error(error);
    return json(req, { error: "db" }, 500);
  }

  // L'avviso non deve far fallire l'invio: il messaggio è già salvato.
  try {
    await sendEmail(
      adminNotice(kind === "party" ? `Richiesta di festa da ${row.name}` : `Nuovo messaggio da ${row.name}`, [
        ["Nome", row.name],
        ["Email", row.email],
        ["Telefono", row.phone],
        ["Tipo di festa", row.party_type],
        ["Data", row.party_date],
        ["Ospiti", row.guests ? String(row.guests) : null],
        ["Messaggio", row.message],
      ], `${siteUrl()}/admin/messaggi`),
    );
  } catch (e) {
    console.error("email", e);
  }
  return json(req, { ok: true });
});
