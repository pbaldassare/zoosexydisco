import { cn } from "@/lib/utils";

type Tone = "hot" | "accent" | "line" | "sample";

const tones: Record<Tone, string> = {
  hot: "bg-accent-hot text-ink",
  accent: "border border-accent/60 text-accent",
  line: "border border-line text-ink-dim",
  sample: "bg-sample text-bg",
};

export function Badge({ tone = "line", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return <span className={cn("label inline-flex h-6 items-center px-2 text-[11px] leading-none", tones[tone], className)}>{children}</span>;
}
