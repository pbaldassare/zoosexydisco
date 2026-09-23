import { useTranslation } from "react-i18next";
import { PageHero } from "@/components/sections/PageHero";
import { Seo } from "@/components/ui/seo";
import { IcoAdults, IcoNoCamera, IcoRespect, IcoTables } from "@/components/ui/icons";
import { useContent, useSettings, useTimeline } from "@/hooks/useData";
import { useL } from "@/hooks/useLang";
import { cn } from "@/lib/utils";

const ROOMS = [
  { key: "sala", img: "/placeholders/locale-02.webp", it: "La sala", en: "The main room" },
  { key: "tavoli", img: "/placeholders/locale-03.webp", it: "I tavoli", en: "The tables" },
  { key: "prive", img: "/placeholders/locale-04.webp", it: "Il privé", en: "The private room" },
] as const;

export default function Club() {
  const { t, i18n } = useTranslation();
  const c = useContent();
  const l = useL();
  const { data: steps } = useTimeline();
  const { data: s } = useSettings();
  const en = i18n.language === "en";

  const rules = [
    { Icon: IcoNoCamera, text: c("club.rules.photo"), blue: false },
    { Icon: IcoAdults, text: c("club.rules.age"), blue: true },
    { Icon: IcoRespect, text: c("club.rules.respect"), blue: false },
    { Icon: IcoTables, text: c("club.rules.privacy"), blue: true },
  ];

  return (
    <>
      <Seo title={t("nav.club")} description={c("club.intro")} />
      <PageHero
        title={en ? "Three rooms," : "Tre ambienti,"}
        accent={en ? "one rule." : "una regola."}
        intro={c("club.intro")}
        image="/placeholders/locale-01.webp"
      />

      {/* gli ambienti: i due tubi si alternano scendendo */}
      <section className="container-site space-y-20 pt-section md:space-y-28">
        {ROOMS.map((r, i) => (
          <article key={r.key} className="grid gap-8 md:grid-cols-12 md:items-center">
            <div className={i % 2 ? "md:order-2 md:col-span-7 md:col-start-6" : "md:col-span-7"}>
              <img src={r.img} alt="" width={1600} height={1067} loading="lazy" className="aspect-[3/2] w-full rounded-card border border-line object-cover" />
            </div>
            <div className={i % 2 ? "md:col-span-4" : "md:col-span-4 md:col-start-9"}>
              <h2 className={cn("tube text-2xl", i % 2 ? "tube-blue" : "tube-pink")}>{en ? r.en : r.it}</h2>
              <p className="mt-5 text-ink-dim md:text-lg">{c(`club.room.${r.key}`)}</p>
            </div>
          </article>
        ))}
      </section>

      {/* la storia, a tappe lungo un tubo verticale */}
      <section className="pt-section" aria-labelledby="story">
        <div className="container-site grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 id="story" className="h2 tube-blue text-2xl">
              {en ? "A story made of nights" : "Una storia fatta di notti"}
            </h2>
          </div>
          <ol className="relative md:col-span-7 md:col-start-6">
            <span className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-pink via-line to-transparent" aria-hidden />
            {steps?.map((st, i) => (
              <li key={i} className="relative pb-12 pl-10 last:pb-0">
                <span className="absolute left-0 top-2 size-[15px] rounded-full bg-wall shadow-[inset_0_0_0_1.5px_rgb(var(--pink)),0_0_10px_rgb(var(--pink)/0.5)]" aria-hidden />
                <p className="tnum label font-mono text-ink-faint">{l(st.year)}</p>
                <h3 className="tube mt-2 text-xl text-ink">{l(st.title)}</h3>
                <p className="mt-2 max-w-prose text-ink-dim">{l(st.text)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* le regole della casa, a righe con filetti */}
      <section className="container-site pt-section" aria-labelledby="rules">
        <h2 id="rules" className="h2 tube-pink max-w-3xl">
          {en ? "House rules" : "Le regole della casa"}
        </h2>
        <ul className="m-0 grid list-none border-t border-line p-0 md:grid-cols-2 md:gap-x-16">
          {rules.map(({ Icon, text, blue }) => (
            <li key={text} className="grid grid-cols-[48px_minmax(0,1fr)] items-start gap-4 border-b border-line py-6">
              <Icon className={cn(blue && "ico-blue")} />
              <p className="m-0 text-ink-dim">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* info pratiche */}
      <section className="container-site pt-section" aria-labelledby="info">
        <h2 id="info" className="sr-only">
          {t("home.info")}
        </h2>
        <ul className="m-0 grid list-none border-t border-line p-0">
          {[
            [t("home.entry"), l(s?.entry_prices)],
            [t("home.drinks"), l(s?.drink_prices)],
            [t("home.hours"), l(s?.opening_hours)],
            [t("contacts.directions"), s?.address_venue],
          ].map(([k, v]) => (
            <li key={k} className="leader border-b border-line py-5">
              <span className="text-ink">{k}</span>
              <span className="text-right text-ink-dim">{v}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 max-w-prose text-ink-dim">{c("club.directions")}</p>
      </section>
    </>
  );
}
