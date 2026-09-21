import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/brand/Logo";
import { AdultsBadge, InstagramGlyph } from "@/components/ui/icons";
import { useSettings } from "@/hooks/useData";
import { useLang, useL } from "@/hooks/useLang";
import { pathFor } from "@/lib/routes";
import { isPlaceholder } from "@/lib/utils";
import { MAIN_NAV } from "./nav";
import { CameraOff } from "lucide-react";

export function Footer() {
  const { t } = useTranslation();
  const lang = useLang();
  const l = useL();
  const { data: s } = useSettings();
  if (!s) return null;
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-line bg-surface/40 pb-28 pt-16 md:pb-12">
      <div className="container-site grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo className="w-36 text-ink" />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <AdultsBadge />
            <span className="label inline-flex items-center gap-2 text-[11px] text-ink-dim">
              <CameraOff className="size-4" aria-hidden /> {t("badge.noPhoto")}
            </span>
          </div>
        </div>

        <nav className="md:col-span-3" aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1 md:grid-cols-1">
            {MAIN_NAV.flatMap((i) => i.children ?? [i]).map((i) => (
              <li key={i.key}>
                <Link to={pathFor(i.key, lang)} className="inline-flex min-h-10 items-center text-xs text-ink-dim transition-colors hover:text-accent">
                  {t(i.label)}
                </Link>
              </li>
            ))}
            <li>
              <Link to={pathFor("newsletter", lang)} className="inline-flex min-h-10 items-center text-xs text-ink-dim transition-colors hover:text-accent">
                {t("nav.newsletter")}
              </Link>
            </li>
            <li>
              <Link to={pathFor("members", lang)} className="inline-flex min-h-10 items-center text-xs text-ink-dim transition-colors hover:text-accent">
                {t("nav.members")}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="space-y-6 md:col-span-5">
          <div>
            <p className="label mb-2 text-accent">{t("footer.hours")}</p>
            <p className="text-xs text-ink-dim">{l(s.opening_hours)}</p>
          </div>
          <div>
            <p className="label mb-3 text-accent">{t("footer.follow")}</p>
            {isPlaceholder(s.instagram_handle) || !s.instagram_url ? (
              <p className="inline-flex items-center gap-2 text-xs text-ink-dim">
                <InstagramGlyph className="size-4" aria-hidden /> Instagram {s.instagram_handle}
              </p>
            ) : (
              <a href={s.instagram_url} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-xs text-ink hover:text-accent">
                <InstagramGlyph className="size-4" aria-hidden /> @{s.instagram_handle}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="container-site mt-14">
        <div className="hairline" aria-hidden />
        <address className="mt-8 grid gap-1 text-2xs not-italic leading-relaxed text-ink-dim md:max-w-3xl">
          <span>
            {t("footer.managedBy")} {s.company_name}
          </span>
          <span>
            {t("footer.legalSeat")}: {s.legal_address}
          </span>
          <span>
            {t("footer.vat")} {s.vat_number}
          </span>
          <span>
            {s.registry} · REA {s.rea}
          </span>
          <span>
            {t("footer.capital")} {s.share_capital}
          </span>
          <span>
            <a className="hover:text-accent" href={`mailto:${s.email}`}>
              {s.email}
            </a>{" "}
            · PEC{" "}
            <a className="hover:text-accent" href={`mailto:${s.pec}`}>
              {s.pec}
            </a>
          </span>
        </address>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-2xs text-ink-dim">
          <span>
            © {year} {s.company_name} · {t("footer.rights")}
          </span>
          <Link to={pathFor("privacy", lang)} className="inline-flex min-h-10 items-center underline-offset-4 hover:text-accent hover:underline">
            {t("nav.privacy")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
