import { cn } from "@/lib/utils";

/**
 * Testata delle pagine interne. Stessa grammatica della home: la foto sta
 * dietro e scurita, il titolo è un tubo acceso. Una parola può passare
 * al secondo tubo (blu) per spezzare la riga.
 */
export function PageHero({
  label,
  title,
  accent,
  intro,
  image,
  compact = false,
  children,
}: {
  label: string;
  title: string;
  accent?: string;
  intro?: string;
  image?: string;
  compact?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className={cn("wash-sign relative isolate z-[1] flex items-end overflow-hidden", compact ? "min-h-[42svh]" : "min-h-[56svh] md:min-h-[62svh]")}>
      {image && (
        <img src={image} alt="" width={2400} height={1350} {...{ fetchpriority: "high" }} className="absolute inset-0 -z-[1] h-full w-full object-cover brightness-[0.38] saturate-[0.85]" />
      )}
      <div className="absolute inset-0 -z-[1] bg-gradient-to-t from-wall via-wall/40 to-wall/10" aria-hidden />
      <div className="grain absolute inset-0 -z-[1]" aria-hidden />

      <div className="container-site pb-12 pt-[calc(var(--header-h)+3rem)] md:pb-16">
        <p className="label mb-4 text-ink-faint">{label}</p>
        <h1 className="tube tube-pink max-w-5xl text-3xl">
          {title}
          {accent && (
            <>
              {" "}
              <span className="tube-blue">{accent}</span>
            </>
          )}
        </h1>
        {intro && <p className="mt-6 max-w-prose text-ink-dim md:text-lg">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
