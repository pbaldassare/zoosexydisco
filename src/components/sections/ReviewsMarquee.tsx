import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useReviews, useSettings } from "@/hooks/useData";
import { useL } from "@/hooks/useLang";

/**
 * Fascia recensioni in fondo a ogni pagina pubblica. Solo 5 stelle visibili,
 * nessun voto medio calcolato. Si ferma al passaggio del mouse e con reduced-motion.
 * Dichiariamo che è una selezione (trasparenza verso il consumatore).
 */
export function ReviewsMarquee() {
  const { t, i18n } = useTranslation();
  const l = useL();
  const { data: reviews } = useReviews();
  const { data: s } = useSettings();
  if (!reviews?.length) return null;
  const loop = [...reviews, ...reviews];

  return (
    <section aria-labelledby="reviews-title" className="overflow-hidden py-16">
      <div className="container-site mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="reviews-title" className="text-xl">
            {t("reviews.title")}
          </h2>
          <p className="mt-1 text-2xs text-ink-dim">{t("reviews.selection")}</p>
        </div>
        {s?.google_reviews_url ? (
          <a href={s.google_reviews_url} target="_blank" rel="noopener" className="label text-2xs text-accent underline-offset-4 hover:underline">
            {t("reviews.readAll")}
          </a>
        ) : (
          <span className="label text-2xs text-ink-dim">{t("reviews.readAll")} · {i18n.language === "en" ? "[URL to be completed]" : "[URL da completare]"}</span>
        )}
      </div>
      <div className="group relative [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <ul className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {loop.map((r, i) => (
            <li
              key={`${r.id}-${i}`}
              aria-hidden={i >= reviews.length}
              className="flex w-[300px] shrink-0 flex-col justify-between border border-line bg-surface/60 p-6 sm:w-[360px]"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex gap-0.5 text-accent" aria-label="5/5">
                    {Array.from({ length: 5 }, (_, k) => (
                      <Star key={k} className="size-3.5 fill-current" aria-hidden />
                    ))}
                  </span>
                  {r.is_sample && <Badge tone="sample">{t("badge.sample")}</Badge>}
                </div>
                <p className="font-display text-lg italic leading-snug text-ink">“{l(r.text)}”</p>
              </div>
              <p className="label mt-6 text-2xs text-ink-dim">{r.author_name}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
