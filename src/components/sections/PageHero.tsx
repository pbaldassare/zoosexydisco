import { cn } from "@/lib/utils";

/**
 * Testata delle pagine interne: immagine spenta a tutta larghezza, titolo grande
 * in Bodoni in basso a sinistra. Una parola può essere in corsivo oro (accent).
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
    <section className={cn("relative flex items-end overflow-hidden", compact ? "min-h-[46svh]" : "min-h-[62svh] md:min-h-[70svh]")}>
      {image && (
        <img src={image} alt="" width={2400} height={1350} {...{ fetchpriority: "high" }} className="absolute inset-0 h-full w-full object-cover brightness-[0.38] saturate-[0.85]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-bg/10" aria-hidden />
      <div className="grain absolute inset-0" aria-hidden />
      <div className="container-site relative pb-12 pt-[calc(var(--header-h)+3rem)] md:pb-16">
        <p className="label hero-step mb-5 text-accent">{label}</p>
        <h1 className="hero-step max-w-5xl text-[44px] leading-[0.98] [animation-delay:120ms] sm:text-3xl md:text-4xl">
          {title}
          {accent && (
            <>
              {" "}
              <em className="accent-word">{accent}</em>
            </>
          )}
        </h1>
        {intro && <p className="hero-step mt-6 max-w-prose text-ink-dim [animation-delay:240ms] md:text-lg">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
