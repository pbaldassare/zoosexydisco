/**
 * Statistiche in-house (brief §13): pagine viste e tocchi su WhatsApp e telefono.
 * Nessun cookie, nessun identificativo: la sola cosa che il browser ricorda è
 * «questa scheda ha già contato la sua visita», in sessionStorage, che sparisce
 * chiudendo la scheda. Conta solo sul sito pubblicato, mai in sviluppo.
 */
const URL_BASE = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ENDPOINT = URL_BASE ? `${URL_BASE}/functions/v1/track` : null;
const ENABLED = import.meta.env.PROD && !!ENDPOINT;
const VISIT_KEY = "zoo.visit";

function send(body: Record<string, unknown>) {
  if (!ENABLED) return;
  // text/plain: niente richiesta preliminare CORS; sendBeacon sopravvive anche al cambio pagina.
  const blob = new Blob([JSON.stringify(body)], { type: "text/plain" });
  if (navigator.sendBeacon?.(ENDPOINT!, blob)) return;
  void fetch(ENDPOINT!, { method: "POST", body: blob, keepalive: true }).catch(() => {});
}

/** La prima pagina della scheda è una visita; le altre sono pagine viste. */
function firstInTab() {
  try {
    if (sessionStorage.getItem(VISIT_KEY)) return false;
    sessionStorage.setItem(VISIT_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

export function trackPage(path: string, lang: string) {
  const entry = firstInTab();
  send({ type: "pageview", path, lang, entry, referrer: entry ? document.referrer : "" });
}

/** Un ascoltatore unico: ogni link WhatsApp o telefono del sito, senza toccare i componenti. */
export function trackContactClicks() {
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest?.("a[href]");
    const href = a?.getAttribute("href") ?? "";
    const type = href.startsWith("https://wa.me/") ? "whatsapp_click" : href.startsWith("tel:") ? "phone_click" : null;
    if (type) send({ type, path: window.location.pathname });
  };
  document.addEventListener("click", onClick, { capture: true });
  return () => document.removeEventListener("click", onClick, { capture: true });
}
