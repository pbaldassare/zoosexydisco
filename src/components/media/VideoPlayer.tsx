import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Lock, Play, X } from "lucide-react";
import type { Media } from "@/data/types";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useVeil } from "@/hooks/useVeil";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";

/**
 * Player dei video: al clic chiede a sign-media un URL firmato di 300 secondi.
 * Nessun URL permanente nel DOM, niente download, niente picture-in-picture.
 */
function PlayerDialog({ media, label, onClose }: { media: Media; label: string; onClose: () => void }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState<string | null | undefined>(undefined);
  const veiled = useVeil();
  useFocusTrap(ref, true, onClose);

  useEffect(() => {
    let alive = true;
    void api.signMedia(media.id).then((u) => alive && setUrl(u));
    return () => {
      alive = false;
    };
  }, [media.id]);

  return createPortal(
    <div ref={ref} role="dialog" aria-modal="true" aria-label={label} className="fixed inset-0 z-[80] flex flex-col bg-bg/95 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="label text-ink-dim">{label}</span>
        <button onClick={onClose} className="grid size-12 place-items-center text-ink hover:text-accent" aria-label={t("gallery.close")}>
          <X className="size-6" />
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        <div className={cn("protected relative w-full max-w-5xl bg-surface", veiled && "gallery-veiled")} style={{ aspectRatio: `${media.width} / ${media.height}` }} onContextMenu={(e) => e.preventDefault()}>
          {url ? (
            <video
              src={url}
              poster={media.poster_path}
              controls
              autoPlay
              playsInline
              controlsList="nodownload noplaybackrate"
              disablePictureInPicture
              className="h-full w-full"
            />
          ) : (
            <>
              <img src={media.poster_path} alt="" className="h-full w-full object-cover brightness-50" draggable={false} />
              <div className="absolute inset-0 grid place-items-center p-6 text-center">
                <p className="flex max-w-sm flex-col items-center gap-3 text-ink">
                  <Lock className="size-6 text-accent" aria-hidden />
                  {url === undefined ? "…" : t("gallery.videoPending")}
                </p>
              </div>
            </>
          )}
          <span className="watermark" aria-hidden />
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function VideoCard({ media, label }: { media: Media; label: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="group relative block w-full overflow-hidden text-left" aria-label={`${t("gallery.play")}: ${label}`}>
        <div className="protected relative aspect-video bg-surface" onContextMenu={(e) => e.preventDefault()}>
          <img src={media.thumb_path} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover transition-transform duration-700 ease-expo group-hover:scale-[1.04]" />
          <span className="watermark" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/85 to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ink/50 bg-bg/40 backdrop-blur transition-colors group-hover:border-accent group-hover:text-accent">
            <Play className="ml-1 size-6 fill-current" aria-hidden />
          </span>
          <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3">
            <span className="font-display text-lg text-ink">{label}</span>
            {media.duration_s && <span className="label text-2xs text-ink-dim">{fmt.duration(media.duration_s)}</span>}
          </div>
        </div>
      </button>
      {open && <PlayerDialog media={media} label={label} onClose={() => setOpen(false)} />}
    </>
  );
}
