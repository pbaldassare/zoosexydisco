import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sign } from "@/components/brand/Sign";
import { ContactButtons } from "@/components/sections/ContactButtons";
import { NightsList, OpenPanel } from "@/components/sections/OpenPanel";
import { HouseRules } from "@/components/sections/HouseRules";
import { ProtectedImage } from "@/components/media/ProtectedImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/ui/seo";
import { IcoBar, IcoCalendar, IcoShows, IcoTables, IcoAccessible, WhatsAppGlyph } from "@/components/ui/icons";
import { useContent, useEvents, useJobRoles, useMedia, useNextEvent, useSettings } from "@/hooks/useData";
import { useLang, useL } from "@/hooks/useLang";
import { fmt } from "@/lib/format";
import { nightClubJsonLd } from "@/lib/jsonld";
import { pathFor } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/whatsapp";

/* ---------- la prima schermata: l'insegna sul muro ---------- */

function SignHero() {
  const { t } = useTranslation();
  const c = useContent();

  return (
    <section className="wash-sign relative isolate z-[1] overflow-hidden pb-14 pt-[clamp(96px,14vw,150px)]" aria-labelledby="hero-t">
      <div className="photo hero-photo bg-[url('/photos/foto-pedana.webp')]" aria-hidden />
      <div className="container-site flex flex-col items-center text-center">
        <h1 id="hero-t" className="sr-only">
          {t("home.seoTitle")}
        </h1>

        <Sign />

        {/* la riga al neon: il claim, non un occhiello */}
        <p className="tube tube-blue relative m-0 mt-[-2%] animate-hum text-[clamp(26px,5vw,48px)]">{c("home.since")}</p>
        <p className="mx-auto mt-3 max-w-[40ch] text-base text-ink-dim">{c("home.heroCopy")}</p>

        <OpenPanel />
      </div>
    </section>
  );
}

/* ---------- le notti ---------- */

