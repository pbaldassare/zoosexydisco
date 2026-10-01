/** Origini che possono chiamare le funzioni dal browser. */
const ALLOWED = [
  "https://www.zoosexydisco.it",
  "https://zoosexydisco.it",
  "https://zoosexydisco.pages.dev",
  "http://localhost:5173",
  "http://31.220.82.50:5173",
];

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  // Le anteprime di Cloudflare Pages hanno un sottodominio per ogni deploy.
  const ok = ALLOWED.includes(origin) || /^https:\/\/[a-z0-9-]+\.zoosexydisco\.pages\.dev$/.test(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : ALLOWED[0]!,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(req), "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
