import { useTranslation } from "react-i18next";
import { ClubFeatures, RulesPanel } from "@/components/sections/ClubBits";
import { PageHero } from "@/components/sections/PageHero";
import { Seo } from "@/components/ui/seo";
import { useContent, useMedia, useSettings } from "@/hooks/useData";
import { useL } from "@/hooks/useLang";
import { cn } from "@/lib/utils";

/**
 * I tre ambienti. Le foto NON stanno qui: arrivano dai media con collocazione
 * «club», in ordine di `sort`. Così il gestore le sostituirà dal pannello
 * admin senza che nessuno tocchi il codice. Finché non ce ne sono, restano
 * le immagini di esempio indicate qui sotto.
 */
const ROOMS = [
  { key: "sala", fallback: "/placeholders/locale-02.webp", it: "La sala", en: "The main room" },
  { key: "tavoli", fallback: "/placeholders/locale-03.webp", it: "I tavoli", en: "The tables" },
  { key: "prive", fallback: "/placeholders/locale-04.webp", it: "Il privé", en: "The private room" },
] as const;

export default function Club() {
  const { t, i18n } = useTranslation();
  const c = useContent();
  const l = useL();
  const { data: s } = useSettings();
  const { data: roomPhotos = [] } = useMedia({ kind: "image", placement: "club" });
  const en = i18n.language === "en";

  return (
    <>
      <Seo title={t("nav.club")} description={c("club.intro")} />
      <PageHero
        title={en ? "Three rooms," : "Tre ambienti,"}
        accent={en ? "one rule." : "una regola."}
        intro={c("club.intro")}
        image="/photos/foto-pedana.webp"
        imagePosition="50% 78%"
      />

      {/* chi siamo e cosa si trova: l'apertura della pagina */}
      <section className="relative z-[1] pt-section" aria-labelledby="chi-t">
        <div className="container-site grid gap-10 md:grid-cols-2 md:items-start md:gap-16">
          <div>
            <h2 className="h2 tube-blue" id="chi-t">
              {t("nav.club")}
            </h2>
            <p className="max-w-[56ch] text-ink-dim">
              <strong className="font-bold text-ink">{c("home.club.p1")}</strong>
            </p>
            <p className="mt-4 max-w-[56ch] text-ink-dim">{c("home.club.p2")}</p>
          </div>
          <ClubFeatures />
        </div>
      </section>

      {/* l'esperienza: il racconto del locale */}
      <section className="relative z-[1] pt-section" aria-labelledby="esperienza-t">
        <div className="container-site grid gap-8 md:grid-cols-12">
          <h2 className="h2 tube-pink text-2xl md:col-span-4" id="esperienza-t">
            {c("club.experience.title")}
          </h2>
          <div className="grid gap-5 text-ink-dim md:col-span-7 md:col-start-6 md:text-lg">
            <p className="m-0">{c("club.experience.p1")}</p>
            <p className="m-0">{c("club.experience.p2")}</p>
            <p className="m-0">{c("club.experience.p3")}</p>
          </div>
        </div>
      </section>

      {/* gli ambienti: i due tubi si alternano scendendo */}
      <section className="container-site space-y-20 pt-section md:space-y-28" aria-labelledby="ambienti">
        <h2 id="ambienti" className="sr-only">
          {en ? "The three rooms" : "I tre ambienti"}
        </h2>
        {ROOMS.map((r, i) => (
          <article key={r.key} className="grid gap-8 md:grid-cols-12 md:items-center">
            <div className={i % 2 ? "md:order-2 md:col-span-7 md:col-start-6" : "md:col-span-7"}>
              <img
                src={roomPhotos[i]?.path ?? r.fallback}
                alt=""
                width={roomPhotos[i]?.width ?? 1600}
                height={roomPhotos[i]?.height ?? 1067}
                loading="lazy"
                className="aspect-[3/2] w-full rounded-card border border-line object-cover"
              />
            </div>
            <div className={i % 2 ? "md:col-span-4" : "md:col-span-4 md:col-start-9"}>
              <h3 className={cn("tube text-2xl", i % 2 ? "tube-blue" : "tube-pink")}>{en ? r.en : r.it}</h3>
              <p className="mt-5 text-ink-dim md:text-lg">{c(`club.room.${r.key}`)}</p>
            </div>
          </article>
        ))}
      </section>

      {/* il ricambio delle artiste, e la chiusa */}
      <section className="relative z-[1] pt-section" aria-labelledby="nuovo-t">
        <div className="container-site grid gap-8 md:grid-cols-12">
          <h2 className="h2 tube-blue text-2xl md:col-span-4" id="nuovo-t">
            {c("club.new.title")}
          </h2>
          <div className="md:col-span-7 md:col-start-6">
            <p className="m-0 text-ink-dim md:text-lg">{c("club.new.body")}</p>
            {/* la chiusa: l'unica frase della pagina che alza la voce */}
            <p className="tube tube-pink mt-10 max-w-[22ch] text-2xl">{c("club.new.closing")}</p>
          </div>
        </div>
      </section>

      {/* le regole della casa: lo stesso pannello della home */}
      <RulesPanel />

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
