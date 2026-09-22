import { useEffect, useState } from "react";

/** Orologio condiviso: serve allo stato «aperti adesso», che cambia al minuto. */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
