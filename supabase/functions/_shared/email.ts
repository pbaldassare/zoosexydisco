/**
 * Invio email con un'unica interfaccia. EMAIL_PROVIDER sceglie l'implementazione:
 *   log (predefinito): scrive nel registro della funzione, non manda niente.
 * Il provider reale non è ancora stato scelto (brief §9): quando lo sarà, si
 * aggiunge qui un ramo con la sua chiave EMAIL_API_KEY, senza toccare le funzioni.
 */
export type Email = { to: string; subject: string; html: string; text: string };

export async function sendEmail(mail: Email): Promise<void> {
  const provider = Deno.env.get("EMAIL_PROVIDER") ?? "log";
  switch (provider) {
    case "log":
    default:
      console.log(JSON.stringify({ email: { to: mail.to, subject: mail.subject, text: mail.text } }));
  }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Avviso all'admin: righe «etichetta: valore», niente dati sensibili oltre a quelli del modulo. */
export function adminNotice(title: string, rows: [string, string | null | undefined][], link: string): Email {
  const filled = rows.filter(([, v]) => v);
  const text = `${title}\n\n${filled.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nApri il pannello: ${link}`;
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#111">
<p style="font-size:18px;font-weight:700">${esc(title)}</p>
<table style="border-collapse:collapse">${filled.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">${esc(k)}</td><td style="padding:4px 0">${esc(v!).replace(/\n/g, "<br>")}</td></tr>`).join("")}</table>
<p style="margin-top:20px"><a href="${esc(link)}" style="background:#E939D7;color:#12040F;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:700">Apri il pannello</a></p>
</div>`;
  return { to: Deno.env.get("ADMIN_NOTIFY_EMAIL") ?? "info@zoosexydisco.it", subject: title, html, text };
}

export const siteUrl = () => Deno.env.get("SITE_URL") ?? "https://www.zoosexydisco.it";