function Nights() {
  const c = useContent();
  return (
    <section className="relative isolate z-[1] pb-[clamp(40px,6vw,70px)] pt-section" id="notti" aria-labelledby="notti-t">
      <div className="photo nights-photo bg-[url('/photos/foto-perizoma.webp')]" aria-hidden />
      <div className="container-site">
        <h2 className="h2 tube-pink md:max-w-[62%]" id="notti-t">
          {c("home.nights.title")}
        </h2>
        <p className="lead md:max-w-[62%]">{c("home.nights.lead")}</p>
        <NightsList className="md:max-w-[62%]" />
        <div className="mt-[26px] flex max-w-[62ch] items-start gap-3.5 text-ink-dim md:max-w-[62%]">
          <IcoCalendar className="ico-blue mt-0.5 size-7 flex-none" />
          <p className="m-0">{c("home.nights.holidays")}</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- serate a tema ---------- */

function ThemeNights() {
  const { t } = useTranslation();
  const c = useContent();
  const lang = useLang();
  const l = useL();
  const { data: next } = useNextEvent();
  const { data: all } = useEvents();
  const { data: s } = useSettings();

  const rest = (all ?? []).filter((e) => e.slug !== next?.slug && Date.parse(e.starts_at) >= Date.now()).slice(0, 4);

  return (
    <section className="relative z-[1] pt-section" id="serate" aria-labelledby="serate-t">
      <div className="container-site">
        <h2 className="h2 tube-pink" id="serate-t">
          {c("home.events.title")}
        </h2>
        <p className="lead">{c("home.events.lead")}</p>

        <div className="grid gap-[22px] md:grid-cols-[1.25fr_1fr] md:items-stretch">
          {next && (
            <article className="relative isolate flex min-h-[420px] flex-col justify-end overflow-hidden rounded-card border border-line p-[clamp(22px,4vw,36px)] shadow-[0_24px_60px_rgb(0_0_0/0.55)]">
              <img src={next.cover_path} alt="" width={1600} height={900} loading="lazy" className="absolute inset-0 -z-[1] h-full w-full object-cover" />
              <div
                className="absolute inset-0 -z-[1] bg-[linear-gradient(180deg,rgb(var(--wall)/0)_25%,rgb(var(--wall)/0.9)_78%)]"
                aria-hidden
              />
              {next.is_sample && (
                <Badge tone="sample" className="absolute left-[18px] top-[18px]">
                  {t("badge.sample")}
                </Badge>
              )}
              <h3 className="tube tube-pink my-2 text-4xl">
                <Link to={pathFor("event", lang, { slug: next.slug })} className="text-inherit no-underline after:absolute after:inset-0">
                  {l(next.title)}
                </Link>
              </h3>
              <p className="mb-5 max-w-[42ch] text-ink-dim">
                <strong className="font-bold text-ink">{fmt.weekday(new Date(next.starts_at), lang)}</strong> · {l(next.dress_code)}
              </p>
              <div className="relative z-[1]">
                <Button asChild>
                  <a
                    href={waLink(s?.whatsapp ?? "", t("events.waText", { title: l(next.title), date: fmt.short(new Date(next.starts_at), lang) }))}
                    target="_blank"
                    rel="noopener"
                  >
                    <WhatsAppGlyph />
                    {t("cta.bookTable")}
                  </a>
                </Button>
              </div>
            </article>
          )}

          <div>
            <div className="grid content-start border-t border-line">
              {rest.map((e) => {
                const d = new Date(e.starts_at);
                return (
                  <Link
                    key={e.id}
                    to={pathFor("event", lang, { slug: e.slug })}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-[18px] gap-y-1 border-b border-line px-1 py-5 text-inherit no-underline transition-[background] duration-[250ms] hover:bg-[linear-gradient(90deg,rgb(var(--pink)/0.07),transparent)]"
                  >
                    <span className="label min-w-[52px] text-center font-mono text-[13px] font-medium leading-[1.25] text-ink-dim">
                      <b className="block font-neon text-[30px] font-normal leading-none text-blue-core [text-shadow:0_0_10px_rgb(var(--blue))]">
                        {fmt.dayNum(d)}
                      </b>
                      {fmt.month(d, lang)}
                    </span>
                    <span className="tube text-[clamp(26px,3.6vw,34px)] leading-[1.1] text-ink">{l(e.title)}</span>
                    <svg viewBox="0 0 24 24" className="col-start-3 row-span-2 size-[22px] text-pink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                    <span className="col-start-2 text-[15px] text-ink-dim">{l(e.dress_code)}</span>
                  </Link>
                );
              })}
            </div>
            <p className="mt-[22px]">
              <Link to={pathFor("events", lang)}>{t("cta.allNights")}</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- il locale ---------- */

const FEATS = [
  { key: "bar", Icon: IcoBar, blue: false },
  { key: "shows", Icon: IcoShows, blue: true },
  { key: "tables", Icon: IcoTables, blue: false },
  { key: "access", Icon: IcoAccessible, blue: true },
] as const;

function Club() {
  const { t } = useTranslation();
  const c = useContent();
  const lang = useLang();

  return (
    <section className="relative z-[1] pt-section" id="locale" aria-labelledby="locale-t">
      <div className="container-site grid gap-10 md:grid-cols-2 md:items-start md:gap-16">
        <div>
          <h2 className="h2 tube-blue" id="locale-t">
            {t("nav.club")}
          </h2>
          <p className="max-w-[56ch] text-ink-dim">
            <strong className="font-bold text-ink">{c("home.club.p1")}</strong>
          </p>
          <p className="mt-4 max-w-[56ch] text-ink-dim">{c("home.club.p2")}</p>
          <Button asChild variant="ghost" className="mt-6 px-0">
            <Link to={pathFor("club", lang)}>{t("nav.club")} →</Link>
          </Button>
        </div>

        <ul className="m-0 grid list-none border-t border-line p-0">
          {FEATS.map(({ key, Icon, blue }) => (
            <li key={key} className="grid grid-cols-[48px_minmax(0,1fr)] items-start gap-4 border-b border-line py-5">
              <Icon className={cn(blue && "ico-blue")} />
              <div>
                <h3 className="mb-1 mt-0.5 font-body text-lg font-bold leading-[1.3]">{c(`home.feat.${key}.title`)}</h3>
                <p className="m-0 text-[15.5px] text-ink-dim">{c(`home.feat.${key}.body`)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- regole della casa ---------- */

function Rules() {
  const c = useContent();
  return (
    <section className="relative z-[1] pt-section" aria-labelledby="regole-t">
      <div className="container-site">
        <div className="wash-panel relative isolate overflow-hidden rounded-band border border-line px-[clamp(22px,5vw,64px)] py-[clamp(34px,6vw,70px)]">
          <div className="photo rules-photo bg-[url('/photos/foto-gambe.webp')]" aria-hidden />
          <h2 className="tube tube-pink relative m-0 mb-[30px] max-w-[14ch] text-[clamp(40px,7vw,78px)]" id="regole-t">
            {c("home.rules.title")}
          </h2>
          <div className="relative md:max-w-[70%]">
            <HouseRules />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- gallery ---------- */

function Gallery() {
  const { t } = useTranslation();
  const c = useContent();
  const lang = useLang();
  const { data: shots } = useMedia({ kind: "image", placement: "home" });
  const five = (shots ?? []).slice(0, 5);
  if (!five.length) return null;

  return (
    <section className="relative z-[1] pt-section" id="gallery" aria-labelledby="gal-t">
      <div className="container-site">
        <h2 className="h2 tube-blue" id="gal-t">
          {t("nav.gallery")}
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-[1.3fr_1fr_1fr] md:grid-rows-[230px_230px]">
          {five.map((m, i) => (
            <ProtectedImage
              key={m.id}
              src={m.path}
              thumb={m.thumb_path}
              width={m.width}
              height={m.height}
              alt=""
              sizes="(min-width: 860px) 33vw, 50vw"
              className={cn(
                "aspect-[4/5] rounded-tile border border-line md:aspect-auto",
                i === 0 && "md:row-span-2",
              )}
            />
          ))}
        </div>
        <div className="mt-[18px] flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-ink-faint">
          <Link to={pathFor("photos", lang)}>{t("gallery.photos")}</Link>
          <Link to={pathFor("videos", lang)}>{t("gallery.videos")}</Link>
          <span>{c("home.gallery.note")}</span>
        </div>
      </div>
    </section>
  );
}

/* ---------- lavora con noi ---------- */

function Work() {
  const { t } = useTranslation();
  const c = useContent();
  const lang = useLang();
  const l = useL();
  const { data: roles } = useJobRoles();

  return (
    <section className="relative z-[1] pt-section" id="lavora" aria-labelledby="job-t">
      <div className="container-site grid items-end gap-[30px] md:grid-cols-[1.1fr_0.9fr] md:gap-16">
        <div>
          <h2 className="h2 tube-pink" id="job-t">
            {c("home.job.title")}
          </h2>
          <p className="lead mb-0">{c("home.job.lead")}</p>
        </div>
        <div>
          <ul className="m-0 mb-[26px] flex list-none flex-wrap gap-2.5 p-0">
            {(roles ?? []).map((r) => (
              <li key={r.id} className="rounded-pill border border-line bg-panel px-3.5 py-2.5 text-[15px] text-ink">
                {l(r.name)}
              </li>
            ))}
          </ul>
          <Button asChild variant="outline">
            <Link to={pathFor("work", lang)}>{t("cta.apply")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------- la home ---------- */

export default function Home() {
  const { t } = useTranslation();
  const c = useContent();
  const { data: s } = useSettings();

  return (
    <>
      <Seo title={t("home.seoTitle")} description={c("home.heroCopy")} jsonLd={s ? nightClubJsonLd(s) : undefined} />
      <SignHero />
      <Nights />
      <ThemeNights />
      <Club />
      <Rules />
      <Gallery />
      <Work />
      {/* Il contatto torna a portata di pollice prima della newsletter. */}
      <div className="container-site pt-section">
        <ContactButtons text={t("events.waGeneric")} />
      </div>
    </>
  );
}
