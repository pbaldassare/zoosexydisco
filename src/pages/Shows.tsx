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
      <PageHero label={t("nav.shows")} title={en ? "The rhythm of" : "Il ritmo della"} accent={en ? "the night" : "notte"} intro={c("shows.intro")} image="/placeholders/show-02.webp" />

      <section className="container-site py-20 md:py-28">
        <ul className="grid gap-x-8 gap-y-16 md:grid-cols-2">
          {shows.map((s, i) => (
            <li key={s.id} className={i % 2 ? "md:mt-24" : undefined}>
              <article className="group">
                <div className="relative overflow-hidden">
                  <img src={s.cover_path} alt="" width={1600} height={1067} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-1000 ease-expo group-hover:scale-[1.03]" />
                  {s.is_sample && (
                    <Badge tone="sample" className="absolute left-3 top-3">
                      {t("badge.sample")}
                    </Badge>
                  )}
                </div>
                <p className="label mt-6 text-2xs text-accent">{l(s.schedule)}</p>
                <h2 className="mt-2 text-2xl">{l(s.title)}</h2>
                <p className="mt-3 max-w-prose text-ink-dim">{l(s.description)}</p>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line py-20">
        <div className="container-site grid gap-8 md:grid-cols-12">
          <h2 className="text-2xl md:col-span-4">{t("shows.typical")}</h2>
          <ol className="grid gap-px bg-line md:col-span-8 md:grid-cols-4">
            {shows.map((s) => (
              <li key={s.id} className="bg-bg p-5">
                <p className="label text-2xs text-accent">{l(s.schedule)}</p>
                <p className="mt-2 font-display text-lg">{l(s.title)}</p>
              </li>
            ))}
          </ol>
          <p className="max-w-prose text-ink-dim md:col-span-8 md:col-start-5">{c("shows.difference")}</p>
        </div>
      </section>
    </>
  );
}
