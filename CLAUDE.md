# ZOO Sexy Disco — sito web

Locale notturno di lap dance a Madone (BG), gestito da Venera S.r.l.s.
Parte pubblica bilingue IT/EN + pannello admin (in arrivo con Supabase).

## Vincoli non negoziabili

- Frontend: React 18 + Vite + TypeScript (strict), Tailwind CSS, shadcn/ui, React Router, react-i18next, TanStack Query, react-hook-form + Zod, react-helmet-async.
- Backend: solo Supabase. Postgres con RLS su ogni tabella, Auth, Storage, Edge Functions (Deno), pg_cron.
- Video: solo Supabase Storage, bucket privato, riproduzione tramite URL firmati a scadenza. Vietati: Mux, Bunny Stream, Cloudflare Stream, YouTube/Vimeo embed, qualunque servizio di streaming esterno.
- Hosting: solo Cloudflare Pages. Dominio registrato su Misterdomain, nameserver su Cloudflare. Vietati: Vercel, Netlify, Lovable, Firebase.
- Nessun tracciamento di terze parti: niente Google Analytics, Google Tag Manager, pixel Meta, cookie di profilazione. Le statistiche sono in-house (sezione 13).
- Font self-hosted con @fontsource/*. Nessuna chiamata a fonts.googleapis.com.
- Anti-spam dei moduli: Cloudflare Turnstile.
- Nessun documento d'identità raccolto online nel modulo candidature.
- Placeholder visivi senza persone reali e senza contenuti espliciti.
- Pepe Nero è un riferimento di struttura, non una fonte: vietato copiare testi, immagini, logo, nomi di sezioni proprietari o impaginato identico di pepenero.com.
- Mobile-first: si progetta prima a 390px, poi si allarga.
- Tutto bilingue IT/EN, compresi i contenuti inseriti dall'admin.
- Ogni contenuto di esempio ha is_sample = true e un segnale visibile in admin (sezione 14).

## Decisioni prese dopo l'analisi del brief

- Unica eccezione ai video privati: il video decorativo della hero di un tema sta nel bucket pubblico `theme-assets`.
- Il tema di una serata si attiva anche senza date proprie: vale dalle 12:00 del giorno della serata fino alla chiusura (`resolveActiveTheme` in `src/data/themes.ts`, poi `active_theme()` in SQL).
- Limite video predefinito 50 MB (piano gratuito Supabase).
- Ruoli di lavoro con titoli neutri rispetto al genere (Codice pari opportunità, art. 27).
- La fascia recensioni dichiara che è una selezione.
- `X-Frame-Options: SAMEORIGIN` (non DENY) per permettere l'anteprima dei temi in admin.

## Comandi

```bash
npm run dev            # sviluppo su http://localhost:5173
npm run typecheck      # tsc
npm run lint           # eslint
npm run build          # tsc + vite build → dist/
npm run placeholders   # rigenera immagini segnaposto, logo e og-image
```

## Struttura

- `src/data/` dati di esempio con gli stessi campi delle future tabelle Supabase
- `src/services/api.ts` unico punto di accesso ai dati: quando arriva Supabase cambia solo questo file
- `src/components/sections/HeroMark.tsx` la firma grafica: «ZOO» come finestra sulla notte
- Colori solo via token CSS (`src/styles/index.css`), mai hex nei componenti
