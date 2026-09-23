import { useReducedMotion } from "@/hooks/useScrollY";
import { cn } from "@/lib/utils";

/**
 * L'insegna: l'apertura del sito. Raster fornito dal cliente, nero già
 * convertito in trasparenza, riflesso sul pavimento compreso nell'immagine.
 *
 * Sta fuori dal contenitore di pagina per prendersi quasi tutta la larghezza
 * della finestra: è la prima cosa che si deve vedere. Su telefono sborda di
 * poco oltre i lati — solo quanto basta a mangiare l'alone, mai le lettere.
 *
 * Sui telefoni bassi rientra dentro i margini: lì ogni pixel serve a tenere
 * entrambi i contatti nella prima schermata.
 *
 * All'avvio si accende una volta sola (sfarfallio a scatti, 1,6s) e poi resta
 * stabile. Con prefers-reduced-motion è accesa da subito.
 */
export function Sign({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <div className={cn("relative left-1/2 z-[1] w-[min(94vw,1440px)] -translate-x-1/2 max-sm:w-[106vw] [@media(max-width:599px)_and_(max-height:700px)]:w-[86vw]", className)}>
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
