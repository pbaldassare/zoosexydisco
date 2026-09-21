# ZOO Sexy Disco

Sito del locale notturno ZOO Sexy Disco, Madone (BG), gestito da Venera S.r.l.s.
React 18 + Vite + TypeScript, Tailwind, i18n IT/EN. Hosting previsto: Cloudflare Pages. Backend previsto: Supabase.

## Stato

**Fatto: struttura e pagine pubbliche, con dati di esempio locali.** Supabase non è ancora collegato.

- Tutte le pagine pubbliche IT/EN della mappa del sito, con il cambio lingua che porta alla pagina equivalente.
- Hero con la firma grafica: la parola «ZOO» fa da finestra sull'immagine del tema attivo. Allo scroll si rimpicciolisce ed entra nella barra.
- Age gate (30 giorni), header con menu mobile a tutto schermo, footer con i dati societari, fascia newsletter, recensioni a scorrimento, pulsante WhatsApp flottante su mobile.
- Serate: stato calcolato (prossima / stasera / archiviata), filtro per tema, archivio, scheda con galleria collegata e WhatsApp precompilato.
- Gallery foto con mosaico, caricamento progressivo e lightbox con swipe. Gallery video con player predisposto per gli URL firmati.
- Protezioni deterrenti: filigrana, niente menu contestuale né trascinamento, sfocatura quando la finestra perde il focus.
- Moduli con validazione Zod: contatti, feste, candidature (blocco sotto i 18 anni, foto ridimensionate nel browser), newsletter. **L'invio è simulato.**
- Area riservata in anteprima, con la filigrana personale.
- Sistema dei temi: token CSS e logica `resolveActiveTheme` pronta per `active_theme()`.
- Generatore di immagini segnaposto astratte (nessuna persona), logo provvisorio convertito in tracciati, og-image.
- `_headers` (CSP e security header), `_redirects` e `robots.txt` per Cloudflare Pages.

**Supabase (progetto «sito zoo», `rpbprmngkkscnhqqayfq`, regione eu-west-3 Parigi):** migrazioni applicate (`supabase/migrations/`), RLS attiva su tutte le tabelle, 5 bucket, contenuti di esempio caricati con `npm run seed`. Il frontend legge dal database con `VITE_DATA_SOURCE=supabase` (in `.env.local`); con `local` torna ai dati di `src/data`.

Avviso noto dell'advisor: `is_member()` è eseguibile da `anon`. È voluto: la valutano le policy di lettura pubblica e restituisce solo lo stato dell'utente corrente.

**Da fare:**

- Edge Functions: sign-media, moduli (contatti, feste, candidature), newsletter, track, purge-expired + pg_cron.
- Pannello admin (`/admin` oggi è un segnaposto) e primo utente admin.
- Widget Turnstile vero, statistiche, sitemap.
- Video di esempio (manca ffmpeg: ci sono solo i poster, e il seed non carica video).
- **Prima del lancio:** sostituire la chiave service_role (condivisa in chat durante lo sviluppo) con una nuova secret key e disattivare le chiavi legacy.

## Comandi

```bash
npm install
npm run dev            # http://localhost:5173
npm run typecheck
npm run lint
npm run build          # output in dist/
npm run placeholders   # rigenera public/placeholders, logo e og-image
npm run seed           # carica i contenuti di esempio su Supabase (serve .env.local)
npm run seed:clean     # cancella tutto ciò che è is_sample
```

## Dove stanno le cose

| Cosa | File |
|---|---|
| Dati di esempio (stessa forma delle tabelle future) | `src/data/*.ts` |
| Accesso ai dati: da sostituire con le query Supabase | `src/services/api.ts` |
| Testi delle pagine (content_blocks) | `src/data/content.ts` |
| Testi dell'interfaccia | `src/i18n/it.ts`, `src/i18n/en.ts` |
| Token colore e tipografia | `src/styles/index.css`, `tailwind.config.ts` |
| Mappa delle rotte IT/EN | `src/lib/routes.ts` |
| Informativa privacy | `content/privacy-it.md`, `content/privacy-en.md` |

## Segnaposto ancora da completare

| Dato | Dove si modifica oggi | Dove si modificherà (admin) |
|---|---|---|
| Logo definitivo (SVG) | `public/brand/logo-placeholder.svg`, `src/components/brand/Logo.tsx` | Impostazioni → logo |
| Telefono e WhatsApp | `src/data/settings.ts` | Impostazioni |
| Handle e URL Instagram (e il QR) | `src/data/settings.ts` | Impostazioni |
| URL delle recensioni Google | `src/data/settings.ts` | Impostazioni |
| Indirizzo del locale, come arrivare, parcheggio | `src/data/settings.ts`, `src/data/content.ts` (`club.directions`) | Impostazioni / Testi |
| Orari di apertura, prezzi d'ingresso e consumazione | `src/data/settings.ts` | Impostazioni |
| Ingresso di ogni serata | `src/data/events.ts` | Eventi |
| Storia del locale (anni e testi delle tappe) | `src/data/catalog.ts` (`timeline`) | Testi |
| «Cosa offriamo» di Lavora con noi | `src/data/content.ts` (`work.offer`) | Testi |
| Cosa distingue ZOO (Spettacoli) | `src/data/content.ts` (`shows.difference`) | Testi |
| Regalo di benvenuto della newsletter | `src/data/content.ts` (`newsletter.gift`) | Testi |
| Condizioni delle promozioni | `src/data/catalog.ts` (`promotions`) | Promozioni |
| Informativa privacy definitiva (non ancora fornita) | `content/privacy-it.md`, poi traduzione in `privacy-en.md` | — |
| Nell'informativa: fornitore email, sviluppatore/manutentore, data | `content/privacy-*.md` | — |
| Provider email e chiave | `.env` (`EMAIL_PROVIDER`, `EMAIL_API_KEY`) | — |
| Chiavi Turnstile | `.env` (`VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`) | — |
| Credenziali Supabase | `.env` | — |
| Foto e video reali al posto dei segnaposto, poi `npm run seed:clean` | `public/placeholders/` | Media / Esempi |
| Recensioni vere al posto delle 6 di esempio | `src/data/catalog.ts` | Recensioni |

## Scelte fatte rispetto al brief

- **Video della hero.** È l'unico video in un bucket pubblico (`theme-assets`). Tutti gli altri restano privati, con URL firmati.
- **Tema della serata.** Una serata collegata a un tema lo attiva dalle 12:00 del giorno stesso fino alla chiusura, anche se il tema non ha date proprie.
- **Limite video.** 50 MB predefiniti, il massimo del piano gratuito Supabase.
- **Video da iPhone.** L'iPhone registra in HEVC di default. Finché non c'è una conversione lato server, va impostato «Formati → Più compatibile».
- **Ruoli di lavoro.** Titoli neutri rispetto al genere (es. «Cameriere / Cameriera»).
- **Recensioni.** La fascia dichiara che è una selezione.
- **Anteprima dei temi.** `X-Frame-Options: SAMEORIGIN`, per poterla mostrare in admin.
- **Serate di esempio.** Carnevale Veneziano cade nel vero sabato di Carnevale, non «nei prossimi sabati». Ci sono anche 3 serate passate, così l'archivio non è vuoto.
