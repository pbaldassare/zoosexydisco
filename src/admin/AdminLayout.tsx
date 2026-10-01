import { Link, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { signOut } from "./auth";
import { countSamples, SAMPLES_KEY } from "./samples/data";

/** Intestazione comune del pannello; dentro le sezioni, «Pannello» riporta all'indice. */
export function AdminLayout() {
  const path = useLocation().pathname.replace(/\/$/, "");
  const inSection = path !== "/admin";
  // Finché restano contenuti di esempio, lo si ricorda in cima a ogni pagina (brief §14).
  const samples = useQuery({ queryKey: SAMPLES_KEY, queryFn: countSamples, staleTime: 0 });
  const left = Object.values(samples.data ?? {}).reduce((a, b) => a + b, 0);
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-30 border-b border-line bg-wall/90 backdrop-blur-xl">
        <div className="container-site flex min-h-16 items-center justify-between gap-4 py-2">
          {inSection ? (
            <Link to="/admin" className="inline-flex min-h-11 items-center gap-1 text-ink-dim hover:text-ink">
              <ChevronLeft className="size-5" aria-hidden /> Pannello
            </Link>
          ) : (
            <Link to="/admin" className="flex items-center gap-3">
              <Logo className="w-10" />
              <span className="label text-ink-dim">Admin</span>
            </Link>
          )}
          <Button variant="ghost" size="sm" onClick={() => void signOut()}>
            Esci
          </Button>
        </div>
      </header>
      {left > 0 && path !== "/admin/esempi" && (
        <Link to="/admin/esempi" className="block bg-sample text-wall">
          <span className="container-site block py-2.5 text-sm font-bold">
            Sul sito ci sono ancora {left} contenuti di esempio. Toglili quando hai caricato i tuoi →
          </span>
        </Link>
      )}
      <main className="container-site py-10">
        <Outlet />
      </main>
    </div>
  );
}
