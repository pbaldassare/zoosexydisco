import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/brand/Logo";
import { AdultsBadge, InstagramGlyph, NoPhotoGlyph } from "@/components/ui/icons";
import { useContent, useSettings } from "@/hooks/useData";
import { useLang } from "@/hooks/useLang";
import { pathFor } from "@/lib/routes";
import { weekdayName } from "@/lib/opening";
import { capitalize, isPlaceholder } from "@/lib/utils";
import { telLink, waLink } from "@/lib/whatsapp";

const colTitle = "mb-3.5 mt-1.5 label text-[13px] tracking-[0.1em] text-ink-faint";
const chip = "inline-flex items-center gap-2 rounded-pill border border-line px-2.5 py-1.5 text-ink-dim";

export function Footer() {
  const { t } = useTranslation();
  const c = useContent();
  const lang = useLang();
  const { data: s } = useSettings();
  if (!s) return null;
  const year = new Date().getFullYear();
  // Tutte le serate aprono alla stessa ora? Allora una riga sola basta.
  const sameOpening = new Set(s.opening_windows.map((w) => w.open)).size === 1 && s.opening_windows.length > 0;

  return (
    <footer className="relative z-[1] mt-[clamp(80px,12vw,130px)] border-t border-line bg-[linear-gradient(180deg,rgb(var(--wall-2)),#040206)]" id="contatti">
      <div className="container-site">
        <div className="grid gap-[34px] pb-[34px] pt-[52px] md:grid-cols-[1.1fr_1fr_1fr_1fr]">
          <div>
            <Logo className="mb-3 size-24" title="" />
            <p className="m-0 text-[15.5px] text-ink-dim">
              Via Vincenzo Bellini 43
              <br />
              24040 Madone (BG)
            </p>
          </div>

          <div>
            <h3 className={colTitle}>{t("contacts.title")}</h3>
            <ul className="m-0 grid list-none gap-2 p-0 text-[15.5px] text-ink-dim">
              {s.contacts.map((p) => (
                <li key={p.name}>
                  {p.name} ·{" "}
                  <a href={telLink(p.phone)} className="text-ink no-underline hover:text-pink-core">
                    {p.phone}
                  </a>{" "}
                  ·{" "}
                  <a href={waLink(p.phone, t("events.waGeneric"))} target="_blank" rel="noopener" className="text-ink no-underline hover:text-pink-core">
                    WhatsApp
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${s.email}`} className="text-ink no-underline hover:text-pink-core">
                  {s.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={colTitle}>{t("contacts.hours")}</h3>
            {/* Niente orario di chiusura: «sino a notte fonda», come in home.
                Se un giorno le aperture non coincidessero più, ogni serata
                torna sulla sua riga invece di dire una cosa falsa. */}
            {sameOpening ? (
              <>
                <p className="m-0 text-[15.5px] text-ink-dim">{s.opening_windows.map((w) => capitalize(weekdayName(w.day, lang))).join(" · ")}</p>
                <p className="m-0 mt-1 text-[15.5px] text-ink-dim">
                  {t("home.from")} <span className="tnum font-mono font-medium">{s.opening_windows[0]!.open}</span> {t("home.untilLate")}
                </p>
              </>
            ) : (
              <ul className="m-0 grid list-none gap-2 p-0 text-[15.5px] text-ink-dim">
                {s.opening_windows.map((w) => (
                  <li key={w.day}>
                    {capitalize(weekdayName(w.day, lang))} · {t("home.from")} <span className="tnum font-mono font-medium">{w.open}</span> {t("home.untilLate")}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2.5 text-xs text-ink-dim">{c("home.nights.holidays")}</p>
          </div>

          <div>
            <h3 className={colTitle}>Instagram</h3>
            {isPlaceholder(s.instagram_handle) || !s.instagram_url ? (
              <p className="m-0 inline-flex items-center gap-2 text-[15.5px] text-ink-dim">
                <InstagramGlyph /> Instagram {s.instagram_handle}
              </p>
            ) : (
              <a href={s.instagram_url} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-[15.5px] text-ink no-underline hover:text-pink-core">
                <InstagramGlyph /> @{s.instagram_handle}
              </a>
            )}
          </div>
        </div>

        <div className="grid gap-3.5 border-t border-line pb-[34px] pt-6 text-[13.5px] leading-[1.7] text-ink-faint">
          <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2.5">
            <span className={chip}>
              <AdultsBadge className="px-1.5 py-1 text-[11px]" /> {t("rules.adults")}
            </span>
            <span className={chip}>
              <NoPhotoGlyph /> {t("badge.noPhoto")}
            </span>
            <Link to={pathFor("privacy", lang)} className="text-ink-dim">
              {t("nav.privacy")}
            </Link>
            <Link to={pathFor("newsletter", lang)} className="text-ink-dim">
              {t("nav.newsletter")}
            </Link>
            <Link to={pathFor("members", lang)} className="text-ink-dim">
              {t("nav.members")}
            </Link>
          </div>

          <address className="m-0 not-italic">
            ZOO Sexy Disco {t("footer.managedByShort")} {s.company_name} · {t("footer.legalSeat")}: {s.legal_address} · {t("footer.vat")}{" "}
            {s.vat_number} · {s.registry} · REA {s.rea} · {t("footer.capital")} {s.share_capital} ·{" "}
            <a href={`mailto:${s.email}`} className="text-ink-dim">
              {s.email}
            </a>{" "}
            · PEC{" "}
            <a href={`mailto:${s.pec}`} className="text-ink-dim">
              {s.pec}
            </a>{" "}
            · © {year}
          </address>
        </div>
      </div>
    </footer>
  );
}
