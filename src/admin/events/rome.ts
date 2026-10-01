/**
 * Le serate si scrivono in ora di Roma, qualunque sia il fuso del telefono,
 * e si salvano come timestamp. Gestisce da solo l'ora legale.
 */
const TZ = "Europe/Rome";

const parts = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function romeParts(d: Date) {
  const p = Object.fromEntries(parts.formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

/** Da un istante salvato a data e ora come si leggono a Roma. */
export const fromRome = (iso: string) => romeParts(new Date(iso));

/** Da data («2026-10-31») e ora («22:30») di Roma a timestamp ISO. */
export function toRome(date: string, time: string): string {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  const [h, min] = time.split(":").map(Number) as [number, number];
  const wanted = Date.UTC(y, m - 1, d, h, min);
  // Si parte dall'ora UTC e si corregge della differenza con Roma (1 o 2 ore).
  let guess = wanted;
  for (let i = 0; i < 2; i++) {
    const r = romeParts(new Date(guess));
    const [ry, rm, rd] = r.date.split("-").map(Number) as [number, number, number];
    const [rh, rmin] = r.time.split(":").map(Number) as [number, number];
    guess += wanted - Date.UTC(ry, rm - 1, rd, rh, rmin);
  }
  return new Date(guess).toISOString();
}

/** Il giorno dopo, per una chiusura che cade dopo mezzanotte. */
export function nextDay(date: string) {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}
