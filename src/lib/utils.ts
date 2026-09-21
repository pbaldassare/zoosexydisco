import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Valore non ancora fornito dal cliente: resta visibile come segnaposto. */
export const PLACEHOLDER = "[da completare]";
export const isPlaceholder = (v: string | null | undefined) => !v || v.includes(PLACEHOLDER);

/** localStorage può lanciare (navigazione privata, dati bloccati). */
export const safeStorage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* ignorato: il sito funziona anche senza */
    }
  },
};

export function hexToChannels(hex: string): string | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m?.[1]) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}
