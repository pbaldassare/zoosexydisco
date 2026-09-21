import { cn } from "@/lib/utils";

/** Titolo di sezione: etichetta Syne sopra, Bodoni sotto. */
export function SectionHead({
  label,
  title,
  className,
  as: Tag = "h2",
  children,
}: {
  label?: string;
  title: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
  children?: React.ReactNode;
}) {
  return (
    <header className={cn("max-w-prose", className)}>
      {label && <p className="label mb-4 text-accent">{label}</p>}
      <Tag className={cn(Tag === "h1" ? "text-2xl md:text-3xl" : "text-xl md:text-2xl")}>{title}</Tag>
      {children && <div className="mt-5 text-ink-dim md:text-lg">{children}</div>}
    </header>
  );
}
