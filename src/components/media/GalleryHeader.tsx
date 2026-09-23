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
      <div className="flex flex-wrap items-end justify-between gap-8">
        {/* I due tubi dicono da soli qual è la sezione accesa: niente occhiello sopra. */}
        <h1 className="flex flex-wrap items-baseline gap-5 text-3xl">
          {(["photos", "videos"] as const).map((k) =>
            k === active ? (
              <span key={k} className="tube tube-pink">
                {t(`gallery.${k}`)}
              </span>
            ) : (
              <Link key={k} to={pathFor(k, lang)} className="tube tube-blue text-xl no-underline opacity-70 transition-opacity hover:opacity-100">
                {t(`gallery.${k}`)}
              </Link>
            ),
          )}
        </h1>

        <label className="flex flex-col gap-2">
          <span className="label text-ink-faint">{t("gallery.filter")}</span>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[52px] min-w-56 cursor-pointer rounded-pill border-[1.5px] border-line bg-wall/70 px-[18px] font-body text-base text-ink transition-colors focus:border-pink focus:outline-none focus:ring-4 focus:ring-pink/20 [&>option]:bg-panel"
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
