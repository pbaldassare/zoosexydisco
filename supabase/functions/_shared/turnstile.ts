/**
 * Verifica Cloudflare Turnstile sul server. Senza TURNSTILE_SECRET_KEY usa la
 * chiave di prova di Cloudflare, che accetta solo i token della chiave di prova
 * del sito: finché non si configurano le chiavi vere, il modulo funziona ma
 * l'anti-spam non protegge davvero.
 */
const TEST_SECRET = "1x0000000000000000000000000000000AA";

export async function verifyTurnstile(token: unknown, ip: string | null): Promise<boolean> {
  if (typeof token !== "string" || !token) return false;
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY") || TEST_SECRET;
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const j = await r.json();
    return j.success === true;
  } catch {
    return false;
  }
}

/** IP del visitatore solo per Turnstile: non si salva da nessuna parte. */
export const clientIp = (req: Request) => req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
