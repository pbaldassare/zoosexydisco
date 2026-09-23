# Video di sfondo della home

In questa cartella va il video che si vede dietro l'insegna **ZOO SEXY DISCO**,
nella prima schermata della home.

## Come si cambia

Metti qui il tuo video e chiamalo **`hero.mp4`**, sovrascrivendo quello che c'è.
Non serve altro: nessuna riga di codice da toccare.

Se preferisci tenere un nome diverso, scrivilo in `src/data/hero.ts`, alla riga
`video:`.

## Cosa fa il sito da solo

Qualunque video tu carichi viene trattato così, senza prepararlo prima:

- **rallentato** (slow motion, metà velocità)
- **parte da solo** appena si apre la home
- **va in loop**, senza fine
- **è muto**: l'audio non viene mai riprodotto
- **riempie la hero** senza deformarsi, su telefono, tablet e desktop

Il grado di rallentamento si regola in `src/data/hero.ts`, alla riga
`slowMotion:` — `1` è la velocità normale, `0.5` è la metà.

## Se il video manca

Non succede niente di rotto: al suo posto resta la fotografia
`public/photos/foto-pedana.webp`. Lo stesso vale se il browser rifiuta di
avviarlo da solo, o se il visitatore ha chiesto al suo telefono di ridurre le
animazioni.

## Consigli pratici

- **Formato**: `.mp4` (codifica H.264) è quello che funziona ovunque.
- **Durata**: 10–20 secondi bastano. Il loop non si nota se il video finisce
  più o meno come comincia. Ricorda che il rallentamento raddoppia la durata
  percepita.
- **Peso**: sotto i 5 MB. È un video decorativo: si scarica su rete mobile
  mentre la persona sta leggendo gli orari.
- **Audio**: puoi lasciarlo nel file, tanto non viene riprodotto. Toglierlo
  però fa risparmiare peso.
- **Inquadratura**: tieni l'azione al centro. Sui telefoni in verticale i lati
  vengono tagliati.

## Quando ci sarà il pannello admin

Il video si caricherà da lì, senza passare da questa cartella: finirà nel
bucket pubblico `theme-assets` di Supabase, collegato al tema attivo
(campo `hero_video_path`). Il sito prova prima quello; questa cartella resta
come ripiego.
