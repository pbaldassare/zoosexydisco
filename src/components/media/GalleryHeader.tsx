import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { EventItem } from "@/data/types";
import { useLang, useL } from "@/hooks/useLang";
import { pathFor } from "@/lib/routes";

/** Filtro per serata + sotto-navigazione Foto / Video, condivisi dalle due gallery. */
export function GalleryHeader({ active, events, value, onChange }: { active: "photos" | "videos"; events: EventItem[]; value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  const lang = useLang();
  const l = useL();
  return (
    <header className="container-site pb-10 pt-[calc(var(--header-h)+3rem)] md:pt-[calc(var(--header-h)+5rem)]">
      <p className="label mb-5 text-accent">{t("nav.gallery")}</p>
      <div className="flex flex-wrap items-end justify-between gap-8">
        <h1 className="flex items-baseline gap-5 text-[52px] leading-none sm:text-3xl md:text-4xl">
          {(["photos", "videos"] as const).map((k) =>
            k === active ? (
              <span key={k}>{t(`gallery.${k}`)}</span>
            ) : (
              <Link key={k} to={pathFor(k, lang)} className="font-display text-xl italic text-ink-dim transition-colors hover:text-accent md:text-2xl">
                {t(`gallery.${k}`)}
              </Link>
            ),
          )}
        </h1>
        <label className="flex flex-col gap-2">
          <span className="label text-2xs text-ink-dim">{t("gallery.filter")}</span>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-12 min-w-56 cursor-pointer border-0 border-b border-ink/30 bg-transparent px-0 text-ink focus:border-accent focus:ring-0 [&>option]:bg-surface"
          >
            <option value="">{t("gallery.all")}</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {l(e.title)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}
