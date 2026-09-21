import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { AdultsBadge, NoPhotoIcon } from "@/components/ui/icons";
import { useLang } from "@/hooks/useLang";
import { useScrollY } from "@/hooks/useScrollY";
import { matchPath, pathFor } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { LangSwitch } from "./LangSwitch";
import { MobileMenu } from "./MobileMenu";
import { MAIN_NAV, type NavItem } from "./nav";

const linkCls = ({ isActive }: { isActive: boolean }) =>
  cn(
    "label relative inline-flex min-h-11 items-center text-2xs transition-colors hover:text-accent",
    "after:absolute after:inset-x-0 after:bottom-2 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:after:scale-x-100",
    isActive ? "text-accent after:scale-x-100" : "text-ink",
  );

function GalleryMenu({ item }: { item: NavItem }) {
  const { t } = useTranslation();
  const lang = useLang();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const active = item.children?.some((c) => matchPath(pathname)?.key === c.key);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <li ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={cn(linkCls({ isActive: !!active }), "gap-1")}
      >
        {t(item.label)}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      <ul
        className={cn(
          "absolute left-1/2 top-full min-w-40 -translate-x-1/2 border border-line bg-surface/95 p-2 backdrop-blur-md transition-[opacity,transform] duration-200",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
      >
        {item.children?.map((c) => (
          <li key={c.key}>
            <NavLink to={pathFor(c.key, lang)} className={({ isActive }) => cn(linkCls({ isActive }), "w-full px-3 after:hidden")}>
              {t(c.label)}
            </NavLink>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function Header() {
  const { t } = useTranslation();
  const lang = useLang();
  const { pathname } = useLocation();
  const y = useScrollY();
  const isHome = matchPath(pathname)?.key === "home";
  const solid = y > 80;
  // In home il logo grande vive nella hero e «scende» nella barra solo dopo lo scroll.
  const [vh, setVh] = useState(800);
  useEffect(() => setVh(window.innerHeight), []);
  const logoIn = !isHome || y > vh * 0.42;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[var(--header-h)] transition-[background-color,border-color,backdrop-filter] duration-300",
        solid ? "border-b border-line/60 bg-bg/80 backdrop-blur-xl" : "border-b border-transparent bg-gradient-to-b from-bg/70 to-transparent",
      )}
    >
      <a href="#main" className="label sr-only z-[60] bg-accent px-4 py-3 text-bg focus:not-sr-only focus:absolute focus:left-4 focus:top-3">
        {t("nav.skip")}
      </a>
      <div className="container-site flex h-full items-center justify-between gap-6">
        <Link
          to={pathFor("home", lang)}
          aria-label={t("nav.home")}
          className={cn(
            "text-ink transition-[opacity,transform] duration-500 ease-expo",
            logoIn ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
          )}
          tabIndex={logoIn ? 0 : -1}
        >
          <Logo className="h-10 w-auto md:h-11" />
        </Link>

        <nav aria-label={t("nav.menu")} className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {MAIN_NAV.map((item) =>
              item.children ? (
                <GalleryMenu key={item.label} item={item} />
              ) : (
                <li key={item.key}>
                  <NavLink to={pathFor(item.key, lang)} className={linkCls}>
                    {t(item.label)}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <LangSwitch className="hidden sm:flex" />
          <AdultsBadge className="hidden sm:inline-flex" />
          <NoPhotoIcon className="hidden sm:inline-flex" />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
