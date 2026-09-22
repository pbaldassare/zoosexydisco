import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { AdultsBadge } from "@/components/ui/icons";
import { useLang } from "@/hooks/useLang";
import { useScrollY } from "@/hooks/useScrollY";
import { matchPath, pathFor } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { LangSwitch } from "./LangSwitch";
import { MobileMenu } from "./MobileMenu";
import { MAIN_NAV, type NavItem } from "./nav";

/** Voce di menu: si accende come un tubo al passaggio del mouse. */
const linkCls = ({ isActive }: { isActive: boolean }) =>
  cn(
    "inline-flex min-h-11 items-center rounded-pill px-[11px] text-[15px] no-underline transition-[color,text-shadow] duration-200",
    "hover:text-pink-core hover:[text-shadow:0_0_12px_rgb(var(--pink))]",
    isActive ? "text-pink-core [text-shadow:0_0_12px_rgb(var(--pink))]" : "text-ink-dim",
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
      <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)} className={cn(linkCls({ isActive: !!active }), "gap-1")}>
        {t(item.label)}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      <ul
        className={cn(
          "absolute left-1/2 top-full min-w-40 -translate-x-1/2 rounded-tile border border-line bg-panel/95 p-2 backdrop-blur-md transition-[opacity,transform] duration-200",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
      >
        {item.children?.map((c) => (
          <li key={c.key}>
            <NavLink to={pathFor(c.key, lang)} className={({ isActive }) => cn(linkCls({ isActive }), "w-full")}>
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
  const solid = useScrollY() > 80;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow] duration-[400ms] ease-expo",
        solid && "bg-wall/[0.88] shadow-[0_1px_0_rgb(var(--line)),0_10px_30px_rgb(0_0_0/0.45)] backdrop-blur-xl",
      )}
    >
      <a href="#main" className="label sr-only z-50 rounded-pill bg-pink px-4 py-3 text-wall focus:not-sr-only focus:absolute focus:left-4 focus:top-3">
        {t("nav.skip")}
      </a>

      <div className="container-site flex h-[68px] items-center gap-4">
        <Link to={pathFor("home", lang)} aria-label={t("nav.home")} className="mr-auto flex min-w-0 items-center gap-2.5 no-underline">
          <Logo className="size-[46px] flex-none" title="" />
          <span className="tube tube-pink hidden whitespace-nowrap text-[21px] min-[420px]:inline">ZOO Sexy Disco</span>
        </Link>

        <nav aria-label={t("nav.menu")} className="hidden lg:block">
          <ul className="flex gap-1">
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

        <LangSwitch />
        <AdultsBadge className="hidden lg:inline-flex" />
        <MobileMenu />
      </div>
    </header>
  );
}
