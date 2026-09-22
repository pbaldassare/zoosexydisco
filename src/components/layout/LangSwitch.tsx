import { Link, useLocation } from "react-router-dom";
import { useLang } from "@/hooks/useLang";
import { LANGS, switchLangPath } from "@/lib/routes";
import { cn, safeStorage } from "@/lib/utils";

/**
 * IT / EN come selettore a pillola. Restano link veri alla pagina equivalente
 * nell'altra lingua: i motori di ricerca devono poter seguire entrambe.
 */
export function LangSwitch({ className }: { className?: string }) {
  const lang = useLang();
  const { pathname, search } = useLocation();

  return (
    <div className={cn("flex flex-none rounded-pill border border-line p-[3px]", className)} role="group" aria-label="Lingua">
      {LANGS.map((l) =>
        l === lang ? (
          <span
            key={l}
            aria-current="true"
            className="label rounded-pill bg-panel-2 px-[9px] py-[7px] text-[13px] leading-none text-ink"
          >
            {l.toUpperCase()}
          </span>
        ) : (
          <Link
            key={l}
            to={switchLangPath(pathname, l) + search}
            onClick={() => safeStorage.set("zoo.lang", l)}
            hrefLang={l}
            lang={l}
            className="label rounded-pill px-[9px] py-[7px] text-[13px] leading-none text-ink-faint no-underline transition-colors hover:text-ink"
          >
            {l.toUpperCase()}
          </Link>
        ),
      )}
    </div>
  );
}
