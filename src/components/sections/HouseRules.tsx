import { IcoAdults, IcoNoCamera, IcoRespect } from "@/components/ui/icons";
import { useContent } from "@/hooks/useData";
import { cn } from "@/lib/utils";

const RULES = [
  { key: "photo", Icon: IcoNoCamera, blue: false },
  { key: "age", Icon: IcoAdults, blue: true },
  { key: "respect", Icon: IcoRespect, blue: false },
] as const;

/**
 * Le tre regole della casa. Il divieto di foto non è un vincolo da nascondere:
 * è la promessa di riservatezza del locale (PRODUCT.md, principio 3).
 */
export function HouseRules({ className }: { className?: string }) {
  const c = useContent();
  return (
    <ul className={cn("m-0 grid list-none gap-[22px] p-0 sm:grid-cols-3", className)}>
      {RULES.map(({ key, Icon, blue }) => (
        <li key={key} className="grid grid-cols-[44px_minmax(0,1fr)] gap-3.5 text-ink-dim">
          <Icon className={cn("size-11", blue && "ico-blue")} />
          <div>
            <strong className="mb-0.5 block text-base font-bold text-ink">{c(`home.rules.${key}.title`)}</strong>
            <span>{c(`home.rules.${key}.body`)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
