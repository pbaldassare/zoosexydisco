import { useTranslation } from "react-i18next";
import { PageHero } from "@/components/sections/PageHero";
import { Badge } from "@/components/ui/badge";
import { Seo } from "@/components/ui/seo";
import { useContent, useShows } from "@/hooks/useData";
import { useL } from "@/hooks/useLang";

export default function Shows() {
  const { t, i18n } = useTranslation();
  const c = useContent();
  const l = useL();
  const { data: shows = [] } = useShows();
  const en = i18n.language === "en";

  return (
    <>
      <Seo title={t("shows.title")} description={c("shows.intro")} />
      <PageHero title={en ? "The rhythm of" : "Il ritmo della"} accent={en ? "the night" : "notte"} intro={c("shows.intro")} image="/placeholders/show-02.webp" />

      <section className="container-site pt-section">
        <ul className="grid gap-x-8 gap-y-16 md:grid-cols-2">
          {shows.map((s, i) => (
            <li key={s.id} className={i % 2 ? "md:mt-24" : undefined}>
              <article className="group">
                <div className="relative overflow-hidden rounded-card">
                  <img src={s.cover_path} alt="" width={1600} height={1067} loading="lazy" className="aspect-[4/3] w-full rounded-card border border-line object-cover transition-transform duration-1000 ease-expo group-hover:scale-[1.03]" />
                  {s.is_sample && (
                    <Badge tone="sample" className="absolute left-3 top-3">
                      {t("badge.sample")}
                    </Badge>
                  )}
                </div>
                <p className="tnum label mt-6 font-mono text-ink-faint">{l(s.schedule)}</p>
                <h2 className="tube tube-pink mt-2 text-2xl">{l(s.title)}</h2>
                <p className="mt-3 max-w-prose text-ink-dim">{l(s.description)}</p>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section className="pt-section">
        <div className="container-site grid gap-8 md:grid-cols-12">
          <h2 className="h2 tube-blue text-2xl md:col-span-4">{t("shows.typical")}</h2>
          <ol className="m-0 grid list-none border-t border-line p-0 md:col-span-8">
            {shows.map((s) => (
              <li key={s.id} className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-6 border-b border-line py-4">
                <span className="tnum label min-w-[92px] font-mono text-ink-faint">{l(s.schedule)}</span>
                <span className="tube text-xl text-ink">{l(s.title)}</span>
              </li>
            ))}
          </ol>
          <p className="max-w-prose text-ink-dim md:col-span-8 md:col-start-5">{c("shows.difference")}</p>
        </div>
      </section>
    </>
  );
}
