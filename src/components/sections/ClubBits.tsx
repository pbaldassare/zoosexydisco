import { IcoAccessible, IcoBar, IcoShows, IcoTables } from "@/components/ui/icons";
import { HouseRules } from "@/components/sections/HouseRules";
import { useContent } from "@/hooks/useData";
import { cn } from "@/lib/utils";

/**
 * I due blocchi che la home e la pagina «Il locale» condividono.
 * Stanno qui e non duplicati: se cambia una parola, cambia in tutti e due.
 */

const FEATS = [
  { key: "bar", Icon: IcoBar, blue: false },
  { key: "shows", Icon: IcoShows, blue: true },
  { key: "tables", Icon: IcoTables, blue: false },
  { key: "access", Icon: IcoAccessible, blue: true },
] as const;

/** Cosa si trova nel locale: righe con filetti, icone al neon alternate. */
export function ClubFeatures({ className }: { className?: string }) {
  const c = useContent();
  return (
    <ul className={cn("m-0 grid list-none border-t border-line p-0", className)}>
      {FEATS.map(({ key, Icon, blue }) => (
        <li key={key} className="grid grid-cols-[48px_minmax(0,1fr)] items-start gap-4 border-b border-line py-5">
          <Icon className={cn(blue && "ico-blue")} />
          <div>
            <h3 className="mb-1 mt-0.5 font-body text-lg font-bold leading-[1.3]">{c(`home.feat.${key}.title`)}</h3>
            <p className="m-0 text-[15.5px] text-ink-dim">{c(`home.feat.${key}.body`)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * «Qui dentro nessuno ti fotografa»: il pannello delle regole della casa.
 * Il divieto di foto non è un vincolo da nascondere, è la promessa di
 * riservatezza del locale (PRODUCT.md, principio 3).
 */
export function RulesPanel({ id = "regole-t" }: { id?: string }) {
  const c = useContent();
  return (
    <section className="relative z-[1] pt-section" aria-labelledby={id}>
      <div className="container-site">
        <div className="wash-panel relative isolate overflow-hidden rounded-band border border-line px-[clamp(22px,5vw,64px)] py-[clamp(34px,6vw,70px)]">
          <div className="photo rules-photo bg-[url('/photos/foto-gambe.webp')]" aria-hidden />
          <h2 className="tube tube-pink relative m-0 mb-[30px] max-w-[14ch] text-[clamp(40px,7vw,78px)]" id={id}>
            {c("home.rules.title")}
          </h2>
          <div className="relative md:max-w-[70%]">
            <HouseRules />
          </div>
        </div>
      </div>
    </section>
  );
}
