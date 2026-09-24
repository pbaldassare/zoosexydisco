/**
 * Indicazioni stradali verso il locale.
 *
 * `dir/?api=1&destination=` apre direttamente il percorso, non la scheda del
 * posto: su telefono lancia l'app Maps già pronta a navigare, su computer la
 * stessa cosa nel browser.
 *
 * È solo un link: finché nessuno lo tocca, il sito non parla con Google.
 */
export const mapsDirections = (destination: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
