import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "label inline-flex min-h-12 items-center justify-center gap-3 px-6 text-xs transition-[background-color,color,border-color,transform] duration-200 ease-expo active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-accent text-bg hover:bg-ink",
        outline: "border border-ink/35 text-ink hover:border-accent hover:text-accent",
        ghost: "text-ink hover:text-accent px-0",
        hot: "bg-accent-hot text-ink hover:brightness-110",
      },
      size: { md: "", sm: "min-h-10 px-4 text-2xs", lg: "min-h-14 px-8" },
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
