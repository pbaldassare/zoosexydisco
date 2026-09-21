import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NewsletterBand } from "@/components/sections/NewsletterBand";
import { ReviewsMarquee } from "@/components/sections/ReviewsMarquee";
import { WhatsAppGlyph } from "@/components/ui/icons";
import { useSettings } from "@/hooks/useData";
import { useLang } from "@/hooks/useLang";
import { useThemeVars } from "@/hooks/useThemeVars";
import { waLink } from "@/lib/whatsapp";
import { AgeGate } from "./AgeGate";
import { Footer } from "./Footer";
import { Header } from "./Header";

function WhatsAppFab() {
  const { t } = useTranslation();
  const { data: s } = useSettings();
  return (
    <a
      href={waLink(s?.whatsapp ?? "", t("events.waGeneric"))}
      target="_blank"
      rel="noopener"
      aria-label={t("cta.whatsapp")}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 grid size-14 place-items-center rounded-full bg-accent text-bg shadow-[0_10px_40px_-8px_rgb(var(--accent)/0.6)] transition-transform hover:scale-105 md:hidden"
    >
      <WhatsAppGlyph className="size-6" />
    </a>
  );
}

export function SiteLayout() {
  const lang = useLang();
  const { i18n } = useTranslation();
  const { pathname } = useLocation();
  useThemeVars();

  useEffect(() => {
    if (i18n.language !== lang) void i18n.changeLanguage(lang);
  }, [lang, i18n]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
