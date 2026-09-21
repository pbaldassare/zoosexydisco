import paths from "./logo-paths.json";
import { cn } from "@/lib/utils";

/**
 * Logo provvisorio: «ZOO» in Bodoni Moda e «SEXY DISCO» in Syne, convertiti in
 * tracciati da scripts/generate-placeholders.ts. Eredita il colore (currentColor).
 * Quando arriva il logo del cliente, site_settings.logo_path lo sostituisce.
 */
export function Logo({ className, compact = false, title = "ZOO Sexy Disco" }: { className?: string; compact?: boolean; title?: string }) {
  const [, , w, h] = paths.viewBox.split(" ").map(Number);
  const vb = compact ? `0 0 ${w} ${Math.round(h! * 0.72)}` : paths.viewBox;
  return (
    <svg viewBox={vb} className={cn("block", className)} role="img" aria-label={title} fill="currentColor">
      <path transform={paths.zoo.transform} d={paths.zoo.d} />
      {!compact && <path transform={paths.sub.transform} d={paths.sub.d} />}
    </svg>
  );
}

/** La sola parola ZOO, usata come maschera nella hero. */
export const logoPaths = paths;
