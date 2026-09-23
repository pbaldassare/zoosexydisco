import { useEffect, useRef, useState } from "react";
import { heroBackground } from "@/data/hero";
import { useReducedMotion } from "@/hooks/useScrollY";

/**
 * Lo sfondo della prima schermata: un video rallentato, con la fotografia
 * sotto come ripiego. Il velo scuro lo mette `.photo.hero-photo`, che resta
 * sopra il video: così il testo si legge uguale in entrambi i casi.
 *
 * Il video viene da `heroBackground` (vedi src/data/hero.ts) o dal tema
 * attivo: qualunque file venga caricato, qui riceve sempre lo stesso
 * trattamento — rallentato, in loop, muto, riempie senza deformare.
 */
export function HeroBackdrop({ video }: { video?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  // Con prefers-reduced-motion resta la fotografia: un video a ciclo continuo
  // è esattamente ciò che quell'impostazione chiede di evitare.
  const showVideo = !!video && !reduced && !failed;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Il rallentamento va riapplicato: diversi browser lo riportano a 1
    // quando il video viene (ri)caricato o riparte in loop.
    const slow = () => {
      if (el.playbackRate !== heroBackground.slowMotion) el.playbackRate = heroBackground.slowMotion;
    };
    slow();
    el.addEventListener("loadedmetadata", slow);
    el.addEventListener("play", slow);
    el.addEventListener("ratechange", slow);

    // Su alcuni telefoni il play automatico parte solo dopo l'interazione:
    // se viene rifiutato restiamo sulla fotografia invece che su un fermo immagine.
    void el.play().catch(() => setFailed(true));

    return () => {
      el.removeEventListener("loadedmetadata", slow);
      el.removeEventListener("play", slow);
      el.removeEventListener("ratechange", slow);
    };
  }, [video, showVideo]);

  return (
    <>
      {showVideo && (
        <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          <video
            ref={ref}
            key={video}
            src={video}
            poster={heroBackground.poster}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
            controlsList="nodownload"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* La fotografia sta sotto quando c'è il video: serve solo il velo. */}
      <div
        className="photo hero-photo"
        style={showVideo ? undefined : { backgroundImage: `url(${heroBackground.poster})` }}
        aria-hidden
      />
    </>
  );
}
