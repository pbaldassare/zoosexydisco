import { useEffect } from "react";
import { hexToChannels } from "@/lib/utils";
import { useActiveTheme } from "./useData";

/** Applica il tema attivo su <html>: accenti come variabili CSS. */
export function useThemeVars() {
  const { data: theme } = useActiveTheme();
  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    const a = hexToChannels(theme.accent);
    const h = hexToChannels(theme.accent_hot);
    if (a) root.style.setProperty("--accent", a);
    if (h) root.style.setProperty("--accent-hot", h);
    root.dataset.theme = theme.id;
  }, [theme]);
  return theme;
}
