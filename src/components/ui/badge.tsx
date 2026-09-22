import { cn } from "@/lib/utils";

type Tone = "hot" | "accent" | "line" | "sample" | "open" | "next";

/**
 * Chip a pillola. «sample» marca ogni contenuto non reale (DESIGN.md, Do's),
 * «open» è l'unico posto in cui compare il verde: è uno stato, non un accento.
 */
const tones: Record<Tone, string> = {
  hot: "bg-pink text-[#12040F] shadow-[0_0_14px_rgb(var(--pink)/0.45)]",
  accent: "text-pink-core shadow-[inset_0_0_0_1.5px_rgb(var(--pink)),0_0_12px_rgb(var(--pink)/0.35)]",
  line: "border border-line text-ink-dim",
  sample: "border border-line bg-wall/70 text-ink-dim",
  open: "bg-ok text-[#08130E] shadow-[0_0_14px_rgb(var(--ok)/0.45)]",
  next: "text-pink-core shadow-[inset_0_0_0_1.5px_rgb(var(--pink)),0_0_12px_rgb(var(--pink)/0.35)]",
};

export function Badge({ tone = "line", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("label inline-flex items-center rounded-pill px-2.5 py-[7px] text-[13px] leading-none", tones[tone], className)}>
      {children}
    </span>
  );
}
