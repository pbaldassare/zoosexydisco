import { useEffect, useState } from "react";

/** Vero quando la finestra perde il focus o la pagina è nascosta: le gallery si sfocano. */
export function useVeil() {
  const [veiled, setVeiled] = useState(false);
  useEffect(() => {
    const hide = () => setVeiled(true);
    const show = () => setVeiled(false);
    const vis = () => setVeiled(document.visibilityState === "hidden");
    window.addEventListener("blur", hide);
    window.addEventListener("focus", show);
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.removeEventListener("blur", hide);
      window.removeEventListener("focus", show);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);
  return veiled;
}
