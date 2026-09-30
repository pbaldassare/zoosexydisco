import { Link, Outlet, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { signOut } from "./auth";

/** Intestazione comune del pannello; dentro le sezioni, «Pannello» riporta all'indice. */
export function AdminLayout() {
  const inSection = useLocation().pathname.replace(/\/$/, "") !== "/admin";
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
      <main className="container-site py-10">
        <Outlet />
      </main>
    </div>
  );
}
