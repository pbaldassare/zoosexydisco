---
name: ZOO Sexy Disco
description: L'insegna al neon del locale, accesa sul muro scuro — magenta e blu del logo su nero-viola.
colors:
  wall: "#07040A"
  wall-2: "#0E0813"
  panel: "#140C1A"
  panel-2: "#1C1224"
  line: "#2D1F36"
  ink: "#F6EDF7"
  ink-dim: "#BDAAC4"
  ink-faint: "#8C7894"
  neon-pink: "#E939D7"
  neon-pink-core: "#FFE6FB"
  neon-pink-deep: "#8E1F83"
  neon-blue: "#3B81E9"
  neon-blue-core: "#E4EEFF"
  shoe-red: "#D0141C"
  open-green: "#52E3A4"
typography:
  tube-display:
    fontFamily: "Tilt Neon, Arial Rounded MT Bold, Helvetica Neue, sans-serif"
    fontSize: "clamp(40px, 7.4vw, 76px)"
    fontWeight: 400
    lineHeight: 1.02
  tube-hero-line:
    fontFamily: "Tilt Neon, sans-serif"
    fontSize: "clamp(26px, 5vw, 48px)"
    fontWeight: 400
  body:
    fontFamily: "Atkinson Hyperlegible, Helvetica Neue, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  body-strong:
    fontFamily: "Atkinson Hyperlegible, sans-serif"
    fontSize: "16px"
    fontWeight: 700
  label:
    fontFamily: "Atkinson Hyperlegible, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    letterSpacing: "0.06em"
  time:
    fontFamily: "Chivo Mono, ui-monospace, Menlo, monospace"
    fontSize: "clamp(16px, 2.4vw, 22px)"
    fontWeight: 500
    fontFeature: "tnum"
rounded:
  pill: "999px"
  panel: "22px"
  card: "26px"
  band: "30px"
  tile: "18px"
spacing:
  gutter: "clamp(18px, 4vw, 40px)"
  section: "clamp(76px, 11vw, 128px)"
  container: "1180px"
components:
  button-primary:
    backgroundColor: "{colors.neon-pink}"
    textColor: "{colors.wall}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.pill}"
    padding: "15px 20px"
    height: "48px"
  button-tube:
    backgroundColor: "rgba(59,129,233,.08)"
    textColor: "{colors.neon-blue-core}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.pill}"
    padding: "15px 20px"
  panel-open-state:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.panel}"
  chip-sample:
    backgroundColor: "rgba(7,4,10,.72)"
    textColor: "{colors.ink-dim}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
---

## Overview

**Creative north star: l'insegna accesa.** Il sito è l'insegna del locale montata su un muro scuro: la scritta ZOO SEXY DISCO in tubi al neon (asset fornito dal cliente) apre la home con il suo riflesso sul pavimento, sopra le foto del locale scurite, e tutto il resto vive nella luce che quell'insegna getta sul muro. Mondo notturno, seducente e mai volgare; la serata e il contatto telefonico vengono prima di tutto.

Il sistema è registrato dalla home costruita (`home.src.html`), non da intenzioni. North star scelta senza il giro di domande qualitative: da confermare con il cliente.

## Colors

Strategia **Committed**: il magenta del logo (`neon-pink`) domina come luce e come colore d'azione; il blu (`neon-blue`) è il secondo tubo, per i titoli alternati e i pulsanti secondari. Il fondo non è nero puro: `wall` nero-viola con grana viola leggerissima (4,5%).

- La luce si stende a **zone**: gradienti radiali magenta e blu sul muro dietro l'insegna e nei pannelli (Regole, Newsletter), mai come tinta piatta di un blocco.
- **Fotografia del locale**: bianco e nero con un solo dettaglio rosso (`shoe-red`, le scarpe). Si usa solo come sfondo: su desktop sul lato destro e sfumata verso il muro a sinistra, su mobile a tutta pagina e scurita. Il testo non si appoggia mai sulla parte chiara della foto.
- `open-green` è semantico: solo per «Aperto adesso». Non è un accento del marchio.
- Testo secondario sempre in `ink-dim` / `ink-faint` (viola chiaro), mai grigio neutro.

