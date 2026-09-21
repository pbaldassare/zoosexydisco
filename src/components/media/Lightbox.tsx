import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Media } from "@/data/types";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useVeil } from "@/hooks/useVeil";
import { cn } from "@/lib/utils";

type Props = {
  items: Media[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
  altFor: (m: Media) => string;
};

/** Lightbox a schermo intero: frecce, Esc, swipe orizzontale, filigrana. */
export function Lightbox({ items, index, onClose, onIndex, altFor }: Props) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const open = index !== null;
  const veiled = useVeil();
  useFocusTrap(ref, open, onClose);
  const [touchX, setTouchX] = useState<number | null>(null);

  const go = useCallback(
    (d: number) => {
      if (index === null) return;
      onIndex((index + d + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, go]);

  if (index === null) return null;
  const m = items[index];
  if (!m) return null;

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={altFor(m)}
      className="fixed inset-0 z-[80] flex flex-col bg-bg/95 backdrop-blur-md"
      onTouchStart={(e) => setTouchX(e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchX === null) return;
        const dx = (e.changedTouches[0]?.clientX ?? touchX) - touchX;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        setTouchX(null);
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <span className="label text-ink-dim">
          {index + 1} / {items.length}
        </span>
        <button onClick={onClose} className="grid size-12 place-items-center text-ink hover:text-accent" aria-label={t("gallery.close")}>
          <X className="size-6" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-6 md:px-20">
        <div className={cn("protected relative", veiled && "gallery-veiled")} onContextMenu={(e) => e.preventDefault()}>
          <img
            key={m.id}
            src={m.path}
            alt={altFor(m)}
            width={m.width}
            height={m.height}
            draggable={false}
            className="max-h-[calc(100dvh-7rem)] w-auto object-contain duration-300 animate-in fade-in"
          />
          <span className="watermark" aria-hidden />
        </div>
        <button
          onClick={() => go(-1)}
          className="absolute left-2 top-1/2 hidden size-12 -translate-y-1/2 place-items-center text-ink hover:text-accent md:grid"
          aria-label={t("gallery.prev")}
        >
          <ChevronLeft className="size-8" />
        </button>
        <button
          onClick={() => go(1)}
          className="absolute right-2 top-1/2 hidden size-12 -translate-y-1/2 place-items-center text-ink hover:text-accent md:grid"
          aria-label={t("gallery.next")}
        >
          <ChevronRight className="size-8" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
