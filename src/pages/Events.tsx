import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EventCard } from "@/components/sections/EventBits";
import { PageHero } from "@/components/sections/PageHero";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/ui/seo";
import { eventStatus } from "@/data/events";
import { themes } from "@/data/themes";
import { useContent, useEvents } from "@/hooks/useData";
import { cn } from "@/lib/utils";

const ARCHIVE_PAGE = 6;

export default function Events() {
  const { t } = useTranslation();
  const c = useContent();
  const { data: all = [] } = useEvents();
  const [theme, setTheme] = useState<string>("all");
  const [archiveCount, setArchiveCount] = useState(ARCHIVE_PAGE);

  const filtered = useMemo(() => all.filter((e) => theme === "all" || e.theme_id === theme), [all, theme]);
  const upcoming = filtered.filter((e) => eventStatus(e) !== "archived");
  const archive = filtered.filter((e) => eventStatus(e) === "archived").reverse();
  const usedThemes = themes.filter((th) => !th.is_default && all.some((e) => e.theme_id === th.id));

  return (
    <>
      <Seo title={t("events.title")} description={c("events.intro")} />
      <PageHero label={t("nav.events")} title={t("events.title").split(" ")[0]!} accent={t("events.title").split(" ").slice(1).join(" ")} intro={c("events.intro")} image="/placeholders/hero-02.webp" compact />

      <div className="container-site py-12 md:py-16">
        <div role="group" aria-label={t("events.filterLabel")} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
          {[{ id: "all", name: t("events.filterAll") }, ...usedThemes].map((th) => (
            <button
              key={th.id}
              type="button"
              aria-pressed={theme === th.id}
              onClick={() => {
                setTheme(th.id);
                setArchiveCount(ARCHIVE_PAGE);
              }}
              className={cn(
                "label inline-flex min-h-11 shrink-0 items-center rounded-full border px-5 text-2xs transition-colors",
                theme === th.id ? "border-accent bg-accent text-bg" : "border-line text-ink-dim hover:border-accent hover:text-accent",
              )}
            >
              {th.name}
            </button>
          ))}
        </div>

        <section aria-labelledby="up" className="mt-12">
          <h2 id="up" className="label mb-8 text-accent">
            {t("events.upcoming")}
          </h2>
          {upcoming.length ? (
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e) => (
                <EventCard key={e.id} e={e} />
              ))}
            </div>
          ) : (
            <p className="text-ink-dim">{t("events.none")}</p>
          )}
        </section>

        {archive.length > 0 && (
          <section aria-labelledby="arch" className="mt-24">
            <h2 id="arch" className="text-2xl md:text-3xl">
              {t("events.archive")}
            </h2>
            <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {archive.slice(0, archiveCount).map((e) => (
                <EventCard key={e.id} e={e} muted />
              ))}
            </div>
            {archive.length > archiveCount && (
              <div className="mt-12 flex justify-center">
                <Button variant="outline" onClick={() => setArchiveCount((n) => n + ARCHIVE_PAGE)}>
                  {t("cta.loadMore")}
                </Button>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
