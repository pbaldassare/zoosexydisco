import { useReducedMotion } from "@/hooks/useScrollY";
import { cn } from "@/lib/utils";

/**
 * Il marchio in apertura: il cerchio al neon del cliente, grande e centrato.
 * È la prima cosa che si vede entrando nel sito.
 *
 * La misura dipende sia dalla larghezza sia dall'ALTEZZA della finestra
 * (`svh`): su uno schermo basso il cerchio si stringe da solo, così il
 * pannello delle serate e i pulsanti di contatto restano nella prima
 * schermata — che è il punto di tutta la home. Sui telefoni bassi (sotto i
 * 700px di altezza) scende ancora, perché lì lo spazio non basta.
 *
 * All'avvio si accende una volta sola (sfarfallio a scatti, 1,6s) e poi resta
 * stabile. Con prefers-reduced-motion è acceso da subito.
 */
export function HeroLogo({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <div className={cn("relative z-[1] mx-auto w-[min(62vw,38svh,470px)] max-sm:w-[min(70vw,32svh,330px)] [@media(max-width:599px)_and_(max-height:700px)]:w-[min(56vw,16svh,300px)]", className)}>
      <img
        src="/brand/logo-zoo.webp"
        width={720}
        height={720}
        alt="ZOO Sexy Disco"
        {...{ fetchpriority: "high" }}
        decoding="async"
        className={cn("aspect-square w-full object-contain saturate-[1.1]", !reduced && "animate-ignite")}
      />
    </div>
  );
}
