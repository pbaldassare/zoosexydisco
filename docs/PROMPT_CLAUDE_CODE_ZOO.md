# Sito ZOO Sexy Disco — istruzioni di build per Claude Code

> **Aggiornamento grafica (22/09/2026):** la direzione visiva è stata decisa. `DESIGN.md` e `PRODUCT.md` alla radice del repo **sostituiscono la sezione 3** qui sotto (palette oro/Bodoni superata): usa quei due file come fonte di verità per colori, font, componenti e tono, e `design/zoo-home.html` come riferimento della home. Contatti: Diana 347 587 2376 e Alessia 333 894 2087, entrambi su WhatsApp. Orari: gio 22–02, ven e sab 22–03:30.

Costruisci il sito completo di **ZOO Sexy Disco**, locale notturno di lap dance a Madone (BG), gestito da Venera S.r.l.s. Il sito ha una parte pubblica bilingue (IT/EN) e un pannello admin da cui il proprietario gestisce da solo foto, video, eventi, temi grafici, promozioni, newsletter, candidature e testi.

Il repository esiste già. Leggi questo documento per intero prima di scrivere codice.

---

## 0. Come lavorare

1. **Ispeziona il repo prima di tutto.** Leggi `package.json`, la struttura delle cartelle, eventuali `supabase/`, `.env*`, `README`, `CLAUDE.md`. Riportami in 5-10 righe cosa trovi.
   - Se è vuoto o è già un progetto React + Vite: procedi e adatta.
   - Se contiene un altro framework o codice di un altro progetto: **fermati e chiedimi** prima di toccare qualsiasi cosa.
2. **Crea o aggiorna `CLAUDE.md`** alla radice con la sezione 1 di questo documento («Vincoli non negoziabili») copiata parola per parola, più i comandi di build/test del progetto.
3. **Skill da usare, se installate:**
   - `ui-ux-pro-max` → direzione visiva, regole UX, pattern mobile
   - `ui-ux-pro-max:design-system` → token e sistema dei temi (sezione 3)
   - `ui-ux-pro-max:ui-styling` → componenti shadcn/ui + Tailwind, pannello admin
   - `dataviz` → dashboard statistiche dell'admin
   - skill Supabase (`npx skills add supabase/agent-skills`) → schema, RLS, Edge Functions
4. **Procedi per fasi (sezione 18), in ordine.** Alla fine di ogni fase: `typecheck`, `lint`, `build`, poi commit con messaggio `fase N: <titolo>`, poi un riepilogo di 5 righe. Poi prosegui con la fase successiva.
5. **Fermati e chiedi solo se:** mancano credenziali Supabase, un comando è distruttivo su dati esistenti, o il repo contiene codice che non riconosci.
6. **Ogni dato mancante** (telefono, orari, prezzi, handle Instagram, logo…) diventa un segnaposto modificabile dal pannello admin, mai un valore inventato presentato come vero. Elencali tutti nel `README` finale (sezione 19).

---

## 1. Vincoli non negoziabili

- **Frontend:** React 18 + Vite + TypeScript (strict), Tailwind CSS, shadcn/ui, React Router, react-i18next, TanStack Query, react-hook-form + Zod, react-helmet-async.
- **Backend: solo Supabase.** Postgres con RLS su ogni tabella, Auth, Storage, Edge Functions (Deno), pg_cron.
- **Video: solo Supabase Storage**, bucket privato, riproduzione tramite URL firmati a scadenza. **Vietati:** Mux, Bunny Stream, Cloudflare Stream, YouTube/Vimeo embed, qualunque servizio di streaming esterno.
- **Hosting: solo Cloudflare Pages.** Dominio registrato su Misterdomain, nameserver su Cloudflare. **Vietati:** Vercel, Netlify, Lovable, Firebase.
- **Nessun tracciamento di terze parti:** niente Google Analytics, Google Tag Manager, pixel Meta, cookie di profilazione. Le statistiche sono in-house (sezione 13).
- **Font self-hosted** con `@fontsource/*`. Nessuna chiamata a fonts.googleapis.com.
- **Anti-spam dei moduli:** Cloudflare Turnstile.
- **Nessun documento d'identità raccolto online** nel modulo candidature.
- **Placeholder visivi senza persone reali** e senza contenuti espliciti.
- **Pepe Nero è un riferimento di struttura, non una fonte:** vietato copiare testi, immagini, logo, nomi di sezioni proprietari o impaginato identico di pepenero.com.
- **Mobile-first:** si progetta prima a 390px, poi si allarga.
- **Tutto bilingue IT/EN**, compresi i contenuti inseriti dall'admin.
- **Ogni contenuto di esempio** ha `is_sample = true` e un segnale visibile in admin (sezione 14).

---

## 2. Riferimento: struttura di pepenero.com/night-club-milano

Cosa prendere dalla traccia (struttura e ritmo):

