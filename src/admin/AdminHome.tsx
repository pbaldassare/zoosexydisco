import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth";

/** Le sezioni con `to` sono pronte; le altre arrivano una alla volta. */
const SECTIONS: { name: string; to?: string; hint?: string }[] = [
  { name: "Testi", to: "testi", hint: "Tutti i testi del sito, in italiano e inglese" },
  { name: "Impostazioni", to: "impostazioni", hint: "Contatti, orari, prezzi, indirizzo, Instagram" },
  { name: "Media", to: "media", hint: "Carica foto e video, scegli dove compaiono" },
  { name: "Serate", to: "eventi", hint: "Crea, duplica e pubblica le serate" },
  { name: "Temi", to: "temi", hint: "Colori e video della home, per date o serate" },
  { name: "Promozioni", to: "promozioni", hint: "Offerte per gli iscritti, con codice e date" },
  { name: "Recensioni", to: "recensioni", hint: "La fascia che scorre in fondo al sito" },
  { name: "Ruoli", to: "ruoli", hint: "Le figure cercate in Lavora con noi" },
  { name: "Messaggi", to: "messaggi", hint: "Dal modulo della pagina Contatti" },
  { name: "Candidature", to: "candidature", hint: "Da Lavora con noi: foto, CV, stato" },
  { name: "Newsletter" },
  { name: "Dashboard" },
  { name: "Esempi", to: "esempi", hint: "I contenuti di prova da togliere" },
];

/** Ingresso del pannello. */
export function AdminHome() {
  const { session } = useAuth();
  return (
    <>
      <h1 className="tube tube-pink text-3xl">Pannello</h1>
      <p className="mt-3 break-all text-sm text-ink-dim">Accesso come {session?.user.email}</p>

      <h2 className="tube tube-blue mt-12 text-2xl">Sezioni</h2>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {SECTIONS.map((s) => (
          <li key={s.name}>
            {s.to ? (
              <Link to={s.to} className="flex min-h-16 items-center justify-between gap-4 py-3 text-ink hover:text-pink-core">
                <span>
                  <span className="block text-lg font-bold">{s.name}</span>
                  {s.hint && <span className="block text-sm text-ink-dim">{s.hint}</span>}
                </span>
                <ChevronRight className="size-5 shrink-0" aria-hidden />
              </Link>
            ) : (
              <div className="flex min-h-14 items-center justify-between py-3 text-ink-faint">
                {s.name}
                <span className="label">in arrivo</span>
              </div>
            )}
          </li>
        ))}
      </ul>

      <h2 className="tube tube-blue mt-12 text-2xl">Account</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/admin/password">Cambia password</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/it">Vai al sito</Link>
        </Button>
      </div>
    </>
  );
}
