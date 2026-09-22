import { cn } from "@/lib/utils";

/**
 * Il logo del cliente: cerchio al neon con la scritta ad arco e la ballerina
 * al palo, fondo già trasparente. Quadrato 1:1.
 * La versione grande serve solo dove il cerchio è protagonista (schermata 18+).
 */
export function Logo({ className, large = false, title = "ZOO Sexy Disco" }: { className?: string; large?: boolean; title?: string }) {
  const size = large ? 720 : 192;
  return (
    <img
      src={large ? "/brand/logo-zoo.webp" : "/brand/logo-zoo-192.webp"}
      width={size}
      height={size}
      alt={title}
      className={cn("block aspect-square object-contain", className)}
    />
  );
}
