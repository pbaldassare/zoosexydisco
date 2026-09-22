import { useReducedMotion } from "@/hooks/useScrollY";
import { cn } from "@/lib/utils";

/**
 * L'insegna: l'apertura del sito. Raster fornito dal cliente, nero già
 * convertito in trasparenza, riflesso sul pavimento compreso nell'immagine.
 *
 * All'avvio si accende una volta sola (sfarfallio a scatti, 1,6s) e poi resta
 * stabile. Con prefers-reduced-motion è accesa da subito.
 */
export function Sign({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <div className={cn("relative mx-auto w-[min(100%,1120px)] max-sm:-mx-[8%] max-sm:w-[116%]", className)}>
      <img
        src="/brand/insegna-neon.webp"
        width={1600}
        height={352}
        alt="Insegna al neon ZOO Sexy Disco"
        {...{ fetchpriority: "high" }}
        decoding="async"
        className={cn("w-full saturate-[1.1]", !reduced && "animate-ignite")}
      />
    </div>
  );
}
