import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Clock, Shirt, Ticket } from "lucide-react";
import { DateStamp, EventBadges } from "@/components/sections/EventBits";
import { Lightbox } from "@/components/media/Lightbox";
import { ProtectedImage } from "@/components/media/ProtectedImage";
import { VideoCard } from "@/components/media/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/ui/seo";
import { eventStatus } from "@/data/events";
import { useEvent, useMedia, useSettings } from "@/hooks/useData";
import { useLang, useL } from "@/hooks/useLang";
import { useVeil } from "@/hooks/useVeil";
import { fmt } from "@/lib/format";
import { eventJsonLd } from "@/lib/jsonld";
import { pathFor } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/whatsapp";
import NotFound from "./NotFound";

export default function EventDetail() {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const lang = useLang();
  const l = useL();
  const { data: e, isLoading } = useEvent(slug);
  const { data: s } = useSettings();
  const { data: media = [] } = useMedia({ eventId: e?.id });
  const [open, setOpen] = useState<number | null>(null);
  const veiled = useVeil();

  if (isLoading) return <div className="min-h-screen" />;
  if (!e) return <NotFound message={t("events.notFound")} />;

  const start = new Date(e.starts_at);
  const end = new Date(e.ends_at);
  const photos = media.filter((m) => m.kind === "image");
  const videos = media.filter((m) => m.kind === "video");
  const wa = waLink(s?.whatsapp ?? "", t("events.waText", { title: l(e.title), date: fmt.short(start, lang) }));
  const url = pathFor("event", lang, { slug: e.slug });
  const archived = eventStatus(e) === "archived";

  return (
    <>
      <Seo title={l(e.title)} description={l(e.description)} image={e.cover_path} jsonLd={eventJsonLd(e, lang, url)} />

      <section className="relative min-h-[88svh] overflow-hidden">
        <img src={e.cover_path} alt="" width={1600} height={900} {...{ fetchpriority: "high" }} className="absolute inset-0 h-full w-full object-cover brightness-[0.55]" />
        <div className="absolute inset-0 bg-gradient-to-t from-wall via-wall/50 to-transparent" aria-hidden />
        <div className="grain absolute inset-0" aria-hidden />
        <div className="container-site relative flex min-h-[88svh] flex-col justify-end pb-12 pt-[calc(var(--header-h)+2rem)]">
          <Link to={pathFor("events", lang)} className="label mb-auto inline-flex min-h-11 items-center gap-2 self-start text-ink-faint no-underline transition-colors hover:text-pink-core">
            <ArrowLeft className="size-4" aria-hidden /> {t("cta.allEvents")}
          </Link>
          <EventBadges e={e} />
          <h1 className="tube tube-pink hero-step mt-5 max-w-5xl text-4xl">{l(e.title)}</h1>
          <div className="hero-step mt-8 flex flex-wrap items-end gap-x-12 gap-y-6 [animation-delay:150ms]">
            <DateStamp iso={e.starts_at} size="lg" />
            {!archived && (
              <Button asChild size="lg">
                <a href={wa} target="_blank" rel="noopener">
                  {t("cta.bookTable")}
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="container-site grid gap-12 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-7">
          <p className="text-lg leading-relaxed text-ink md:text-xl">{l(e.description)}</p>
        </div>
        <dl className="space-y-8 md:col-span-4 md:col-start-9">
          <div className="flex gap-4">
            <Clock className="mt-0.5 size-5 shrink-0 text-pink" aria-hidden />
            <div>
              <dt className="label text-ink-faint">{t("events.when")}</dt>
              <dd className="mt-1 text-ink first-letter:uppercase">
                {fmt.long(start, lang)}
                <br />
                {fmt.time(start, lang)} – {fmt.time(end, lang)}
              </dd>
            </div>
          </div>
          <div className="flex gap-4">
            <Shirt className="mt-0.5 size-5 shrink-0 text-blue" aria-hidden />
            <div>
              <dt className="label text-ink-faint">{t("home.dressCode")}</dt>
              <dd className="mt-1 text-ink">{l(e.dress_code)}</dd>
            </div>
          </div>
          <div className="flex gap-4">
            <Ticket className="mt-0.5 size-5 shrink-0 text-pink" aria-hidden />
            <div>
              <dt className="label text-ink-faint">{t("events.entry")}</dt>
              <dd className="mt-1 text-ink">{l(e.entry)}</dd>
            </div>
          </div>
        </dl>
      </section>

      <section className="container-site pb-24" aria-labelledby="ev-gal">
        <h2 id="ev-gal" className="h2 tube-blue text-2xl">
          {t("events.gallery")}
        </h2>
        {media.length === 0 ? (
          <p className="text-ink-dim">{t("events.galleryEmpty")}</p>
        ) : (
          <>
            <ul className={cn("grid grid-cols-2 gap-3 md:grid-cols-4", veiled && "gallery-veiled")}>
              {photos.map((m, i) => (
                <li key={m.id}>
                  <button type="button" onClick={() => setOpen(i)} className="block w-full" aria-label={`${l(e.title)} · ${i + 1}`}>
                    <ProtectedImage src={m.thumb_path} width={m.width} height={m.height} alt="" className="aspect-square rounded-tile border border-line" />
                  </button>
                </li>
              ))}
            </ul>
            {videos.length > 0 && (
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((v) => (
                  <li key={v.id}>
                    <VideoCard media={v} label={l(e.title)} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
      <Lightbox items={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} altFor={() => l(e.title)} />
    </>
  );
}
