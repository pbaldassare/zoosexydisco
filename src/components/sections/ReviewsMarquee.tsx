import { useTranslation } from "react-i18next";
import { IcoStar } from "@/components/ui/icons";
import { useReviews, useSettings } from "@/hooks/useData";
import { useL } from "@/hooks/useLang";

/**
 * Fascia recensioni in fondo a ogni pagina pubblica. Solo 5 stelle visibili,
 * nessun voto medio calcolato (DESIGN.md, Don'ts). Si ferma al passaggio del
 * mouse e con reduced-motion. Dichiariamo che è una selezione.
 */
export function ReviewsMarquee() {
  const { t } = useTranslation();
  const l = useL();
  const { data: reviews } = useReviews();
  const { data: s } = useSettings();
  if (!reviews?.length) return null;
  const loop = [...reviews, ...reviews];

  return (
    <section aria-labelledby="reviews-title" className="relative z-[1] pt-section">
      <div className="container-site mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 id="reviews-title" className="h2 tube-blue mb-0">
          {t("reviews.title")}
        </h2>
        {s?.google_reviews_url && (
          <a href={s.google_reviews_url} target="_blank" rel="noopener" className="text-[15px]">
            {t("reviews.readAll")}
          </a>
        )}
      </div>

      <div className="group overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,#000_3%,#000_94%,transparent)]">
        <ul className="flex w-max animate-marquee list-none gap-4 pl-[max(theme(spacing.gutter),calc((100vw-theme(maxWidth.site))/2+theme(spacing.gutter)))] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {loop.map((r, i) => (
            <li
              key={`${r.id}-${i}`}
              aria-hidden={i >= reviews.length}
              className="grid w-[min(78vw,340px)] flex-none content-start gap-3 rounded-[20px] border border-line bg-panel p-[22px]"
            >
              <span className="flex gap-[3px] text-pink [&_svg]:drop-shadow-[0_0_4px_rgb(var(--pink))]" aria-label="5/5">
                {Array.from({ length: 5 }, (_, k) => (
                  <IcoStar key={k} />
                ))}
              </span>
              <p className="m-0 text-ink">“{l(r.text)}”</p>
              <p className="m-0 flex items-center justify-between gap-2.5 text-xs text-ink-faint">
                {r.author_name}
                {r.is_sample && (
                  <em className="label rounded-pill border border-line px-2 py-[5px] text-[11px] not-italic tracking-[0.1em]">{t("badge.sample")}</em>
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="container-site">
        <p className="mt-3.5 text-[15px] text-ink-faint">{t("reviews.selection")}</p>
      </div>
    </section>
  );
}
