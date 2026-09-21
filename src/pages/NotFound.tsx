import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/ui/seo";
import { useLang } from "@/hooks/useLang";
import { pathFor } from "@/lib/routes";

export default function NotFound({ message }: { message?: string }) {
  const { t } = useTranslation();
  const lang = useLang();
  return (
    <>
      <Seo title={t("notFound.title")} description={t("notFound.body")} />
      <section className="container-site grid min-h-[80svh] place-items-center pb-16 pt-[calc(var(--header-h)+3rem)] text-center">
        <div>
          <p className="font-display text-[120px] font-bold leading-none text-accent md:text-[180px]">404</p>
          <h1 className="mt-4 text-2xl">{t("notFound.title")}</h1>
          <p className="mx-auto mt-4 max-w-md text-ink-dim">{message ?? t("notFound.body")}</p>
          <Button asChild className="mt-10">
            <Link to={pathFor("home", lang)}>{t("notFound.back")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
