import { useEffect, useRef } from "react";
import { useLang } from "@/hooks/useLang";

/**
 * Widget Cloudflare Turnstile. Senza VITE_TURNSTILE_SITE_KEY usa la chiave di
 * prova di Cloudflare (passa sempre): il modulo funziona, ma l'anti-spam vero
 * parte solo con le chiavi del sito, insieme a TURNSTILE_SECRET_KEY sul server.
 * Il token vale una volta: dopo un invio fallito il modulo rimonta il widget.
 */
const SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) || "1x00000000000000000000AA";
const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loading: Promise<TurnstileApi> | null = null;
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile")));
    s.onerror = () => {
      loading = null;
      reject(new Error("turnstile"));
    };
    document.head.appendChild(s);
  });
  return loading;
}

export function Turnstile({ onToken }: { onToken: (token: string | null) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const lang = useLang();
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    let id: string | null = null;
    let alive = true;
    void loadTurnstile()
      .then((ts) => {
        if (!alive || !box.current) return;
        id = ts.render(box.current, {
          sitekey: SITE_KEY,
          theme: "dark",
          language: lang,
          callback: (t: string) => cb.current(t),
          "expired-callback": () => cb.current(null),
          "error-callback": () => cb.current(null),
        });
      })
      .catch(() => cb.current(null));
    return () => {
      alive = false;
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, [lang]);

  return <div ref={box} className="min-h-[65px]" />;
}
