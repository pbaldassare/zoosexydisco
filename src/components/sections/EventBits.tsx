import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { EventItem } from "@/data/types";
import { eventStatus } from "@/data/events";
import { Badge } from "@/components/ui/badge";
import { useLang, useL } from "@/hooks/useLang";
import { fmt } from "@/lib/format";
import { pathFor } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Data come su un biglietto: numero grande in Bodoni, giorno e mese in Syne. */
export function DateStamp({ iso, size = "md", className }: { iso: string; size?: "md" | "lg"; className?: string }) {
  const lang = useLang();
  const d = new Date(iso);
  return (
    <div className={cn("flex items-end gap-3", className)}>
      <span className={cn("font-display font-bold leading-[0.8] text-ink", size === "lg" ? "text-[88px] md:text-4xl" : "text-[56px]")}>{fmt.dayNum(d)}</span>
      <span className="label flex flex-col pb-1 text-2xs leading-tight text-accent">
        <span>{fmt.weekday(d, lang)}</span>
        <span className="text-ink-dim">
          {fmt.month(d, lang)} {d.getFullYear()}
        </span>
      </span>
    </div>
  );
}

export function EventBadges({ e }: { e: EventItem }) {
  const { t } = useTranslation();
  const status = eventStatus(e);
  return (
    <div className="flex flex-wrap gap-2">
      {status === "tonight" && <Badge tone="hot">{t("badge.tonight")}</Badge>}
      {e.members_only && <Badge tone="accent">{t("badge.membersOnly")}</Badge>}
      {e.is_sample && <Badge tone="sample">{t("badge.sample")}</Badge>}
    </div>
  );
}

export function EventCard({ e, muted = false }: { e: EventItem; muted?: boolean }) {
  const lang = useLang();
  const l = useL();
  const d = new Date(e.starts_at);
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-surface">
        <img
          src={e.cover_path}
          alt=""
          width={1600}
          height={900}
          loading="lazy"
          decoding="async"
          className={cn(
            "h-full w-full object-cover transition-transform duration-700 ease-expo group-hover:scale-[1.04]",
            muted && "grayscale-[0.6] brightness-75",
          )}
        />
        <div className="absolute inset-x-0 top-0 flex justify-between p-3">
          <EventBadges e={e} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4">
          <span className="font-display text-[44px] font-bold leading-none text-ink">{fmt.dayNum(d)}</span>
          <span className="label ml-2 text-2xs text-accent">{fmt.month(d, lang)}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col border-b border-line py-5">
        <h3 className="text-xl">
          <Link to={pathFor("event", lang, { slug: e.slug })} className="after:absolute after:inset-0 hover:text-accent">
            {l(e.title)}
          </Link>
        </h3>
        <p className="label mt-3 text-2xs text-ink-dim">{l(e.dress_code)}</p>
      </div>
    </article>
  );
}
