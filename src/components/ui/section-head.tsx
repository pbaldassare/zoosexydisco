import { cn } from "@/lib/utils";

/**
 * Titolo di sezione: un tubo acceso, senza occhiello sopra (DESIGN.md, Don'ts).
 * `label` resta disponibile per le pagine interne, dove aiuta a orientarsi,
 * ma non è mai un'etichetta sopra il titolo della sezione principale.
 */
export function SectionHead({
  label,
  title,
  tube = "pink",
  className,
  as: Tag = "h2",
  children,
}: {
  label?: string;
  title: React.ReactNode;
  tube?: "pink" | "blue";
  className?: string;
  as?: "h1" | "h2" | "h3";
  children?: React.ReactNode;
}) {
  return (
    <header className={cn("max-w-prose", className)}>
      {label && <p className="label mb-3 text-ink-faint">{label}</p>}
      <Tag className={cn("tube", tube === "pink" ? "tube-pink" : "tube-blue", Tag === "h1" ? "text-3xl" : "text-2xl")}>{title}</Tag>
      {children && <div className="mt-5 text-ink-dim md:text-lg">{children}</div>}
    </header>
  );
}
