import { Logo } from "@/components/brand/Logo";

/** Cornice delle schermate di accesso: una colonna stretta, pensata per il telefono. */
export function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="container-site grid min-h-svh place-items-center py-12">
      <div className="w-full max-w-sm">
        <Logo className="mx-auto w-24" />
        <h1 className="tube tube-pink mt-8 text-center text-3xl">{title}</h1>
        <div className="mt-10">{children}</div>
      </div>
    </main>
  );
}

/** Messaggio sotto il modulo: errore in rosso, conferma in blu. */
export function Notice({ tone, children }: { tone: "error" | "ok"; children: React.ReactNode }) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={tone === "error" ? "text-sm text-danger" : "text-sm text-blue-core"}>
      {children}
    </p>
  );
}
