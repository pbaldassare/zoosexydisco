import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ContactButtons } from "@/components/sections/ContactButtons";
import { AdultsBadge } from "@/components/ui/icons";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useLang } from "@/hooks/useLang";
import { pathFor } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { MAIN_NAV, navHref } from "./nav";

const Burger = ({ close = false }: { close?: boolean }) => (
  <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    {close ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
  </svg>
);

const burgerCls = "grid size-11 flex-none place-items-center rounded-xl border border-line bg-panel text-ink";

/** Overlay a tutto schermo: le voci sono tubi grandi, alternati rosa e blu. */
export function MobileMenu() {
  const { t } = useTranslation();
  const lang = useLang();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  useFocusTrap(panel, open, () => setOpen(false));
  useEffect(() => setOpen(false), [pathname]);


  return (
    <>
      <button type="button" className={cn(burgerCls, "lg:hidden")} aria-label={t("nav.openMenu")} aria-expanded={open} onClick={() => setOpen(true)}>
        <Burger />
      </button>

      {open &&
        createPortal(
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.menu")}
            className="fixed inset-0 z-[60] flex flex-col gap-1.5 overflow-y-auto bg-wall/[0.97] px-gutter pb-8 pt-[88px] backdrop-blur-xl duration-300 animate-in fade-in"
          >
            <button type="button" onClick={() => setOpen(false)} className={cn(burgerCls, "absolute right-gutter top-3")} aria-label={t("nav.closeMenu")}>
              <Burger close />
            </button>

            {MAIN_NAV.map((item, i) => (
              <Link
                key={item.label}
                to={navHref(item, pathFor(item.key, lang))}
                className={cn("tube py-1.5 text-[clamp(34px,9vw,52px)] no-underline", i % 2 === 0 ? "tube-pink" : "tube-blue")}
              >
                {t(item.label)}
              </Link>
            ))}

            <div className="mt-auto grid gap-2.5 pt-7 text-[15px] text-ink-dim">
              <ContactButtons text={t("events.waGeneric")} stacked />
              <span className="flex items-center gap-2">
                <AdultsBadge /> {t("rules.adults")}
              </span>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
