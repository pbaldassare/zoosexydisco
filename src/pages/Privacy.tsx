import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { marked } from "marked";
import it from "../../content/privacy-it.md?raw";
import en from "../../content/privacy-en.md?raw";
import { Seo } from "@/components/ui/seo";
import { useLang } from "@/hooks/useLang";

export default function Privacy() {
  const { t } = useTranslation();
  const lang = useLang();
  // Testo nostro, versionato nel repo: nessun input utente finisce qui.
  const html = useMemo(() => marked.parse((lang === "en" ? en : it).replace(/<!--[\s\S]*?-->/g, ""), { async: false }), [lang]);

  return (
    <>
      <Seo title={t("nav.privacy")} description={t("nav.privacy")} />
      <article
        className="container-site max-w-3xl pb-24 pt-[calc(var(--header-h)+4rem)] [&_h1]:mb-10 [&_h1]:text-3xl [&_h1]:tube-pink [&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:text-xl [&_h2]:tube-blue [&_li]:mb-2 [&_p]:mb-4 [&_p]:text-ink-dim [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-ink-dim"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
