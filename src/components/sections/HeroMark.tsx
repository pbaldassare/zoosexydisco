import { useEffect, useId, useRef, useState } from "react";
import { logoPaths } from "@/components/brand/Logo";
import { useReducedMotion } from "@/hooks/useScrollY";

/** Riquadro di «SEXY DISCO» nel sistema di coordinate del logo (x, y, larghezza, altezza). */
const SUB_BOX = [118, 225, 363, 26] as const;

/**
 * La firma del sito: la parola «ZOO» enorme, e dentro le lettere la notte accesa.
 * Fuori dalle lettere la stessa immagine è spenta. Tutto in un unico SVG
 * dimensionato sui pixel reali della hero, così immagine e maschera restano
 * allineate a qualunque formato (anche 390px in verticale).
 *
 * Prestazioni: nessun filtro CSS sulle immagini (l'oscuramento è un velo nero),
 * e lo scroll aggiorna i transform direttamente sul DOM, senza re-render React.
 */
export function HeroMark({ image, video }: { image: string; video?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const moving = useRef<Array<SVGGElement | null>>([]);
  const [size, setSize] = useState({ w: 1600, h: 900 });
  const id = useId().replace(/:/g, "");
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;
  const [, , lw, lhFull] = logoPaths.viewBox.split(" ").map(Number) as [number, number, number, number];
  const lh = lhFull * 0.72; // solo la parola ZOO
  const portrait = h > w;
  const markW = Math.min(w * (portrait ? 0.94 : 0.8), (h * (portrait ? 0.5 : 0.62) * lw) / lh);
  const markH = (markW * lh) / lw;
  const mx = (w - markW) / 2;
  const my = h * (portrait ? 0.3 : 0.37) - markH / 2;
  const subW = Math.max(150, Math.min(markW * 0.24, 300));
  const origin = `${w / 2}px ${my + markH / 2}px`;

  // Allo scroll il marchio si stringe e sale verso la barra, poi lascia il posto al logo piccolo.
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const apply = () => {
      const p = Math.min(1, window.scrollY / (h * 0.45));
      const t = `translate(0px, ${-p * h * 0.22}px) scale(${1 - p * 0.45})`;
      moving.current.forEach((g, i) => {
        if (!g) return;
        g.style.transform = t;
        if (i === 1) g.style.opacity = String(1 - p * 0.6);
        if (i === 2) g.style.opacity = String(1 - p);
      });
    };
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
    };
  }, [h, reduced]);

  const moveStyle = { transformOrigin: origin } as const;
  const liveVideo = !!video && !reduced;

  return (
    <div ref={ref} className="absolute inset-0" aria-hidden>
      {liveVideo && <video className="absolute inset-0 h-full w-full object-cover opacity-40" src={video} poster={image} autoPlay muted loop playsInline />}
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <mask id={`m-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
            <rect width={w} height={h} fill="black" />
            <g ref={(g) => void (moving.current[0] = g)} style={moveStyle}>
              <g className={reduced ? undefined : "hero-fill"}>
                <svg x={mx} y={my} width={markW} height={markH} viewBox={`0 0 ${lw} ${lh}`}>
                  <path transform={logoPaths.zoo.transform} d={logoPaths.zoo.d} fill="white" />
                </svg>
              </g>
            </g>
          </mask>
          <radialGradient id={`spot-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(var(--accent))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`fade-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.55" stopColor="rgb(var(--bg))" stopOpacity="0" />
            <stop offset="1" stopColor="rgb(var(--bg))" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* la notte spenta, fuori dalle lettere: la stessa immagine sotto un velo */}
        {!liveVideo && <image href={image} x="0" y="0" width={w} height={h} preserveAspectRatio="xMidYMid slice" />}
        <rect width={w} height={h} fill="rgb(var(--bg))" opacity={liveVideo ? 0.2 : 0.6} />

        {/* la notte accesa, dentro le lettere */}
        <g mask={`url(#m-${id})`}>
          <image href={image} x="0" y="0" width={w} height={h} preserveAspectRatio="xMidYMid slice" />
          <ellipse className={reduced ? undefined : "hero-spot"} cx={w * 0.3} cy={my + markH * 0.5} rx={markW * 0.35} ry={markH * 0.9} fill={`url(#spot-${id})`} />
        </g>

        {/* filo d'oro che disegna il contorno delle lettere */}
        <g ref={(g) => void (moving.current[1] = g)} style={moveStyle}>
          <svg x={mx} y={my} width={markW} height={markH} viewBox={`0 0 ${lw} ${lh}`} overflow="visible">
            <path
              transform={logoPaths.zoo.transform}
              d={logoPaths.zoo.d}
              fill="none"
              stroke="rgb(var(--accent))"
              strokeOpacity="0.7"
              strokeWidth={(lw / markW) * 1.1}
              pathLength={1}
              className={reduced ? undefined : "hero-stroke"}
            />
          </svg>
        </g>

        {/* SEXY DISCO, spaziato, sotto il marchio */}
        <g ref={(g) => void (moving.current[2] = g)} style={moveStyle}>
          <g className={reduced ? undefined : "hero-sub"}>
            <svg x={(w - subW) / 2} y={my + markH + markH * 0.12} width={subW} height={(subW * SUB_BOX[3]) / SUB_BOX[2]} viewBox={SUB_BOX.join(" ")}>
              <path transform={logoPaths.sub.transform} d={logoPaths.sub.d} fill="rgb(var(--ink))" />
            </svg>
          </g>
        </g>

        <rect width={w} height={h} fill={`url(#fade-${id})`} />
      </svg>
      <div className="grain absolute inset-0" />
    </div>
  );
}
