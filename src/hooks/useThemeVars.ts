import { useEffect } from "react";
import { hexToChannels } from "@/lib/utils";
import { useActiveTheme } from "./useData";

/**
 * Applica il tema attivo su <html>: i due tubi come variabili CSS.
 * `accent` è il tubo primario (rosa), `accent_hot` il secondo (blu).
 * Le anime dei tubi restano fisse: un tema cambia il colore della luce,
 * non il bianco del vetro acceso.
 */
export function useThemeVars() {
  const { data: theme } = useActiveTheme();
  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    const a = hexToChannels(theme.accent);
    const h = hexToChannels(theme.accent_hot);
    if (a) root.style.setProperty("--pink", a);
    if (h) root.style.setProperty("--blue", h);
    root.dataset.theme = theme.id;
  }, [theme]);
  return theme;
}
