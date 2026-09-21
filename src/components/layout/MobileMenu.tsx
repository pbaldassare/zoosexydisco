import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Phone, X } from "lucide-react";
import { AdultsBadge, NoPhotoIcon, WhatsAppGlyph } from "@/components/ui/icons";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useLang } from "@/hooks/useLang";
import { useSettings } from "@/hooks/useData";
import { pathFor } from "@/lib/routes";
import { telLink, waLink } from "@/lib/whatsapp";
import { LangSwitch } from "./LangSwitch";
import { MAIN_NAV } from "./nav";

/** Overlay a tutto schermo: voci grandi in Bodoni, lingua e contatti rapidi in fondo. */
export function MobileMenu() {
  const { t } = useTranslation();
  const lang = useLang();
  const { pathname } = useLocation();
  const { data: s } = useSettings();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  useFocusTrap(panel, open, () => setOpen(false));
  useEffect(() => setOpen(false), [pathname]);

  const items = MAIN_NAV.flatMap((i) => (i.children ? i.children.map((c) => ({ ...c, label: `${t(i.label)} · ${t(c.label)}` })) : [{ ...i, label: t(i.label) }]));

  return (
    <>
      <button
        type="button"
        className="group grid size-11 place-items-center lg:hidden"
        aria-label={t("nav.openMenu")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span className="flex w-6 flex-col items-end gap-[6px]" aria-hidden>
          <span className="h-px w-6 bg-ink transition-all group-hover:bg-accent" />
          <span className="h-px w-4 bg-ink transition-all group-hover:w-6 group-hover:bg-accent" />
        </span>
      </button>

      {open &&
        createPortal(
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.menu")}
            className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-bg duration-300 animate-in fade-in"
          >
            <div className="container-site flex h-[var(--header-h)] shrink-0 items-center justify-between">
              <span className="label text-ink-dim">{t("nav.menu")}</span>
              <button type="button" onClick={() => setOpen(false)} className="grid size-11 place-items-center text-ink hover:text-accent" aria-label={t("nav.closeMenu")}>
                <X className="size-6" />
              </button>
            </div>

            <nav className="container-site flex-1 py-6" aria-label={t("nav.menu")}>
              <ol className="space-y-1">
                {items.map((item, i) => (
                  <li key={item.key} className="animate-rise" style={{ animationDelay: `${60 + i * 40}ms` }}>
                    <Link to={pathFor(item.key, lang)} className="group flex items-baseline gap-4 py-2">
                      <span className="font-display text-[34px] leading-tight text-ink transition-colors group-hover:text-accent sm:text-2xl">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="container-site shrink-0 border-t border-line py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between">
                <LangSwitch />
                <div className="flex items-center gap-2">
                  <AdultsBadge />
                  <NoPhotoIcon />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <a href={waLink(s?.whatsapp ?? "", t("events.waGeneric"))} target="_blank" rel="noopener" className="label flex min-h-12 items-center justify-center gap-2 border border-line text-2xs text-ink">
                  <WhatsAppGlyph className="size-4" /> WhatsApp
                </a>
                {telLink(s?.phone ?? "") ? (
                  <a href={telLink(s?.phone ?? "")} className="label flex min-h-12 items-center justify-center gap-2 border border-line text-2xs text-ink">
                    <Phone className="size-4" /> {t("cta.call")}
                  </a>
                ) : (
                  <Link to={pathFor("contacts", lang)} className="label flex min-h-12 items-center justify-center gap-2 border border-line text-2xs text-ink">
                    {t("nav.contacts")}
                  </Link>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
