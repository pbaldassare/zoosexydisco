import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { useContent } from "@/hooks/useData";
import { useLang } from "@/hooks/useLang";
import { pathFor } from "@/lib/routes";

/** Fascia globale: porta alla pagina newsletter con l'email già compilata. */
export function NewsletterBand() {
  const { t } = useTranslation();
  const c = useContent();
  const lang = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  return (
    <section aria-labelledby="nl-band" className="relative overflow-hidden border-y border-line">
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{ background: "radial-gradient(60% 120% at 85% 50%, rgb(var(--accent) / 0.16), transparent 70%)" }}
      />
      <div className="container-site relative grid gap-8 py-16 md:grid-cols-12 md:items-end md:py-20">
        <div className="md:col-span-6">
          <p className="label mb-4 text-accent">{t("nav.newsletter")}</p>
          <h2 id="nl-band" className="text-2xl md:text-3xl">
            {c("newsletter.title")}
          </h2>
          <p className="mt-4 max-w-prose text-ink-dim">{c("newsletter.gift")}</p>
        </div>
        <form
          className="md:col-span-6 md:pl-8"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`${pathFor("newsletter", lang)}?email=${encodeURIComponent(email)}`);
          }}
        >
          <label htmlFor="nl-band-email" className="sr-only">
            {t("form.email")}
          </label>
          <div className="flex border-b border-ink/40 transition-colors focus-within:border-accent">
            <input
              id="nl-band-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletter.placeholder")}
              className="min-h-14 w-full bg-transparent text-lg text-ink placeholder:text-ink-dim/70 focus:outline-none"
            />
            <button type="submit" className="label flex min-h-14 shrink-0 items-center gap-2 pl-4 text-xs text-accent hover:text-ink">
              {t("cta.subscribe")} <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
