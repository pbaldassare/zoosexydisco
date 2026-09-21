import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { safeStorage } from "@/lib/utils";

const KEY = "zoo.age-ok";
const TTL = 30 * 24 * 60 * 60 * 1000;

function isConfirmed() {
  const v = Number(safeStorage.get(KEY));
  return Number.isFinite(v) && v > 0 && Date.now() - v < TTL;
}

/**
 * Verifica della maggiore età. È un livello sopra la pagina, non un redirect:
 * il contenuto resta nel DOM e leggibile dai motori di ricerca.
 */
export function AgeGate() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open);

  useEffect(() => {
    if (!isConfirmed()) setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-q"
      aria-describedby="age-note"
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-bg/85 px-6 py-10 backdrop-blur-2xl"
    >
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <Logo className="w-44 text-ink duration-700 animate-in fade-in sm:w-52" />
        <div className="hairline my-10 w-40" aria-hidden />
        <h2 id="age-q" className="text-xl sm:text-2xl">
          {t("age.question")}
        </h2>
        <div className="mt-8 grid w-full grid-cols-2 gap-3">
          <Button
            onClick={() => {
              safeStorage.set(KEY, String(Date.now()));
              setOpen(false);
            }}
          >
            {t("age.yes")}
          </Button>
          <Button variant="outline" onClick={() => window.location.replace("https://www.google.com")}>
            {t("age.no")}
          </Button>
        </div>
        <p id="age-note" className="mt-8 max-w-xs text-xs text-ink-dim">
          {t("age.note")}
        </p>
      </div>
    </div>
  );
}
