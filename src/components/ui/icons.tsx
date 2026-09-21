import { CameraOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/** Fotocamera sbarrata con tooltip: vale anche da promemoria della regola. */
export function NoPhotoIcon({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <span className={cn("group relative inline-flex size-11 items-center justify-center", className)} tabIndex={0} aria-label={t("badge.noPhoto")}>
      <CameraOff className="size-[18px] text-ink-dim transition-colors group-hover:text-ink" aria-hidden />
      <span
        role="tooltip"
        className="label pointer-events-none absolute right-0 top-full z-10 mt-1 whitespace-nowrap bg-surface px-3 py-2 text-[11px] text-ink opacity-0 shadow-xl ring-1 ring-line transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {t("badge.noPhoto")}
      </span>
    </span>
  );
}

export function AdultsBadge({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn("label inline-flex h-7 items-center rounded-full border border-accent-hot px-2 text-[11px] leading-none text-accent-hot", className)}
      title={t("rules.adults")}
    >
      18+
    </span>
  );
}

export function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.99 6.7 2.78a9.4 9.4 0 0 1 2.77 6.7c0 5.23-4.25 9.45-9.47 9.45m8.06-17.52A11.32 11.32 0 0 0 12.05.65C5.77.65.66 5.76.66 12.04c0 2 .52 3.96 1.52 5.69L.57 23.63l6.04-1.58a11.4 11.4 0 0 0 5.44 1.38h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.18-5.9-3.34-8.06" />
    </svg>
  );
}

export function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
