import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/ui/seo";
import { useLang } from "@/hooks/useLang";
import { pathFor } from "@/lib/routes";

/**
 * Esito del doppio opt-in. newsletter-confirm reindirizza qui con ?status=ok|error.
 */
export default function NewsletterConfirm() {
  const { t } = useTranslation();
  const lang = useLang();
  const [params] = useSearchParams();
  const ok = params.get("status") !== "error";

  return (
    <>
      <Seo title={t(ok ? "newsletter.confirmTitle" : "newsletter.page")} description={t(ok ? "newsletter.confirmBody" : "newsletter.confirmError")} />
      <section className="container-site grid min-h-[80svh] place-items-center pb-16 pt-[calc(var(--header-h)+3rem)]">
        <div className="max-w-xl text-center">
          {ok ? <CircleCheck className="mx-auto size-10 text-ok" aria-hidden /> : <CircleAlert className="mx-auto size-10 text-danger" aria-hidden />}
          <h1 className="tube tube-pink mt-6 text-2xl">{ok ? t("newsletter.confirmTitle") : t("newsletter.page")}</h1>
          <p className="mt-5 text-lg text-ink-dim">{ok ? t("newsletter.confirmBody") : t("newsletter.confirmError")}</p>
          <Button asChild className="mt-10">
            <Link to={ok ? pathFor("members", lang) : pathFor("newsletter", lang)}>{ok ? t("nav.members") : t("cta.subscribe")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