## Typography

- **Tilt Neon** = il tubo. Solo per titoli di sezione, nomi delle serate, voci del menu mobile, i giorni di apertura nel pannello delle serate. Sempre con l'alone (`.tube.pink` / `.tube.blue`): anima quasi bianca + text-shadow a 5 livelli nel colore del tubo.
- **Atkinson Hyperlegible** = tutto il testo di lettura, pulsanti, etichette, chip. Scelto per la leggibilità di notte da telefono; il suo zero barrato è voluto.
- **Chivo Mono** = solo orari e date numeriche (`22:00 – 03:30`, giorno del mese nell'elenco serate), con cifre tabellari. Mai come «stile tecnico» su frasi.

## Layout

- Mobile-first; contenitore 1180px, gutter fluido, ritmo verticale delle sezioni `section`.
- Prima schermata: insegna a tutta larghezza (fino a 1120px; su telefono 116% con sbordo controllato), riga al neon «Da oltre 25 anni, la notte è qui.», una frase, pannello delle serate con i pulsanti WhatsApp e chiamata subito sotto. L'azione primaria deve stare nella prima schermata su 390×844 e 1440×900.
- Elenchi a righe separate da filetti `line` (le notti, le serate, le caratteristiche del locale) invece di griglie di card uguali.
- Pulsante WhatsApp flottante su mobile, visibile solo dopo 520px di scroll.

## Elevation & Depth

Profondità data dalla **luce**, non dalle ombre: aloni dei tubi, bagliori radiali sul muro. Le ombre vere (offset + sfocatura morbida) solo su pannelli sollevati (pannello delle serate, feature della serata, newsletter) e sui pulsanti rosa.

## Shapes

Forme morbide come il vetro piegato: pillole per pulsanti, chip, selettore lingua; raggi grandi (18–30px) per pannelli e riquadri. Bordi sottili 1px `line`; il pulsante secondario è un tubo blu (bordo interno 1,5px + alone).

## Components

- **Insegna (hero)**: raster fornito dal cliente con il nero convertito in trasparenza; all'avvio «si accende» una volta (sfarfallio a scatti, 1,6s), poi resta stabile. Con `prefers-reduced-motion` è subito accesa.
- **Pannello delle serate**: riga al neon «Giovedì · Venerdì · Sabato» (in colonna su mobile) con la serata di turno accesa in rosa, calcolata sull'ora di Roma; sotto, una frase che dice se stasera siamo aperti o qual è la prossima serata. Mai la parola «Chiuso». Pulsanti WhatsApp Diana / WhatsApp Alessia, ognuno con il tondo per la chiamata.
- **Titoli di sezione**: tubi Tilt Neon che fanno un solo sfarfallio quando entrano in vista, partendo da uno stato già leggibile.
- **Contenuti di esempio**: chip «Esempio» e nota esplicita su serate, gallery, recensioni finché non ci sono contenuti reali.
- **Filigrana**: «ZOO» ripetuto in diagonale al 6% sulle immagini della gallery.

## Do's and Don'ts

- **Do** usare solo i due colori del logo come luce; il rosso esiste solo dentro le foto, il verde solo come stato.
- **Do** far arrivare a un tocco le chiamate a Diana e Alessia da ogni schermata.
- **Do** etichettare come esempio ogni contenuto non reale.
- **Don't** mettere una foto in primo piano come apertura: l'apertura è l'insegna, le foto stanno dietro.
- **Don't** mettere occhielli o etichette sopra i titoli, numeri di sezione, testo sfumato in gradiente.
- **Don't** usare il mono per frasi, né il neon per il testo lungo.
- **Don't** mostrare un voto medio delle recensioni né testimonianze non vere.
