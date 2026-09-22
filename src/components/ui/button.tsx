import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Pillole di vetro piegato. Il primario è il tubo rosa pieno (l'azione),
 * il secondario è un tubo blu vuoto: bordo interno 1,5px più alone.
 * Testo in Atkinson bold, mai maiuscoletto: di notte si legge meglio.
 */
export const buttonVariants = cva(
  "inline-flex min-h-12 cursor-pointer items-center justify-center gap-[10px] rounded-pill border-0 font-body text-base font-bold leading-none transition-[transform,box-shadow,background-color] duration-[250ms] ease-expo hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-pink text-[#12040F] glow-pink",
        hot: "bg-pink text-[#12040F] glow-pink",
        outline: "bg-blue/[0.08] text-blue-core glow-tube hover:bg-blue/[0.16]",
        ghost: "text-ink-dim hover:text-pink-core hover:[text-shadow:0_0_12px_rgb(var(--pink))]",
      },
      size: {
        md: "px-5 py-[15px]",
        sm: "min-h-10 px-4 text-[15px]",
        lg: "min-h-[52px] px-7",
        /** Il tondo per la chiamata, accanto al pulsante WhatsApp. */
        round: "w-12 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
Button.displayName = "Button";

/** WhatsApp + chiamata della stessa persona, incollati in un blocco solo. */
export function ContactDuo({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex gap-1.5", className)}>{children}</span>;
}
