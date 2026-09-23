import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Lightbox } from "@/components/media/Lightbox";
import { ProtectedImage } from "@/components/media/ProtectedImage";
import { Seo } from "@/components/ui/seo";
import { useEvents, useMedia } from "@/hooks/useData";
import { useL } from "@/hooks/useLang";
import { GalleryHeader } from "@/components/media/GalleryHeader";
import { useVeil } from "@/hooks/useVeil";
import { cn } from "@/lib/utils";

const PAGE = 24;

export default function GalleryPhotos() {
  const { t } = useTranslation();
  const l = useL();
  const { data: all = [] } = useMedia({ kind: "image", placement: "gallery" });
  const { data: events = [] } = useEvents();
  const [eventId, setEventId] = useState("");
  const [count, setCount] = useState(PAGE);
  const [open, setOpen] = useState<number | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const veiled = useVeil();

  const items = useMemo(() => all.filter((m) => !eventId || m.event_id === eventId), [all, eventId]);
  const shown = items.slice(0, count);
  const withPhotos = events.filter((e) => all.some((m) => m.event_id === e.id));
  const titleOf = (id?: string) => l(events.find((e) => e.id === id)?.title) || "ZOO";

  // Caricamento progressivo allo scroll, a pagine da 24.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && setCount((c) => c + PAGE), { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [items.length]);

  return (
    <>
      <Seo title={t("gallery.photos")} description={t("nav.gallery")} />
      <GalleryHeader active="photos" events={withPhotos} value={eventId} onChange={(v) => { setEventId(v); setCount(PAGE); }} />
      <section className="container-site pb-24">
        {shown.length === 0 ? (
          <p className="text-ink-dim">{t("gallery.empty")}</p>
        ) : (
          <ul className={cn("columns-2 gap-3 md:columns-3 md:gap-4 xl:columns-4", veiled && "gallery-veiled")}>
            {shown.map((m, i) => (
              <li key={m.id} className="mb-3 break-inside-avoid md:mb-4">
                <button type="button" onClick={() => setOpen(i)} className="group block w-full" aria-label={`${titleOf(m.event_id)} · ${i + 1}`}>
                  <ProtectedImage
                    src={m.path}
                    thumb={m.thumb_path}
                    width={m.width}
                    height={m.height}
                    alt={l(m.alt) || titleOf(m.event_id)}
                    sizes="(min-width: 1400px) 25vw, (min-width: 860px) 33vw, 50vw"
                    className="rounded-tile border border-line"
                    imgClassName="transition-transform duration-700 ease-expo group-hover:scale-[1.03]"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
        {count < items.length && <div ref={sentinel} className="h-10" aria-hidden />}
      </section>
      <Lightbox items={shown} index={open} onIndex={setOpen} onClose={() => setOpen(null)} altFor={(m) => l(m.alt) || titleOf(m.event_id)} />
    </>
  );
}
