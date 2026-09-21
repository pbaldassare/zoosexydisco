import { Link, useLocation } from "react-router-dom";
import { useLang } from "@/hooks/useLang";
import { LANGS, switchLangPath } from "@/lib/routes";
import { cn, safeStorage } from "@/lib/utils";

/** IT / EN: porta alla pagina equivalente nell'altra lingua e ricorda la scelta. */
export function LangSwitch({ className }: { className?: string }) {
  const lang = useLang();
  const { pathname, search } = useLocation();
  return (
    <div className={cn("label flex items-center text-2xs", className)}>
      {LANGS.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="px-1.5 text-line" aria-hidden>/</span>}
          {l === lang ? (
            <span className="text-ink" aria-current="true">
              {l.toUpperCase()}
            </span>
          ) : (
            <Link
              to={switchLangPath(pathname, l) + search}
              onClick={() => safeStorage.set("zoo.lang", l)}
              hrefLang={l}
              lang={l}
              className="inline-flex min-h-11 items-center text-ink-dim transition-colors hover:text-accent"
            >
              {l.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
