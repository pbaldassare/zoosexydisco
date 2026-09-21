import type { Lang } from "./routes";

const locale = (lang: Lang) => (lang === "it" ? "it-IT" : "en-GB");

export const fmt = {
  dayNum: (d: Date) => String(d.getDate()).padStart(2, "0"),
  month: (d: Date, lang: Lang) => d.toLocaleDateString(locale(lang), { month: "short" }).replace(".", ""),
  weekday: (d: Date, lang: Lang) => d.toLocaleDateString(locale(lang), { weekday: "long" }),
  long: (d: Date, lang: Lang) =>
    d.toLocaleDateString(locale(lang), { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  short: (d: Date, lang: Lang) => d.toLocaleDateString(locale(lang), { day: "numeric", month: "long" }),
  time: (d: Date, lang: Lang) => d.toLocaleTimeString(locale(lang), { hour: "2-digit", minute: "2-digit" }),
  duration: (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`,
};

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
