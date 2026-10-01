/**
 * application-submit: candidature di «Lavora con noi».
 * Verifica Turnstile, età ≥ 18 (anche se il controllo nel browser viene
 * aggirato), ruolo esistente, tipo reale e peso dei file; salva i file nel
 * bucket privato `applications` come <uuid>.<ext> e la riga in tabella.
 * Nessun documento d'identità: solo foto, CV e allegati in PDF.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";
import { adminNotice, sendEmail, siteUrl } from "../_shared/email.ts";
import { clientIp, verifyTurnstile } from "../_shared/turnstile.ts";

const MB = 1024 * 1024;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s().-]{6,20}$/;

/** Il tipo si legge dai primi byte, non dal nome o dal tipo dichiarato. */
function sniff(b: Uint8Array): { ext: string; mime: string } | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...b.slice(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { ext: "webp", mime: "image/webp" };
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (b[0] === 0x89 && ascii(1, 4) === "PNG") return { ext: "png", mime: "image/png" };
  if (ascii(0, 5) === "%PDF-") return { ext: "pdf", mime: "application/pdf" };
  return null;
}

/** Età compiuta oggi, a Roma. */
function age(birth: string) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());
  const [ty, tm, td] = today.split("-").map(Number) as [number, number, number];
  const [by, bm, bd] = birth.split("-").map(Number) as [number, number, number];
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
}

const field = (f: FormData, k: string, max: number) => {
  const v = f.get(k);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "method" }, 405);

  let f: FormData;
  try {
    f = await req.formData();
  } catch {
    return json(req, { error: "body" }, 400);
  }
  if (!(await verifyTurnstile(f.get("turnstile"), clientIp(req)))) return json(req, { error: "turnstile" }, 403);

  const birth = field(f, "birth_date", 10);
  const v = {
    first_name: field(f, "first_name", 80),
    last_name: field(f, "last_name", 80),
    birth_date: birth,
    city: field(f, "city", 120) || null,
    phone: field(f, "phone", 30),
    email: field(f, "email", 200).toLowerCase(),
    role_id: field(f, "role_id", 36),
    experience: field(f, "experience", 4000) || null,
    notes: field(f, "notes", 4000) || null,
  };
  let days: string[] = [];
  try {
    const parsed = JSON.parse(field(f, "days", 200) || "[]");
    if (Array.isArray(parsed)) days = parsed.filter((d) => typeof d === "string" && /^[1-7]$/.test(d));
  } catch { /* giorni non validi: si ignorano */ }
  const travel = field(f, "travel", 3);

  const invalid: string[] = [];
  if (v.first_name.length < 2) invalid.push("first_name");
  if (v.last_name.length < 2) invalid.push("last_name");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth) || Number.isNaN(Date.parse(birth))) invalid.push("birth_date");
  else if (age(birth) < 18) return json(req, { error: "underage" }, 422);
  if (!PHONE.test(v.phone)) invalid.push("phone");
  if (!EMAIL.test(v.email)) invalid.push("email");
  if (field(f, "consent", 5) !== "true") invalid.push("consent");

  const photos = f.getAll("photos").filter((x): x is File => x instanceof File);
  const cv = f.get("cv");
  const extra = f.getAll("extra").filter((x): x is File => x instanceof File);
  if (photos.length < 1 || photos.length > 3) invalid.push("photos");
  if (extra.length > 2) invalid.push("extra");
  if (invalid.length) return json(req, { error: "invalid", fields: invalid }, 422);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const { data: role } = await db.from("job_roles").select("id, name_it").eq("id", v.role_id).eq("active", true).maybeSingle();
  if (!role) return json(req, { error: "invalid", fields: ["role_id"] }, 422);

  // Controllo dei file prima di caricarne anche uno solo.
  type Ready = { bytes: Uint8Array; ext: string; mime: string };
  async function check(file: File, kind: "image" | "pdf", maxMb: number): Promise<Ready | null> {
    if (file.size > maxMb * MB) return null;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const t = sniff(bytes);
    if (!t || (kind === "pdf") !== (t.ext === "pdf")) return null;
    return { bytes, ...t };
  }
  const readyPhotos = await Promise.all(photos.map((p) => check(p, "image", 8)));
  const readyCv = cv instanceof File && cv.size ? await check(cv, "pdf", 5) : undefined;
  const readyExtra = await Promise.all(extra.map((p) => check(p, "pdf", 5)));
  const badFiles = [
    ...(readyPhotos.some((x) => !x) ? ["photos"] : []),
    ...(readyCv === null ? ["cv"] : []),
    ...(readyExtra.some((x) => !x) ? ["extra"] : []),
  ];
  if (badFiles.length) return json(req, { error: "files", fields: badFiles }, 422);

  const uploaded: string[] = [];
  async function put(r: Ready) {
    const path = `${crypto.randomUUID()}.${r.ext}`;
    const { error } = await db.storage.from("applications").upload(path, r.bytes, { contentType: r.mime });
    if (error) throw error;
    uploaded.push(path);
    return path;
  }
  try {
    const photo_paths = [];
    for (const p of readyPhotos) photo_paths.push(await put(p!));
    const cv_path = readyCv ? await put(readyCv) : null;
    const extra_paths = [];
    for (const p of readyExtra) extra_paths.push(await put(p!));

    const { error } = await db.from("applications").insert({
      ...v,
      availability: { days, period: field(f, "period", 200) || null, travel: travel === "yes" ? true : travel === "no" ? false : null },
      photo_paths,
      cv_path,
      extra_paths,
      consent_at: new Date().toISOString(),
    });
    if (error) throw error;
  } catch (e) {
    console.error(e);
    if (uploaded.length) await db.storage.from("applications").remove(uploaded);
    return json(req, { error: "db" }, 500);
  }

  try {
    await sendEmail(
      adminNotice(`Nuova candidatura: ${v.first_name} ${v.last_name}`, [
        ["Ruolo", role.name_it as string],
        ["Città", v.city],
        ["Telefono", v.phone],
        ["Email", v.email],
        ["Foto", String(photos.length)],
        ["CV", readyCv ? "sì" : "no"],
      ], `${siteUrl()}/admin/candidature`),
    );
  } catch (e) {
    console.error("email", e);
  }
  return json(req, { ok: true });
});
