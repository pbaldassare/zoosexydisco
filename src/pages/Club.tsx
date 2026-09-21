import { useTranslation } from "react-i18next";
import { CameraOff, EyeOff, Hand, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { Seo } from "@/components/ui/seo";
import { useContent, useSettings, useTimeline } from "@/hooks/useData";
import { useL } from "@/hooks/useLang";

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
    { icon: ShieldCheck, text: c("club.rules.age") },
    { icon: CameraOff, text: c("club.rules.photo"), lead: true },
    { icon: EyeOff, text: c("club.rules.privacy") },
    { icon: Hand, text: c("club.rules.respect") },
  ];

  return (
    <>
      <Seo title={t("nav.club")} description={c("club.intro")} />
      <PageHero label={t("nav.club")} title={en ? "Three rooms," : "Tre ambienti,"} accent={en ? "one rule." : "una regola."} intro={c("club.intro")} image="/placeholders/locale-01.webp" />

      {/* ambienti */}
      <section className="container-site space-y-20 py-20 md:space-y-32 md:py-28">
        {ROOMS.map((r, i) => (
          <article key={r.key} className="grid gap-8 md:grid-cols-12 md:items-center">
            <div className={i % 2 ? "md:order-2 md:col-span-7 md:col-start-6" : "md:col-span-7"}>
              <img src={r.img} alt="" width={1600} height={1067} loading="lazy" className="aspect-[3/2] w-full object-cover" />
            </div>
            <div className={i % 2 ? "md:col-span-4" : "md:col-span-4 md:col-start-9"}>
              <h2 className="text-2xl md:text-3xl">{en ? r.en : r.it}</h2>
              <p className="mt-5 text-ink-dim md:text-lg">{c(`club.room.${r.key}`)}</p>
            </div>
          </article>
        ))}
      </section>

      {/* storia */}
      <section className="border-y border-line bg-surface/30 py-20 md:py-28" aria-labelledby="story">
        <div className="container-site grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="label mb-4 text-accent">{t("home.story")}</p>
            <h2 id="story" className="text-2xl md:text-3xl">
              {en ? "A story made of" : "Una storia fatta di"} <em className="accent-word">{en ? "nights" : "notti"}</em>
            </h2>
          </div>
          <ol className="relative md:col-span-7 md:col-start-6">
            <span className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-accent via-line to-transparent" aria-hidden />
            {steps?.map((st, i) => (
              <li key={i} className="relative pb-12 pl-10 last:pb-0">
                <span className="absolute left-0 top-2 size-[15px] rounded-full border border-accent bg-bg" aria-hidden />
                <p className="label text-2xs text-accent">{l(st.year)}</p>
                <h3 className="mt-2 text-xl">{l(st.title)}</h3>
                <p className="mt-2 max-w-prose text-ink-dim">{l(st.text)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* regole della casa */}
      <section className="container-site py-20 md:py-28" aria-labelledby="rules">
        <h2 id="rules" className="max-w-3xl text-2xl md:text-3xl">
          {en ? "House rules" : "Le regole della casa"}
        </h2>
        <ul className="mt-12 grid gap-px bg-line md:grid-cols-2">
          {rules.map(({ icon: Icon, text, lead }) => (
            <li key={text} className="flex gap-5 bg-bg p-6 md:p-8">
              <Icon className="mt-1 size-5 shrink-0 text-accent" aria-hidden />
              <p className={lead ? "font-display text-xl italic leading-snug text-ink" : "text-ink-dim md:text-lg"}>{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* info pratiche */}
      <section className="container-site pb-24" aria-labelledby="info">
        <div className="grid gap-10 border-t border-line pt-12 md:grid-cols-3">
          <h2 id="info" className="sr-only">
            {t("home.info")}
          </h2>
          {[
            [t("home.entry"), l(s?.entry_prices)],
            [t("home.drinks"), l(s?.drink_prices)],
            [t("home.hours"), l(s?.opening_hours)],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="label mb-2 text-2xs text-accent">{k}</p>
              <p className="text-ink">{v}</p>
            </div>
          ))}
          <div className="md:col-span-3">
            <p className="label mb-2 text-2xs text-accent">{t("contacts.directions")}</p>
            <p className="text-ink">{s?.address_venue}</p>
            <p className="mt-1 text-ink-dim">{c("club.directions")}</p>
          </div>
        </div>
      </section>
    </>
  );
}
