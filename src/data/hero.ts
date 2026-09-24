/**
 * ============================================================
 *  SFONDO DELLA HERO — IL PUNTO DOVE SI CAMBIA IL VIDEO
 * ============================================================
 *
 * Per sostituire il video di sfondo della home NON serve toccare il codice.
 * Ci sono due modi, e il sito prova il primo che trova:
 *
 * 1. DAL PANNELLO ADMIN (quando Supabase sarà collegato)
 *    Il video del tema attivo, campo `hero_video_path`. Sta nel bucket
 *    pubblico `theme-assets`: è l'unica eccezione prevista ai video privati
 *    (vedi CLAUDE.md). È la strada pensata per il cliente.
 *
 * 2. DA FILE, SUBITO
 *    Si carica un video in `public/hero/` e si scrive qui sotto il suo nome.
 *    Se il file si chiama `hero.mp4` non serve cambiare nemmeno questa riga:
 *    basta sovrascrivere `public/hero/hero.mp4`.
 *
 * In entrambi i casi il sito applica da solo, a qualunque video:
 *   · rallentamento (slow motion)   · riproduzione automatica
 *   · loop continuo                 · nessun audio
 *   · riempimento della hero senza deformare l'immagine
 *
 * Se il video manca, non si carica o il browser non lo riproduce, resta
 * la fotografia qui sotto: la hero non è mai vuota.
 */
export const heroBackground = {
  /** Video di sfondo. Metti a `undefined` per usare solo la fotografia. */
  video: "/hero/hero.mp4" as string | undefined,

  /** Fotografia di ripiego, e primo fotogramma mentre il video carica. */
  poster: "/photos/foto-palo.webp",

  /**
   * Quanto va rallentato il video: 1 = velocità normale, 0.5 = metà.
   * Vale per qualunque video caricato, senza prepararlo prima.
   */
  slowMotion: 0.5,
};
