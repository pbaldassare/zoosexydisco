import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  /** Modifiche non ancora salvate. */
  dirty: number;
  saving: boolean;
  failed: boolean;
  saved: boolean;
  /** Motivo per cui non si può salvare (campo obbligatorio vuoto, valore sbagliato). */
  blocked?: string;
  onSave: () => void;
  onCancel: () => void;
};

/** Barra in fondo allo schermo: conta le modifiche, salva o annulla. Da telefono resta sotto il pollice. */
export function SaveBar({ dirty, saving, failed, saved, blocked, onSave, onCancel }: Props) {
  // Uscendo con modifiche non salvate il browser chiede conferma.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!dirty && !saved && !failed) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-wall/95 backdrop-blur-xl">
      <div className="container-site flex min-h-[76px] items-center justify-between gap-4 py-3">
        <div className="text-sm" aria-live="polite">
          {failed ? (
            <span className="text-danger">Salvataggio non riuscito. Riprova.</span>
          ) : blocked ? (
            <span className="text-danger">{blocked}</span>
          ) : dirty ? (
            <span className="text-ink">{dirty === 1 ? "1 modifica da salvare" : `${dirty} modifiche da salvare`}</span>
          ) : (
            <span className="text-blue-core">Salvato. Il sito è già aggiornato.</span>
          )}
        </div>
        {dirty > 0 && (
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
              Annulla
            </Button>
            <Button type="button" size="sm" onClick={onSave} disabled={saving || !!blocked}>
              {saving ? "Salvo…" : "Salva"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