| Elemento Pepe Nero | Come diventa su ZOO |
| --- | --- |
| Logo bianco a sinistra, menu orizzontale, CTA «Scopri gli eventi» | Logo a sinistra, menu a destra, CTA «Prossima serata» |
| Hero a tutta larghezza con headline di posizionamento | Hero con video/immagine del tema attivo, una frase sola |
| Blocco benvenuto testo + immagine, con ingresso e prezzi | Blocco «Il locale» con ingresso, prezzi e orari presi dalle impostazioni |
| Barra di link rapidi a tag (Club, Show, Compleanni…) | Barra di link rapidi a tag verso le sezioni ZOO |
| Carosello recensioni | Fascia recensioni a scorrimento in fondo a ogni pagina |
| Sezione storia e ambienti | Storia dalla fine anni '90, raccontata per tappe |
| Iscrizione newsletter VIP (nome + email) | Newsletter con regalo di benvenuto e area riservata |
| Pagine occasioni: addio al celibato, compleanni | Pagina **Feste private** (celibato, compleanni, aziendali) |
| Pagina lavoro nel menu | **Lavora con noi**, con questionario |
| Footer: telefono, email, orari, social, privacy, indirizzo | Footer con dati societari obbligatori (sezione 6.7) |

Cosa **non** prendere: la palette bianco e oro con cornici barocche, il banner cookie con profilazione, i testi. Se hai accesso al web puoi aprire la pagina per capire il ritmo delle sezioni, ma non scaricare né riusare nessuna risorsa.

---

## 3. Identità visiva

Direzione: **club notturno di lusso, scuro, discreto.** Poca pelle, molta atmosfera. Il sito vende la serata, non il corpo.

### 3.1 Token (tema Default)

Tutti i colori passano da variabili CSS: nessun colore scritto a mano nei componenti. Serve per il sistema dei temi (3.3).

| Token | Valore | Uso |
| --- | --- | --- |
| `--bg` | `#0A0809` | Fondo pagina |
| `--surface` | `#151012` | Card, menu, pannelli |
| `--surface-2` | `#1F171A` | Hover, input |
| `--line` | `#2E2226` | Bordi e divisori |
| `--ink` | `#F4EDE6` | Testo principale (avorio caldo) |
| `--ink-dim` | `#B3A69F` | Testo secondario |
| `--accent` | `#C8A45D` | Oro champagne: CTA, dettagli, link |
| `--accent-hot` | `#E6246B` | Magenta: solo per «Stasera», badge live, 18+ |
| `--danger` | `#E5484D` | Errori |
| `--ok` | `#3FB68B` | Conferme |

Contrasto AA verificato su `--bg` e `--surface` per `--ink`, `--ink-dim` e `--accent`.

### 3.2 Tipografia

- **Titoli:** Bodoni Moda (700, e 700 italic per le parole di accento). Grande, stretto, con parsimonia.
- **Testo:** Karla (400/500/700).
- **Etichette, date, prezzi, menu:** Syne (600/700), maiuscolo, `letter-spacing: .12em`.
- Scala: 12 / 14 / 16 / 20 / 28 / 40 / 64 / 96 px. Righe di testo lunghe al massimo circa 65 caratteri.

### 3.3 Sistema dei temi

Tabella `themes` (sezione 7). Il tema attivo si decide così:

1. se esiste un tema con `force_active = true` → quello;
2. altrimenti il tema con `starts_at <= now() < ends_at` e `starts_at` più recente;
3. altrimenti il tema `is_default`.

Esponi una funzione SQL `active_theme()`. Il frontend la legge all'avvio (cache 5 minuti) e applica sul `<html>`: `--accent`, `--accent-hot`, immagine e/o video di sfondo della hero, variante del logo. Il tema Default non si può cancellare: impediscilo con un trigger.

### 3.4 Logo

Il logo definitivo arriverà dal cliente. Fino ad allora crea `public/brand/logo-placeholder.svg`: la scritta «ZOO» in Bodoni Moda 700 con «SEXY DISCO» in Syne sotto, spaziato, color `--ink`. Il logo è un campo delle impostazioni: l'admin lo sostituisce caricando un file SVG o PNG.

Comportamento: in home al primo caricamento è **grande e centrato** sopra la hero; allo scroll si riduce e scivola nella barra fissa **a sinistra**. In tutte le altre pagine sta a sinistra.

### 3.5 Movimento

- Un solo momento orchestrato: l'entrata della hero (logo, frase, CTA in sequenza, 900ms totali).
- Hover discreti su card e voci di menu. Nessuna animazione allo scroll che nasconda contenuti fino al trigger.
- `prefers-reduced-motion`: niente video in autoplay (si mostra il poster), niente transizioni.

---

## 4. Routing e mappa del sito

Prefisso lingua obbligatorio. `/` reindirizza a `/it` o `/en` in base alla lingua del browser; la scelta dell'utente viene salvata e vince.

| IT | EN | Pagina |
| --- | --- | --- |
| `/it` | `/en` | Home |
| `/it/il-locale` | `/en/the-club` | Il locale e la storia |
| `/it/eventi` | `/en/events` | Serate a tema: prossime + archivio |
| `/it/eventi/:slug` | `/en/events/:slug` | Scheda serata |
| `/it/spettacoli` | `/en/shows` | Spettacoli |
| `/it/feste-private` | `/en/private-parties` | Celibato, compleanni, aziendali |
| `/it/gallery/foto` | `/en/gallery/photos` | Galleria foto |
| `/it/gallery/video` | `/en/gallery/videos` | Galleria video |
| `/it/lavora-con-noi` | `/en/work-with-us` | Recruiting |
| `/it/contatti` | `/en/contacts` | Contatti |
| `/it/newsletter` | `/en/newsletter` | Iscrizione |
| `/it/newsletter/conferma` | `/en/newsletter/confirm` | Esito del doppio opt-in |
| `/it/area-riservata` | `/en/members` | Area iscritti (login con link via email) |
| `/it/privacy` | `/en/privacy` | Informativa privacy e cookie |
| `/admin/*` | — | Pannello admin, solo italiano |

