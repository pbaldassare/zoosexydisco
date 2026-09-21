import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { HouseRules } from "@/components/sections/HouseRules";
import { HeroMark } from "@/components/sections/HeroMark";
import { DateStamp, EventBadges } from "@/components/sections/EventBits";
import { ProtectedImage } from "@/components/media/ProtectedImage";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/ui/seo";
import { useActiveTheme, useContent, useMedia, useNextEvent, useSettings } from "@/hooks/useData";
import { useLang, useL } from "@/hooks/useLang";
import { fmt } from "@/lib/format";
import { pathFor, type RouteKey } from "@/lib/routes";
import { waLink } from "@/lib/whatsapp";
import { nightClubJsonLd } from "@/lib/jsonld";

function Hero() {
  const { t } = useTranslation();
  const c = useContent();
  const lang = useLang();
  const l = useL();
  const { data: theme } = useActiveTheme();
  const { data: next } = useNextEvent();
  const { data: s } = useSettings();
  const nextHref = next ? pathFor("event", lang, { slug: next.slug }) : pathFor("events", lang);
  const waText = next
    ? t("events.waText", { title: l(next.title), date: fmt.short(new Date(next.starts_at), lang) })
    : t("events.waGeneric");

  return (
    <section className="relative h-[100svh] min-h-[640px] overflow-hidden" aria-labelledby="hero-title">
      {theme && <HeroMark image={theme.hero_image_path} video={theme.hero_video_path} />}
      <div className="container-site relative flex h-full flex-col justify-end pb-28 md:pb-16">
        <h1 id="hero-title" className="sr-only">
          ZOO Sexy Disco · Madone (BG)
        </h1>
        <div className="mx-auto max-w-2xl text-center">
          <p className="hero-step font-display text-xl italic leading-tight text-ink text-shadow-soft [animation-delay:550ms] md:text-2xl">{c("home.hero.line")}</p>
          <div className="hero-step mt-8 flex flex-col items-stretch justify-center gap-3 [animation-delay:700ms] sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link to={nextHref}>
                {t("cta.nextNight")} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={waLink(s?.whatsapp ?? "", waText)} target="_blank" rel="noopener">
                {t("cta.bookTable")}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

const QUICK: Array<{ key: RouteKey; label: string }> = [
  { key: "club", label: "quick.club" },
  { key: "events", label: "quick.themes" },
  { key: "shows", label: "quick.shows" },
  { key: "parties", label: "quick.parties" },
  { key: "photos", label: "quick.gallery" },
  { key: "work", label: "quick.work" },
];

function QuickLinks() {
  const { t } = useTranslation();
  const lang = useLang();
  return (
    <nav aria-label="Link rapidi" className="border-y border-line">
      <ul className="container-site flex gap-2 overflow-x-auto py-4 [scrollbar-width:none] md:justify-center">
        {QUICK.map((q) => (
          <li key={q.key} className="shrink-0">
            <Link
              to={pathFor(q.key, lang)}
              className="label inline-flex min-h-11 items-center rounded-full border border-line px-5 text-2xs text-ink-dim transition-colors hover:border-accent hover:text-accent"
            >
              {t(q.label)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function NextNight() {
  const { t } = useTranslation();
  const lang = useLang();
  const l = useL();
  const { data: e, isLoading } = useNextEvent();
  if (isLoading) return <div className="min-h-[60vh]" />;

  return (
    <section className="container-site py-20 md:py-32" aria-labelledby="next-title">
      <p className="label mb-8 text-accent">{t("home.next")}</p>
      {!e ? (
        <p className="max-w-prose text-lg text-ink-dim">{t("home.noNext")}</p>
      ) : (
        <div className="grid gap-10 md:grid-cols-12 md:items-center">
          <Link to={pathFor("event", lang, { slug: e.slug })} className="group relative block overflow-hidden md:col-span-7" tabIndex={-1} aria-hidden>
            <img
              src={e.cover_path}
              alt=""
              width={1600}
              height={900}
              loading="lazy"
              className="aspect-[16/10] w-full object-cover transition-transform duration-1000 ease-expo group-hover:scale-[1.03]"
            />
            <div className="absolute left-3 top-3">
              <EventBadges e={e} />
            </div>
          </Link>
          <div className="md:col-span-5">
            <DateStamp iso={e.starts_at} size="lg" />
            <h2 id="next-title" className="mt-6 text-2xl md:text-3xl">
              {l(e.title)}
            </h2>
            <dl className="mt-6 space-y-1">
              <dt className="label text-2xs text-ink-dim">{t("home.dressCode")}</dt>
              <dd className="font-display text-lg italic text-ink">{l(e.dress_code)}</dd>
            </dl>
            <Button asChild className="mt-8">
              <Link to={pathFor("event", lang, { slug: e.slug })}>
                {t("cta.discover")} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function ClubBrief() {
  const { t } = useTranslation();
  const c = useContent();
  const l = useL();
  const lang = useLang();
  const { data: s } = useSettings();
  return (
    <section className="relative overflow-hidden py-20 md:py-28" aria-labelledby="club-title">
      <div className="container-site grid gap-12 md:grid-cols-12 md:items-center">
        <div className="relative md:order-2 md:col-span-6 md:col-start-7">
          <img src="/placeholders/locale-01.webp" alt="" width={1600} height={1067} loading="lazy" className="aspect-[4/5] w-full object-cover md:aspect-[4/3]" />
          <div className="absolute -bottom-6 -left-6 hidden h-40 w-40 border border-accent/40 md:block" aria-hidden />
        </div>
        <div className="md:col-span-5">
          <p className="label mb-4 text-accent">{t("nav.club")}</p>
          <h2 id="club-title" className="text-2xl md:text-3xl">
            {c("home.club.title")}
          </h2>
          <p className="mt-6 max-w-prose text-ink-dim md:text-lg">{c("home.club.body")}</p>
          <div className="mt-10 border border-line bg-surface/50 p-6">
            <p className="label mb-4 text-2xs text-accent">{t("home.info")}</p>
            <ul className="space-y-3 text-sm">
              <li className="leader">
                <span className="text-ink">{t("home.entry")}</span>
                <span className="text-right text-ink-dim">{l(s?.entry_prices)}</span>
              </li>
              <li className="leader">
                <span className="text-ink">{t("home.drinks")}</span>
                <span className="text-right text-ink-dim">{l(s?.drink_prices)}</span>
              </li>
              <li className="leader">
                <span className="text-ink">{t("home.hours")}</span>
                <span className="text-right text-ink-dim">{l(s?.opening_hours)}</span>
              </li>
            </ul>
          </div>
          <Button asChild variant="ghost" className="mt-6">
            <Link to={pathFor("club", lang)}>
              {t("nav.club")} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function GalleryTriptych() {
  const { t } = useTranslation();
  const c = useContent();
  const lang = useLang();
  const { data: shots } = useMedia({ kind: "image", placement: "home" });
  const three = (shots ?? []).slice(0, 3);
  if (three.length < 3) return null;
  const [a, b, d] = three as [(typeof three)[0], (typeof three)[0], (typeof three)[0]];

  return (
    <section className="container-site py-20 md:py-28" aria-labelledby="gal-title">
      <div className="mb-10 flex items-end justify-between gap-6">
        <h2 id="gal-title" className="text-2xl md:text-3xl">
          {c("home.gallery.title")}
        </h2>
        <Button asChild variant="ghost">
          <Link to={pathFor("photos", lang)}>
            {t("cta.openGallery")} <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-4">
        <ProtectedImage src={a.path} thumb={a.thumb_path} width={a.width} height={a.height} alt="" sizes="(min-width: 860px) 58vw, 100vw" className="col-span-2 aspect-[3/2] md:col-span-7 md:row-span-2 md:aspect-auto" />
        <ProtectedImage src={b.path} thumb={b.thumb_path} width={b.width} height={b.height} alt="" sizes="(min-width: 860px) 40vw, 50vw" className="aspect-square md:col-span-5 md:aspect-[3/2]" />
        <ProtectedImage src={d.path} thumb={d.thumb_path} width={d.width} height={d.height} alt="" sizes="(min-width: 860px) 40vw, 50vw" className="aspect-square md:col-span-5 md:aspect-[3/2]" />
      </div>
    </section>
  );
}

function StoryTeaser() {
  const { t } = useTranslation();
  const c = useContent();
  const lang = useLang();
  return (
    <section className="relative py-24 md:py-36" aria-labelledby="story-title">
      <div className="container-site">
        <div className="mx-auto max-w-4xl text-center">
          <h2 id="story-title" className="label mb-8 text-accent">
            {t("home.story")}
          </h2>
          <p className="font-display text-2xl italic leading-[1.15] text-ink md:text-3xl">{c("home.story.excerpt")}</p>
          <Link to={pathFor("club", lang)} className="label mt-10 inline-flex min-h-11 items-center gap-2 text-xs text-accent hover:text-ink">
            {t("cta.readStory")} <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const c = useContent();
  const { data: s } = useSettings();
  return (
    <>
      <Seo title="ZOO Sexy Disco · Madone (BG)" description={c("home.hero.line")} jsonLd={s ? nightClubJsonLd(s) : undefined} />
      <Hero />
      <QuickLinks />
      <NextNight />
      <ClubBrief />
      <GalleryTriptych />
      <StoryTeaser />
      <div className="container-site border-t border-line py-10">
        <HouseRules />
      </div>
    </>
  );
}
