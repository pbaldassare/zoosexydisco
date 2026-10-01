import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { Notice } from "../AuthShell";

type Props = {
  title: string;
  children: React.ReactNode;
  saving: boolean;
  error?: unknown;
  canSave?: boolean;
  onSave: () => void;
  onClose: () => void;
  /** Se c'è, compare «Elimina» con la conferma. */
  onDelete?: () => void;
  deleteNote?: string;
};

/** Scheda a tutto schermo sul telefono per modificare una riga: Salva, Annulla, Elimina con conferma. */
export function Sheet({ title, children, saving, error, canSave = true, onSave, onClose, onDelete, deleteNote = "Si cancella per sempre." }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [confirm, setConfirm] = useState(false);
  useFocusTrap(ref, true, onClose);

  return createPortal(
    <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[70] overflow-y-auto bg-wall/[0.97] backdrop-blur-xl">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (canSave) onSave();
        }}
        className="container-site max-w-2xl py-4 pb-12"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="tube tube-pink text-2xl">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Chiudi" className="grid size-12 shrink-0 place-items-center rounded-pill text-ink hover:text-pink-core">
            <X className="size-6" aria-hidden />
          </button>
        </div>
        <div className="mt-6 grid gap-6">{children}</div>
        {!!error && (
          <div className="mt-6">
            <Notice tone="error">{error instanceof Error ? error.message : "Operazione non riuscita. Riprova."}</Notice>
          </div>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <Button type="submit" disabled={saving || !canSave}>
            {saving ? "Salvo…" : "Salva"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Annulla
          </Button>
          <span className="flex-1" />
          {onDelete &&
            (confirm ? (
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-danger">{deleteNote}</span>
                <Button type="button" size="sm" className="bg-danger text-wall" disabled={saving} onClick={onDelete}>
                  Sì, cancella
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setConfirm(false)}>
                  No
                </Button>
              </span>
            ) : (
              <Button type="button" variant="ghost" className="text-danger hover:text-danger" onClick={() => setConfirm(true)}>
                <Trash2 className="size-4" aria-hidden /> Elimina
              </Button>
            ))}
        </div>
      </form>
    </div>,
    document.body,
  );
}
