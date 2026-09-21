import { useLocation } from "react-router-dom";
import type { L } from "@/data/types";
import { LANGS, type Lang } from "@/lib/routes";

export function useLang(): Lang {
  const { pathname } = useLocation();
  const seg = pathname.split("/")[1] as Lang;
  return LANGS.includes(seg) ? seg : "it";
}

/** Testo bilingue con ripiego sull'italiano se l'inglese è vuoto. */
export function pick(v: L | undefined, lang: Lang) {
  if (!v) return "";
  return (lang === "en" ? v.en || v.it : v.it) ?? "";
}

export function useL() {
  const lang = useLang();
  return (v: L | undefined) => pick(v, lang);
}
