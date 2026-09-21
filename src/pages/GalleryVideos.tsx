import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { GalleryHeader } from "@/components/media/GalleryHeader";
import { VideoCard } from "@/components/media/VideoPlayer";
import { Seo } from "@/components/ui/seo";
import { useEvents, useMedia } from "@/hooks/useData";
import { useL } from "@/hooks/useLang";
import { useVeil } from "@/hooks/useVeil";
import { cn } from "@/lib/utils";

export default function GalleryVideos() {
  const { t } = useTranslation();
  const l = useL();
  const { data: all = [] } = useMedia({ kind: "video", placement: "gallery" });
  const { data: events = [] } = useEvents();
  const [eventId, setEventId] = useState("");
  const veiled = useVeil();
  const items = useMemo(() => all.filter((m) => !eventId || m.event_id === eventId), [all, eventId]);
  const withVideos = events.filter((e) => all.some((m) => m.event_id === e.id));

  return (
    <>
      <Seo title={t("gallery.videos")} description={t("nav.gallery")} />
      <GalleryHeader active="videos" events={withVideos} value={eventId} onChange={setEventId} />
      <section className="container-site pb-24">
        {items.length === 0 ? (
          <p className="text-ink-dim">{t("gallery.empty")}</p>
        ) : (
          <ul className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", veiled && "gallery-veiled")}>
            {items.map((m) => (
              <li key={m.id}>
                <VideoCard media={m} label={l(events.find((e) => e.id === m.event_id)?.title) || "ZOO"} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
