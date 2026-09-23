import { cn } from "@/lib/utils";

type Props = {
  src: string;
  thumb?: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  watermark?: boolean;
  personalMark?: string;
};

const block = (e: React.SyntheticEvent) => e.preventDefault();

/**
 * Immagine con le protezioni deterrenti della sezione 12: niente menu contestuale,
 * niente trascinamento, niente selezione, filigrana sovrapposta (non incisa nel file).
 */
export function ProtectedImage({
  src,
  thumb,
  alt,
  width,
  height,
  sizes = "100vw",
  priority,
  className,
  imgClassName,
  watermark = true,
  personalMark,
}: Props) {
  const long = Math.max(width, height);
  const srcSet = thumb ? `${thumb} ${Math.round((480 / long) * width)}w, ${src} ${width}w` : undefined;
  return (
    <div className={cn("protected relative overflow-hidden bg-panel", className)} onContextMenu={block}>
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        {...(priority ? { fetchpriority: "high" } : {})}
        draggable={false}
        onDragStart={block}
        className={cn("h-full w-full object-cover", imgClassName)}
      />
      {watermark && <span className="watermark" aria-hidden />}
      {personalMark && <PersonalMark text={personalMark} />}
    </div>
  );
}

/** Filigrana personale dell'area riservata: l'email ripetuta in micro-testo, ~5%. */
export function PersonalMark({ text }: { text: string }) {
  const safe = text.replace(/[<>&'"]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="90"><text x="0" y="52" transform="rotate(-18 120 45)" font-family="monospace" font-size="11" fill="#F4EDE6">${safe}</text></svg>`;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.05]"
      style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")` }}
    />
  );
}
