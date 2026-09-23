import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

const SECTIONS = ["Dashboard", "Media", "Eventi", "Temi", "Spettacoli", "Promozioni", "Newsletter", "Candidature", "Messaggi", "Recensioni", "Testi", "Impostazioni", "Esempi"];

/** Il pannello admin si costruisce insieme al collegamento a Supabase. */
export default function AdminPlaceholder() {
  return (
    <main className="container-site grid min-h-screen place-items-center py-16">
      <div className="max-w-xl">
        <Logo className="w-28 text-ink" />
        <h1 className="mt-10 text-2xl">Pannello admin</h1>
        <p className="mt-4 text-ink-dim">
          Il pannello arriva con il collegamento a Supabase: serve l'autenticazione per proteggere le sezioni qui sotto.
        </p>
        <ul className="mt-8 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <li key={s} className="label rounded-pill border border-line px-3 py-2 text-ink-dim">
              {s}
            </li>
          ))}
        </ul>
        <Button asChild variant="outline" className="mt-10">
          <Link to="/it">Torna al sito</Link>
        </Button>
      </div>
    </main>
  );
}
