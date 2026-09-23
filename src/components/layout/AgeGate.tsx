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
      className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto p-6 backdrop-blur-xl"
      /* Fondo come scorciatoia CSS: il colore pieno è l'ultimo livello. In
       * classe Tailwind i due livelli separati da virgola non vengono generati
       * e la schermata resta trasparente sopra la home. */
      style={{
        background: "radial-gradient(60% 50% at 50% 38%, rgb(var(--pink) / 0.22), transparent 70%), rgb(4 2 6 / 0.985)",
      }}
    >
      <div className="grid max-w-[430px] justify-items-center gap-[18px] text-center">
        <Logo large className="w-[min(62vw,260px)] duration-700 animate-in fade-in" title="" />

        <p id="age-q" className="tube tube-pink m-0 text-[clamp(34px,8vw,46px)]">
          {t("age.question")}
        </p>

        <div className="flex flex-wrap justify-center gap-2.5">
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

        <p id="age-note" className="m-0 text-xs text-ink-faint">
          {t("age.note")}
        </p>
      </div>
    </div>
  );
}