Lo slug di un evento è unico, uguale nelle due lingue. Il selettore di lingua porta alla **pagina equivalente** nell'altra lingua, non alla home.

**Menu principale** (in quest'ordine): Il locale · Eventi · Spettacoli · Feste private · Gallery (Foto / Video) · Lavora con noi · Contatti.
Newsletter e Instagram stanno nel footer e nella fascia newsletter, non nel menu.

---

## 5. Pagine

I testi vengono da `content_blocks` (chiave + IT + EN) e sono modificabili dall'admin. Nel seed metti bozze vere per le frasi di struttura e segnaposto espliciti `[da completare]` per i fatti che non conosciamo.

### 5.1 Home
1. **Hero**: immagine o video di sfondo del tema attivo, logo grande centrato, frase: IT «Dalla fine degli anni '90, la notte ha un indirizzo.» / EN «Since the late '90s, the night has an address.» CTA primaria «Prossima serata» → scheda del prossimo evento; secondaria «Prenota un tavolo» → WhatsApp precompilato.
2. **Barra link rapidi** a tag: Il locale · Serate a tema · Spettacoli · Feste private · Gallery · Lavora con noi.
3. **Prossima serata** in evidenza: copertina, data, titolo, dress code, pulsante. Se l'evento è oggi, badge «Stasera» in `--accent-hot`.
4. **Il locale in breve**: testo + immagine, con ingresso, prezzi e orari presi da `site_settings`.
5. **Tre scatti** dalla gallery (flag `placement` contiene `home`).
6. **La storia**: estratto di 2 righe + link a Il locale.
7. **Regole della casa**, in una riga con icone: 18+ · vietato foto e video in sala · riservatezza garantita.
8. **Fascia newsletter** (componente globale).
9. **Recensioni** (componente globale).

### 5.2 Il locale
- Descrizione degli ambienti (sala, privé, tavoli) con 3-4 immagini.
- **La storia** come timeline verticale di tappe (anno + titolo + testo). Nel seed: 4 tappe con anni e testi `[da completare con il proprietario]`. Attenzione: è la storia del **locale**, non della società (Venera è stata costituita nel 2022).
- **Regole della casa**, per esteso. Il divieto di foto e video si scrive come garanzia per il cliente: IT «Qui dentro nessuno ti fotografa. Per questo foto e video in sala sono vietati a tutti.»
- Ingresso, prezzi, orari, come arrivare.

### 5.3 Eventi
- Griglia delle prossime serate ordinate per data, poi sezione **Archivio** con le passate (paginata).
- Stato calcolato: `prossima` / `stasera` / `archiviata`, mai salvato a mano.
- Filtro per tema.

### 5.4 Scheda serata `/eventi/:slug`
Copertina, titolo, data e orario, **dress code delle ragazze**, descrizione, ingresso e consumazione, pulsante «Prenota un tavolo» (WhatsApp con testo precompilato: `Ciao, vorrei prenotare un tavolo per <titolo> del <data>. Siamo in __ persone.`). Sotto, la **galleria della serata**: foto e video con `event_id` uguale. JSON-LD `Event`.

### 5.5 Spettacoli
Format degli show (card con titolo, descrizione, immagine), orari tipici della serata, cosa distingue ZOO. Dati dalla tabella `shows`.

### 5.6 Feste private
Tre blocchi: Addio al celibato · Compleanni · Eventi aziendali. Ognuno con testo e immagine. Poi un modulo di richiesta: nome, telefono, email, tipo di festa, data desiderata, numero di persone, note, consenso privacy, Turnstile. Salva in `contact_messages` con `kind = 'party'`. In alternativa, pulsante WhatsApp.

### 5.7 Gallery foto
Griglia a mosaico, caricamento progressivo allo scroll (pagine da 24), lightbox a schermo intero con swipe, filtro per serata. Solo `media` con `kind = 'image'`, `visible = true` e `placement` che contiene `gallery`.

### 5.8 Gallery video
Griglia di card con poster, durata, serata. Al clic il player chiede un URL firmato a `sign-media` (sezione 9) e lo riproduce. Nessun attributo `download`, `controlsList="nodownload noplaybackrate"`, `disablePictureInPicture`. Filigrana sovrapposta (sezione 12).

### 5.9 Lavora con noi
1. Intro: il locale cerca persone serie, la candidatura è riservata e non finisce mai sul sito.
2. **Ruoli aperti** dalla tabella `job_roles` (attivabili dall'admin): Ballerina, Cubista, Cameriera, Barman, PR, Sicurezza.
3. **Cosa offriamo**: blocco di testo da `content_blocks` (compensi, turni, serietà) con segnaposto.
4. **Questionario**, campi:
   - nome, cognome (obbligatori)
   - data di nascita (obbligatoria) → **blocco se meno di 18 anni**, sia nel client sia nella Edge Function
   - città di residenza
   - cellulare (obbligatorio), email (obbligatoria)
   - ruolo (select da `job_roles`)
   - esperienza precedente (textarea)
   - disponibilità: giorni della settimana (checkbox), periodo, disponibilità a trasferte (sì/no)
   - foto: da 1 a 3, JPG/PNG/WebP/HEIC, max 8 MB l'una, ridimensionate nel browser a 1600px WebP prima dell'invio
   - curriculum: 1 PDF, max 5 MB
   - altri documenti: fino a 2 PDF (attestati, portfolio), max 5 MB l'uno, con la nota «Non caricare documenti d'identità: li verifichiamo in sede solo in caso di assunzione.»
   - note libere
   - consenso privacy (obbligatorio, link all'informativa)
   - Turnstile
5. Invio tramite la Edge Function `application-submit`. Messaggio di conferma chiaro. Nessun dato salvato nel browser dopo l'invio.

### 5.10 Contatti
Indirizzo, **mappa caricata solo al clic** (placeholder con pulsante «Mostra la mappa»: solo dopo il clic si carica l'iframe di Google Maps), telefono, WhatsApp, email, orari, come arrivare e parcheggio, **QR code Instagram**, modulo di contatto (nome, email, telefono facoltativo, messaggio, consenso, Turnstile) che salva in `contact_messages` con `kind = 'contact'`. JSON-LD `NightClub`.

### 5.11 Newsletter
Nome + email + consenso. Testo del regalo di benvenuto da `content_blocks`. Doppio opt-in (sezione 9). Pagina di esito della conferma.

### 5.12 Area riservata
Login con link via email (Supabase Auth OTP), solo per iscritti confermati. Contiene: promozioni riservate con codice da mostrare all'ingresso, date delle serate su invito, media con `placement` che contiene `members` (filigrana con l'email dell'iscritto, sezione 12). Pulsante per cancellarsi.

### 5.13 Privacy
Contenuto dal file `content/privacy-it.md` fornito insieme a questo prompt, reso in Markdown. Crea `content/privacy-en.md` traducendolo, con in testa il commento HTML `<!-- traduzione da far verificare -->`. Sostituisci i segnaposto `[da completare]` solo se il dato è noto; altrimenti restano e finiscono nell'elenco della sezione 19.

---

## 6. Componenti globali

1. **Header fisso**: logo a sinistra; a destra menu (desktop), selettore IT/EN, badge 18+, icona fotocamera sbarrata con tooltip «Vietato foto e video in sala». Sfondo trasparente sopra la hero, poi `--bg` con blur dopo 80px di scroll.
2. **Menu mobile**: hamburger in alto a destra, apre un overlay a tutto schermo con voci grandi in Bodoni, selettore lingua e contatti rapidi in fondo. Focus intrappolato, chiusura con Esc.
3. **Age gate**: al primo accesso, overlay a tutto schermo sopra tutto: logo, «Hai almeno 18 anni?», pulsanti «Sì, entra» / «No». «No» porta via dal sito. La risposta si salva in `localStorage` con timestamp e scade dopo 30 giorni. Una riga sotto: «Questo sito contiene materiale destinato a un pubblico adulto.» I crawler dei motori di ricerca devono poter leggere il contenuto: l'overlay è un layer sopra la pagina, non un redirect.
4. **Pulsante contatto flottante** su mobile: WhatsApp, in basso a destra, sempre visibile tranne nell'admin.
5. **Fascia newsletter**: titolo, regalo di benvenuto, campo email, CTA → pagina newsletter con l'email precompilata.
6. **Recensioni**: fascia a scorrimento orizzontale lento in fondo a ogni pagina pubblica. Solo recensioni con `rating = 5` e `visible = true`. Si ferma al passaggio del mouse e con `prefers-reduced-motion`. Link «Leggi tutte su Google» verso `site_settings.google_reviews_url`. **Nessun voto medio calcolato.** Le recensioni `is_sample` mostrano il badge «Esempio».
7. **Footer** (dati da `site_settings`, bilingue):
   ```
   ZOO Sexy Disco è un locale gestito da Venera S.r.l.s.
   Sede legale: Via Vincenzo Bellini 43, 24040 Madone (BG)
   C.F. e P.IVA 04616100162
   Registro Imprese di Bergamo n. 04616100162 · REA BG-476301
   Capitale sociale € 500,00 i.v.
   info@zoosexydisco.it · PEC venerasrls@arubapec.it
   ```
   Poi: orari, link social, QR Instagram piccolo, link Privacy e cookie, badge 18+, «Vietato foto e video in sala», © anno corrente.

---

## 7. Database

Crea le migrazioni in `supabase/migrations/`. Tutte le tabelle hanno `id uuid default gen_random_uuid()`, `created_at`, `updated_at` con trigger. I campi bilingue sono coppie `_it` / `_en`.

| Tabella | Colonne principali |
| --- | --- |
| `site_settings` (riga unica) | dati societari (`company_name`, `legal_address`, `vat_number`, `rea`, `registry`, `share_capital`, `pec`), `email`, `phone`, `whatsapp`, `instagram_handle`, `instagram_url`, `google_reviews_url`, `address_venue`, `maps_query`, `opening_hours_it/en`, `entry_prices_it/en`, `logo_path`, `upload_video_max_mb`, `upload_video_max_seconds` |
| `content_blocks` | `key` (unico), `it`, `en` |
| `themes` | `name`, `accent`, `accent_hot`, `hero_image_path`, `hero_video_path`, `logo_path`, `starts_at`, `ends_at`, `is_default`, `force_active` |
| `events` | `slug`, `title_it/en`, `starts_at`, `ends_at`, `dress_code_it/en`, `description_it/en`, `cover_path`, `entry_it/en`, `theme_id`, `members_only`, `published`, `is_sample` |
| `shows` | `title_it/en`, `description_it/en`, `schedule_it/en`, `cover_path`, `sort`, `published`, `is_sample` |
| `media` | `kind` (`image`/`video`), `bucket`, `path`, `thumb_path`, `poster_path`, `width`, `height`, `duration_s`, `size_bytes`, `event_id`, `placement text[]` (`gallery`/`home`/`event`/`members`), `people_tag`, `release_signed`, `release_date`, `visible`, `sort`, `is_sample` |
| `promotions` | `title_it/en`, `body_it/en`, `code`, `image_path`, `valid_from`, `valid_to`, `audience` (`public`/`members`), `published` |
| `reviews` | `author_name`, `rating` (1-5), `text_it/en`, `source` (`google`/`manual`), `review_date`, `visible`, `sort`, `is_sample` |
| `subscribers` | `email` (unico), `name`, `lang`, `status` (`pending`/`confirmed`/`unsubscribed`), `confirm_token`, `consent_at`, `confirmed_at`, `last_open_at`, `auth_user_id` |
| `campaigns` | `subject_it/en`, `body_it/en`, `audience`, `sent_at`, `recipients`, `opens` |
| `job_roles` | `name_it/en`, `active`, `sort` |
| `applications` | `first_name`, `last_name`, `birth_date`, `city`, `phone`, `email`, `role_id`, `experience`, `availability jsonb`, `photo_paths text[]`, `cv_path`, `extra_paths text[]`, `notes`, `consent_at`, `status` (`new`/`contacted`/`trial`/`hired`/`rejected`), `internal_notes`, `delete_after` (default `now() + interval '12 months'`) |
| `contact_messages` | `kind` (`contact`/`party`), `name`, `email`, `phone`, `party_type`, `party_date`, `guests`, `message`, `consent_at`, `handled`, `delete_after` (12 mesi) |
| `page_views` | `day date`, `path`, `lang`, `referrer_host`, `device` (`mobile`/`tablet`/`desktop`), `created_at` — **nessun IP, nessun identificativo** |
| `site_events` | `day`, `type` (`whatsapp_click`, `phone_click`, `table_booking_click`, `newsletter_signup`, `application_sent`, `party_request`), `path` |
| `admin_users` | `user_id` → `auth.users` |

**RLS:**
- funzione `is_admin()` (security definer) che legge `admin_users`;
- lettura anonima solo di righe pubblicate/visibili (`events.published`, `media.visible` con placement non `members`, `reviews.visible`, `shows.published`, promozioni `public` valide, `content_blocks`, `site_settings`, `themes`, `job_roles.active`);
- iscritti autenticati: lettura in più di promozioni `members`, media `members` ed eventi `members_only`;
- `applications`, `contact_messages`, `subscribers`, `campaigns`, `page_views`, `site_events`: **nessun accesso anonimo**. Gli inserimenti passano solo dalle Edge Functions con service role; lettura solo admin;
- scrittura su tutto: solo `is_admin()`.

**Cron (pg_cron):** ogni notte chiama la Edge Function `purge-expired`, che cancella righe e file oltre `delete_after`, e iscritti `pending` più vecchi di 7 giorni.

---

## 8. Storage

| Bucket | Accesso | Contenuto |
| --- | --- | --- |
| `public-media` | lettura pubblica, scrittura admin | foto già elaborate (1600px + miniatura 480px WebP), poster dei video, copertine |
| `theme-assets` | lettura pubblica, scrittura admin | sfondi, video della hero, loghi dei temi |
| `private-video` | nessun accesso pubblico | video degli spettacoli |
| `members-media` | nessun accesso pubblico | foto e video riservati agli iscritti |
| `applications` | nessun accesso pubblico | foto e allegati delle candidature |

Nomi file sempre `<uuid>.<ext>`, mai il nome originale. Limiti di dimensione sui bucket coerenti con la sezione 11. Nota nel README: sul piano gratuito Supabase il limite per file è 50 MB.

---

## 9. Edge Functions

| Funzione | Cosa fa |
| --- | --- |
| `sign-media` | Riceve un `media_id`, verifica che sia visibile (e, per `members`, che l'utente sia un iscritto confermato), restituisce un URL firmato valido **300 secondi**. |
| `track` | Riceve `path`, `lang`, `referrer`, `type`. Riduce il referrer al solo host, ricava il device dallo user agent, scrive in `page_views` o `site_events`. Non salva IP né user agent. Ignora i bot noti. |
| `newsletter-subscribe` | Verifica Turnstile, crea o aggiorna l'iscritto `pending` con token, invia l'email di conferma. |
| `newsletter-confirm` | Valida il token, imposta `confirmed`, invia l'email di benvenuto con il regalo. |
| `newsletter-unsubscribe` | Link firmato in ogni email, imposta `unsubscribed`. |
| `newsletter-send` | Solo admin: invia una campagna agli iscritti confermati, nella loro lingua, a lotti. |
| `email-open` | Pixel 1×1 che aggiorna `last_open_at` e il conteggio delle aperture della campagna. |
| `application-submit` | Verifica Turnstile, età ≥ 18, tipi MIME e dimensioni reali dei file; salva i file in `applications`, la riga in tabella, notifica l'admin via email. |
| `contact-submit` | Verifica Turnstile, salva in `contact_messages`, notifica l'admin. |
| `translate` | Solo admin, facoltativa: propone la traduzione IT→EN di un testo. Usa Gemini con `GEMINI_API_KEY` e `GEMINI_MODEL` da env; se la chiave manca, la funzione risponde 501 e il pulsante in admin non compare. |
| `purge-expired` | Chiamata dal cron: cancella righe e file scaduti. |

**Email:** crea un modulo condiviso `_shared/email.ts` con un'interfaccia `sendEmail({to, subject, html, text})` e due implementazioni: `log` (sviluppo, scrive in console) e un provider reale **ancora da scegliere**, selezionato con `EMAIL_PROVIDER`. Il provider reale non è deciso: lascia l'adapter pronto e documentato, non sceglierlo tu. Template email bilingui, sobri, col logo.

---

## 10. Pannello admin (`/admin`)

Login con email e password. Accesso solo se l'utente è in `admin_users`. Utilizzabile bene **da telefono**: il proprietario carica le foto dopo la serata dal cellulare.

| Sezione | Funzioni |
| --- | --- |
| **Dashboard** | visite oggi / 7 / 30 giorni con confronto sul periodo precedente, pagine più viste, provenienza (Instagram, Google, diretto, altro), dispositivi, click su WhatsApp e telefono, nuovi iscritti, candidature nuove, messaggi da gestire. Grafici con la skill `dataviz`. |
| **Media** | pulsante unico **Carica** (drag & drop, selezione multipla, anche da fotocamera). Per ogni lotto si scelgono: serata (o nessuna) e dove si vede (`gallery`/`home`/`event`/`members`). Poi griglia con filtri, riordino a trascinamento, nascondi, elimina. Campi per contenuto: persona ritratta (`people_tag`), liberatoria firmata sì/no + data. Azione **Rimuovi ovunque** per `people_tag`: nasconde (o cancella, con conferma) tutti i media di quella persona. |
| **Eventi** | crea, modifica, duplica, pubblica/programma; editor IT/EN affiancato; collega un tema che si attiva nei giorni della serata. |
| **Temi** | crea, programma per date, anteprima dal vivo sulla home, «attiva adesso» (`force_active`), torna al Default. |
| **Spettacoli** | CRUD con ordinamento. |
| **Promozioni** | CRUD, pubblico o riservato agli iscritti, validità. |
| **Newsletter** | elenco iscritti con stato ed export CSV, composizione campagna IT/EN con anteprima, invio, aperture. |
| **Candidature** | elenco con filtri per stato e ruolo, scheda con foto e allegati (URL firmati di 5 minuti), cambio stato, note interne, eliminazione singola e multipla. Evidenzia i giorni mancanti alla cancellazione automatica. |
| **Messaggi** | contatti e richieste di feste private, segna come gestito. |
| **Recensioni** | aggiungi a mano, riordina, nascondi. |
| **Testi** | tutti i `content_blocks`, raggruppati per pagina, IT ed EN affiancati, pulsante «Proponi traduzione» se `translate` è attiva. Se l'EN è vuoto, il sito mostra l'IT. |
| **Impostazioni** | dati societari, contatti, orari, prezzi, social, logo, limiti di upload, **generatore QR Instagram** (anteprima, download PNG 2048px e SVG). |
| **Esempi** | numero di contenuti `is_sample` per tabella, pulsante **Rimuovi tutti i contenuti di esempio** con conferma. Finché ce ne sono, un banner giallo in cima a tutto l'admin lo ricorda. |

Libreria QR: `qrcode`.

---

## 11. Pipeline dei media

**Foto** (tutto nel browser, prima dell'upload):
- lettura EXIF per l'orientamento, poi **rimozione di tutti i metadati** (GPS compreso);
- versione grande 1600px sul lato lungo, WebP qualità 0.82;
- miniatura 480px WebP;
- **l'originale non viene mai caricato.**

**Video:**
- solo MP4 (H.264) o MOV; durata e peso letti nel browser dai metadati;
- rifiuto con messaggio chiaro se supera `upload_video_max_seconds` (default **90**) o `upload_video_max_mb` (default **100**);
- **poster** estratto nel browser (frame a 1 secondo, via canvas) e salvato come WebP in `public-media`;
- upload in `private-video` (o `members-media`) con barra di avanzamento e ripresa dopo un errore.

Smistamento: la riga in `media` prende `kind` e `placement` dalla scelta fatta al caricamento. Foto nella gallery foto, video nella gallery video, e tutti e due anche nella scheda della serata se c'è `event_id`.

---

## 12. Protezione dei contenuti

Lo screenshot non si può impedire da un sito web: queste misure servono da deterrente, non promettono altro.

1. Su immagini e video: `contextmenu` disattivato, `draggable="false"`, `user-select: none`, `-webkit-touch-callout: none`.
2. **Filigrana** sovrapposta (layer CSS, non incisa nel file): la scritta «ZOO» ripetuta in diagonale, opacità 6-8%, su foto, lightbox e player video.
3. **Filigrana personale** nell'area riservata: l'email dell'iscritto ripetuta in micro-testo, opacità ~5%, sopra ogni media riservato.
4. Foto servite solo nelle versioni ridotte (sezione 11), con nomi `uuid`.
5. Video solo tramite URL firmati di 300 secondi; nessun URL permanente nel DOM.
6. Sfocatura (`filter: blur(24px)`) delle gallery quando la finestra perde il focus o la pagina diventa nascosta (`blur`, `visibilitychange`); si toglie al ritorno.

---

## 13. Statistiche in-house

- Un hook `usePageView` chiama `track` a ogni cambio di rotta (non nell'admin, non se l'utente è admin).
- Click su WhatsApp, telefono e «Prenota un tavolo», iscrizioni, candidature e richieste di feste → `site_events`.
- Nessun cookie, nessun IP salvato: coerente con l'informativa privacy.
- Aggregazioni per la dashboard tramite viste SQL o funzioni RPC riservate agli admin.
- Conserva i dati grezzi 13 mesi, poi aggregali per giorno e cancellali (in `purge-expired`).

---

## 14. Immagini e contenuti prefatti (seed)

Il sito deve apparire **completo e navigabile al primo avvio**, con immagini e contenuti di esempio che l'admin sostituisce.

### 14.1 Generatore di immagini placeholder

Script `scripts/generate-placeholders.ts` (Node + `sharp`) che crea composizioni astratte da SVG e le esporta in WebP dentro `seed/images/`. Stile: atmosfera da club notturno, **nessuna persona, nessuna sagoma di corpi**. Ingredienti: fasci di luce, bokeh, gradienti di velluto, riflessi dorati, grana leggera, fumo stilizzato. Palette dal tema di ciascuna immagine. Generazione deterministica (seed numerico) per avere lo stesso risultato a ogni esecuzione.

| File | Quantità | Formato | Soggetto astratto |
| --- | --- | --- | --- |
| `hero-01..03.webp` | 3 | 2400×1350 | fasci di luce da palco su nero, bokeh oro |
| `locale-01..04.webp` | 4 | 1600×1067 | velluto scuro, linee dorate, luci del bar |
| `gallery-01..16.webp` | 16 | 1600×1067 e 1067×1600 alternati | mix di luci, neon, riflessi |
| `event-<tema>.webp` | 6 | 1600×900 | una per serata di esempio, nei colori del tema |
| `show-01..04.webp` | 4 | 1600×1067 | luci da palco colorate |
| `party-celibato/compleanni/aziendali.webp` | 3 | 1600×1067 | brindisi stilizzato, coriandoli, luci |
| `theme-bg-<tema>.webp` | 4 | 2400×1350 | sfondo dei temi di esempio |
| `og-image.webp` | 1 | 1200×630 | logo placeholder su fondo di luci |

**Video di esempio:** se `ffmpeg` è installato, genera 3 clip da 10 secondi, 1920×1080, H.264, con gradienti animati e luci che si muovono (filtri `lavfi`), più i loro poster. Se `ffmpeg` manca, salta i video e scrivilo nel riepilogo della fase.

### 14.2 Script di seed

Script `scripts/seed.ts` idempotente, che usa la service role key da `.env.local` (mai nel frontend):
- carica le immagini nei bucket giusti e crea le righe in `media` con `is_sample = true`;
- `site_settings` con i dati societari reali (sezione 6.7) e segnaposto `[da completare]` per telefono, WhatsApp, Instagram, orari e prezzi;
- `content_blocks` con tutti i testi delle pagine in IT e EN: bozze vere per le frasi di struttura, segnaposto per i fatti;
- **tema Default** + 4 temi di esempio (Notte Bianca, Red Velvet, Halloween, Gatsby '20s) con date realistiche nei prossimi mesi;
- **6 serate di esempio** con date calcolate dal giorno del seed (i prossimi sabati, Halloween il 31/10): Notte Bianca, Red Velvet, Halloween Night, Gatsby '20s, Uniform Night, Carnevale Veneziano. Ognuna con dress code e descrizione IT/EN plausibili e non espliciti;
- **4 spettacoli** di esempio;
- **6 recensioni di esempio**, `is_sample = true`, autore nella forma «Esempio A.», testo generico. Si vedono sul sito con il badge «Esempio» e non vanno mai in produzione così;
- `job_roles` con i 6 ruoli della sezione 5.9;
- una promozione pubblica e una riservata agli iscritti.

Il comando `npm run seed` esegue generatore e seed. Il comando `npm run seed:clean` cancella tutto ciò che è `is_sample`.

---

## 15. Privacy e cookie

- Informativa: `content/privacy-it.md` (fornito) e `content/privacy-en.md` (da tradurre), resi in `/it/privacy` e `/en/privacy`.
- **Nessun banner cookie**: il sito usa solo `localStorage` tecnico (maggiore età, lingua), la sessione Supabase e il cookie di sicurezza di Cloudflare. Tutto è descritto nell'informativa.
- Mappa di Google e contenuti Instagram caricati **solo al clic**.
- Ogni modulo ha la casella di consenso con link all'informativa; il timestamp del consenso viene salvato.

---

## 16. SEO, accessibilità, performance

- `react-helmet-async`: titolo e description per ogni pagina e lingua, `hreflang` IT/EN, canonical, Open Graph con `og-image`.
- JSON-LD: `NightClub` su home e contatti, `Event` sulle schede serata.
- `public/robots.txt` e `sitemap.xml` generata alla build (`scripts/sitemap.ts`) con le pagine statiche e le serate pubblicate.
- Lighthouse mobile: Performance ≥ 85, Accessibilità ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- Immagini `loading="lazy"` tranne la hero, `srcset` con miniatura e versione grande, dimensioni esplicite.
- Focus visibile ovunque, navigazione completa da tastiera, `alt` su tutte le immagini (campo `alt_it/alt_en` opzionale sui media, con fallback al titolo della serata).

---

## 17. Deploy su Cloudflare Pages

- Build: `npm run build`, output `dist`.
- `public/_redirects`: `/* /index.html 200`.
- `public/_headers`:
  - `Content-Security-Policy` che consente solo il sito stesso, l'URL del progetto Supabase (https e wss), `challenges.cloudflare.com` (Turnstile) e `www.google.com` solo come `frame-src` per la mappa;
  - `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`;
  - cache lunga sugli asset con hash.
- Edge Functions pubblicate con la Supabase CLI (`supabase functions deploy`).
- `.env.example` con tutte le variabili:
  ```
  # Frontend (Cloudflare Pages)
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=
  VITE_TURNSTILE_SITE_KEY=
  VITE_SITE_URL=https://www.zoosexydisco.it

  # Solo locale, per il seed — mai nel frontend
  SUPABASE_SERVICE_ROLE_KEY=

  # Secrets delle Edge Functions
  TURNSTILE_SECRET_KEY=
  EMAIL_PROVIDER=log
  EMAIL_API_KEY=
  EMAIL_FROM=ZOO Sexy Disco <info@zoosexydisco.it>
  ADMIN_NOTIFY_EMAIL=info@zoosexydisco.it
  SITE_URL=https://www.zoosexydisco.it
  GEMINI_API_KEY=
  GEMINI_MODEL=
  ```
- Il `README` spiega passo per passo: creazione del progetto Supabase **in una regione UE**, migrazioni, bucket, secrets, deploy delle funzioni, primo utente admin, collegamento del repo a Cloudflare Pages, DNS del dominio Misterdomain verso Cloudflare, Turnstile.

---

## 18. Fasi di lavoro

Ogni fase si chiude con build pulita, commit e riepilogo.

**Fase 0 — Ispezione e setup.** Report sul repo, `CLAUDE.md`, dipendenze, Tailwind + shadcn, font self-hosted, token del tema Default, struttura delle cartelle, `.env.example`, collegamento a Supabase (`supabase init` se manca).
*Fatto quando:* `npm run dev` mostra una pagina vuota con i font e i colori giusti.

**Fase 1 — Fondamenta.** Migrazioni per `site_settings`, `content_blocks`, `themes`, `admin_users`; routing bilingue con i18n; header, menu mobile, footer con dati societari, age gate; pagine Home, Il locale, Contatti (senza modulo), Privacy; login admin e sezioni Impostazioni e Testi; **generatore di placeholder e seed di base**.
*Fatto quando:* il sito si naviga in IT e EN con immagini e testi di esempio, e l'admin modifica un testo o un dato del footer e lo vede cambiare sul sito.

**Fase 2 — Contenuti.** Tabella `media`, bucket, pipeline foto e video, `sign-media`, gallery foto e video, lightbox, protezioni della sezione 12, admin Media con «Rimuovi ovunque», sistema dei temi completo con admin Temi.
*Fatto quando:* una foto caricata dal telefono in admin compare nella gallery, un video parte solo con URL firmato, e un tema programmato cambia colori e hero.

**Fase 3 — Serate.** Eventi con stato calcolato, archivio, scheda serata con galleria collegata, Spettacoli, Feste private; admin Eventi e Spettacoli; seed di serate e spettacoli.
*Fatto quando:* la serata di esempio più vicina appare in home come «Prossima serata» e il pulsante WhatsApp si apre col testo precompilato.

**Fase 4 — Relazione.** Newsletter con doppio opt-in, area riservata, promozioni, campagne con aperture, recensioni con fascia globale, QR Instagram, modulo contatti e feste con Turnstile; admin Newsletter, Promozioni, Recensioni, Messaggi.
*Fatto quando:* un'iscrizione in locale (email `log`) arriva a `confirmed`, l'iscritto entra nell'area riservata e vede la filigrana con la sua email.

**Fase 5 — Recruiting.** Lavora con noi, `application-submit`, admin Candidature, `purge-expired` e cron.
*Fatto quando:* una candidatura con foto e PDF arriva in admin, una candidatura con data di nascita di un minore viene rifiutata dal server anche se il controllo nel client viene aggirato.

**Fase 6 — Misura e rifinitura.** `track`, dashboard, SEO (meta, hreflang, JSON-LD, sitemap), `_headers` e `_redirects`, verifica Lighthouse, audit di accessibilità, sezione Esempi dell'admin, `README` completo.
*Fatto quando:* i punteggi della sezione 16 sono rispettati sulla home e su una scheda serata, e il README basta a pubblicare il sito da zero.

---

## 19. Segnaposto da elencare nel README finale

Chiudi il lavoro con una tabella nel `README` di tutto ciò che è ancora segnaposto, con dove si modifica. Almeno:

- logo definitivo (SVG)
- telefono e WhatsApp
- handle e URL Instagram
- URL delle recensioni Google
- orari di apertura, prezzi d'ingresso e consumazione
- testi della storia del locale (tappe e anni)
- testo «Cosa offriamo» di Lavora con noi
- provider email e relativa chiave
- chiavi Turnstile
- nell'informativa privacy: fornitore email e sviluppatore/manutentore
- foto e video reali al posto dei placeholder, poi `npm run seed:clean`
