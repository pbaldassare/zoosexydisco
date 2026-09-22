import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useContent } from "@/hooks/useData";
import { useLang } from "@/hooks/useLang";
import { pathFor } from "@/lib/routes";

/**
 * Fascia globale, prima del footer. Porta alla pagina newsletter con l'email
 * già compilata: il consenso vero si raccoglie là, non qui.
 */
export function NewsletterBand() {
  const { t } = useTranslation();
  const c = useContent();
  const lang = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  return (
    <section aria-labelledby="nl-band" className="relative z-[1] pt-section">
      <div className="container-site">
        <div
          className="grid gap-[26px] rounded-band border border-pink/35 p-[clamp(28px,5vw,56px)] md:grid-cols-2 md:items-center md:gap-12
            bg-[linear-gradient(135deg,rgb(var(--pink)/0.2),rgb(var(--blue)/0.14)),rgb(var(--panel))]
            shadow-[0_0_40px_rgb(var(--pink)/0.15),0_24px_60px_rgb(0_0_0/0.5)]"
        >
          <div>
            <h2 id="nl-band" className="h2 tube-pink mb-2.5">
              {c("newsletter.title")}
            </h2>
            <p className="m-0 text-ink-dim">{c("newsletter.gift")}</p>
          </div>

          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`${pathFor("newsletter", lang)}?email=${encodeURIComponent(email)}`);
            }}
          >
            <div className="flex flex-wrap gap-2.5">
              <label htmlFor="nl-band-email" className="sr-only">
                {t("form.email")}
              </label>
              <input
                id="nl-band-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("newsletter.placeholder")}
                className="min-h-[52px] min-w-0 flex-1 basis-[220px] rounded-pill border-[1.5px] border-line bg-wall/70 px-[18px] font-body text-base text-ink placeholder:text-ink-faint focus:border-pink focus:outline-none focus:ring-4 focus:ring-pink/20"
              />
              <Button type="submit">{t("cta.subscribe")}</Button>
            </div>
            <p className="m-0 text-xs text-ink-dim">
              {t("newsletter.consentHint")}{" "}
              <Link to={pathFor("privacy", lang)} className="text-pink-core">
                {t("form.consentLink")}
              </Link>
              .
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
