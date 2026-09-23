import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { EventItem } from "@/data/types";
import { eventStatus } from "@/data/events";
import { Badge } from "@/components/ui/badge";
import { useLang, useL } from "@/hooks/useLang";
import { fmt } from "@/lib/format";
import { pathFor } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** La data come sul tabellone: il numero è un tubo blu, giorno e mese in mono. */
export function DateStamp({ iso, size = "md", className }: { iso: string; size?: "md" | "lg"; className?: string }) {
  const lang = useLang();
  const d = new Date(iso);
  return (
    <div className={cn("flex items-end gap-3", className)}>
      <span
        className={cn(
          "tube tube-blue leading-none",
          size === "lg" ? "text-[72px] md:text-[96px]" : "text-[52px]",
        )}
      >
        {fmt.dayNum(d)}
      </span>
      <span className="tnum flex flex-col pb-1.5 font-mono text-[13px] font-medium uppercase leading-tight tracking-label text-ink-dim">
        <span>{fmt.weekday(d, lang)}</span>
        <span className="text-ink-faint">
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
      <div className="relative overflow-hidden rounded-card border border-line bg-panel">
        <img
          src={e.cover_path}
          alt=""
          width={1600}
          height={900}
          loading="lazy"
          decoding="async"
          className={cn(
            "aspect-[16/10] h-full w-full object-cover transition-transform duration-700 ease-expo group-hover:scale-[1.04]",
            muted && "grayscale-[0.6] brightness-75",
          )}
        />
        <div className="absolute inset-x-0 top-0 flex justify-between p-3">
          <EventBadges e={e} />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--wall)/0)_45%,rgb(var(--wall)/0.85)_100%)]" aria-hidden />
        <div className="absolute bottom-3 left-4 flex items-baseline gap-2">
          <span className="tube tube-blue text-[40px] leading-none">{fmt.dayNum(d)}</span>
          <span className="label font-mono text-[13px] text-ink-dim">{fmt.month(d, lang)}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col border-b border-line py-5">
        <h3 className="tube text-xl text-ink transition-colors group-hover:text-pink-core">
          <Link to={pathFor("event", lang, { slug: e.slug })} className="text-inherit no-underline after:absolute after:inset-0">
            {l(e.title)}
          </Link>
        </h3>
        <p className="mt-2 text-[15px] text-ink-dim">{l(e.dress_code)}</p>
      </div>
    </article>
  );
}
