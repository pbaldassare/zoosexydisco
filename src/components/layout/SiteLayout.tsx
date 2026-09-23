import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NewsletterBand } from "@/components/sections/NewsletterBand";
import { ReviewsMarquee } from "@/components/sections/ReviewsMarquee";
import { WhatsAppGlyph } from "@/components/ui/icons";
import { useSettings } from "@/hooks/useData";
import { useLang } from "@/hooks/useLang";
import { useScrollY } from "@/hooks/useScrollY";
import { useThemeVars } from "@/hooks/useThemeVars";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/whatsapp";
import { AgeGate } from "./AgeGate";
import { Footer } from "./Footer";
import { Header } from "./Header";

/** Pulsante flottante: compare solo dopo 520px di scroll, e solo da telefono. */
function WhatsAppFab() {
  const { t } = useTranslation();
  const { data: s } = useSettings();
  const show = useScrollY() > 520;

  return (
    <a
      href={waLink(s?.whatsapp ?? "", t("events.waGeneric"))}
      target="_blank"
      rel="noopener"
      aria-label={t("cta.whatsapp")}
      tabIndex={show ? 0 : -1}
      className={cn(
        "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 grid size-[58px] place-items-center rounded-full bg-pink text-[#12040F] no-underline lg:hidden",
        "shadow-[0_10px_26px_rgb(var(--pink)/0.5),inset_0_0_0_1px_rgb(255_255_255/0.2)] transition-[opacity,transform] duration-[350ms] ease-expo",
        show ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-90 opacity-0",
      )}
    >
      <WhatsAppGlyph className="size-[26px]" />
    </a>
  );
}

export function SiteLayout() {
  const lang = useLang();
  const { i18n } = useTranslation();
  const { pathname, hash } = useLocation();
  useThemeVars();

  useEffect(() => {
    if (i18n.language !== lang) void i18n.changeLanguage(lang);
  }, [lang, i18n]);

  // Cambio pagina: si torna in cima. Con un'ancora (#notti) si va invece alla
  // sezione — anche quando si è già sulla pagina, dove il percorso non cambia.
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Outlet />
      </main>
      <NewsletterBand />
      <ReviewsMarquee />
      <Footer />
      <WhatsAppFab />
      <AgeGate />
    </>
  );
}
