import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useLang } from "@/hooks/useLang";
import { switchLangPath } from "@/lib/routes";

const SITE = import.meta.env.VITE_SITE_URL || "https://www.zoosexydisco.it";

export function Seo({ title, description, jsonLd, image = "/og-image.jpg" }: { title: string; description: string; jsonLd?: object; image?: string }) {
  const lang = useLang();
  const { pathname } = useLocation();
  const full = title.includes("ZOO") ? title : `${title} · ZOO Sexy Disco`;
  const other = lang === "it" ? "en" : "it";
  return (
    <Helmet>
      <html lang={lang} />
      <title>{full}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${SITE}${pathname}`} />
      <link rel="alternate" hrefLang={lang} href={`${SITE}${pathname}`} />
      <link rel="alternate" hrefLang={other} href={`${SITE}${switchLangPath(pathname, other)}`} />
      <link rel="alternate" hrefLang="x-default" href={`${SITE}${switchLangPath(pathname, "it")}`} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${SITE}${image}`} />
      <meta property="og:locale" content={lang === "it" ? "it_IT" : "en_GB"} />
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
