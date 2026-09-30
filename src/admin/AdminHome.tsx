import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { signOut, useAuth } from "./auth";

const SECTIONS = ["Testi", "Impostazioni", "Media", "Eventi", "Temi", "Promozioni", "Recensioni", "Candidature", "Messaggi", "Newsletter", "Dashboard", "Esempi"];

/** Ingresso del pannello. Le sezioni arrivano una alla volta, a partire da Testi. */
export function AdminHome() {
  const { session } = useAuth();
  return (
    <div className="min-h-svh">
      <header className="border-b border-line">
        <div className="container-site flex items-center justify-between gap-4 py-3">
          <Link to="/admin" className="flex items-center gap-3">
            <Logo className="w-10" />
            <span className="label text-ink-dim">Admin</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => void signOut()}>
            Esci
          </Button>
        </div>
      </header>

      <main className="container-site py-10">
        <h1 className="tube tube-pink text-3xl">Pannello</h1>
        <p className="mt-3 break-all text-sm text-ink-dim">Accesso come {session?.user.email}</p>

        <h2 className="tube tube-blue mt-12 text-2xl">Sezioni</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {SECTIONS.map((s) => (
            <li key={s} className="flex items-center justify-between py-4 text-ink-dim">
              {s}
              <span className="label text-ink-faint">in arrivo</span>
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
      </main>
    </div>
  );
}
