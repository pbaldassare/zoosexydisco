import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/* ---------- glifi dei contatti ---------- */

export function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-[19px] shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19l-4 1z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z" />
    </svg>
  );
}

export function PhoneGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-[19px] shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  );
}

export function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4 shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function NoPhotoGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4 shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <circle cx="12" cy="13" r="3.2" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </svg>
  );
}

/* ---------- distintivi della casa ---------- */

/** 18+ come un piccolo tubo rosa acceso. */
export function AdultsBadge({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2 py-[7px] font-body text-[13px] font-bold leading-none text-pink-core",
        "shadow-[0_0_10px_rgb(var(--pink)/0.45),inset_0_0_8px_rgb(var(--pink)/0.3)] ring-[1.5px] ring-pink",
        className,
      )}
      title={t("rules.adults")}
    >
      18+
    </span>
  );
}

export function NoPhotoIcon({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <span className={cn("group relative inline-flex size-11 items-center justify-center", className)} tabIndex={0} aria-label={t("badge.noPhoto")}>
      <NoPhotoGlyph className="size-[18px] text-ink-faint transition-colors group-hover:text-ink" />
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded-tile border border-line bg-panel px-3 py-2 text-[13px] text-ink opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {t("badge.noPhoto")}
      </span>
    </span>
  );
}

/* ---------- icone al neon delle sezioni ----------
 * Tracciati nudi: colore e alone arrivano dalle classi .ico / .ico-blue. */

const Ico = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <svg viewBox="0 0 32 32" className={cn("ico", className)} aria-hidden>
    {children}
  </svg>
);

export const IcoCalendar = ({ className }: { className?: string }) => (
  <Ico className={className}>
    <rect x="5" y="7" width="22" height="20" rx="3" />
    <line x1="5" y1="13" x2="27" y2="13" />
    <line x1="11" y1="4" x2="11" y2="9" />
    <line x1="21" y1="4" x2="21" y2="9" />
    <circle cx="16" cy="20" r="2" />
  </Ico>
);

/** Coppa da champagne, con le bollicine che salgono. */
export const IcoBar = ({ className }: { className?: string }) => (
  <Ico className={className}>
    <path d="M9 11.5h14" />
    <path d="M9 11.5q7 10 14 0" />
    <path d="M16 19v5.5" />
    <path d="M11.5 24.5h9" />
    <circle cx="12.5" cy="6" r="1" />
    <circle cx="17" cy="3.2" r="1.3" />
    <circle cx="20.5" cy="7" r="0.9" />
  </Ico>
);

/** Una stella sul palco: lo spettacolo, senza nulla di esplicito. */
export const IcoShows = ({ className }: { className?: string }) => (
  <Ico className={className}>
    <path d="M16 4.5 17.9 9.4 23.1 9.7 19 13 20.4 18.1 16 15.2 11.6 18.1 13 13 8.9 9.7 14.1 9.4z" />
    <path d="M4 25h24" />
    <path d="M9 21.5 7 25" />
    <path d="M23 21.5 25 25" />
  </Ico>
);

/** Tavolo tondo del privè, con il suo calice. */
export const IcoTables = ({ className }: { className?: string }) => (
  <Ico className={className}>
    <ellipse cx="16" cy="15" rx="11" ry="3.6" />
    <path d="M16 18.6V26" />
    <path d="M10.5 26h11" />
    <path d="M19.5 11.4V6" />
    <path d="M17.5 6h4" />
    <path d="M19.5 11.4a2.6 2.6 0 0 1-2.6-2.6h5.2a2.6 2.6 0 0 1-2.6 2.6z" />
  </Ico>
);

export const IcoAccessible = ({ className }: { className?: string }) => (
  <Ico className={className}>
    <circle cx="15" cy="6" r="2.2" />
    <path d="M15 9v8h7l3 7" />
    <path d="M15 13h6" />
    <path d="M11 14a7 7 0 1 0 9 9" />
  </Ico>
);

export const IcoNoCamera = ({ className }: { className?: string }) => (
  <Ico className={className}>
    <rect x="4" y="10" width="24" height="16" rx="3" />
    <path d="M11 10l2-4h6l2 4" />
    <circle cx="16" cy="18" r="4.5" />
    <line x1="4" y1="4" x2="28" y2="28" />
  </Ico>
);

export const IcoAdults = ({ className }: { className?: string }) => (
  <Ico className={className}>
    <circle cx="16" cy="16" r="12" />
    <path d="M10 12h2v9" />
    <path d="M19 16.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6" />
  </Ico>
);

export const IcoRespect = ({ className }: { className?: string }) => (
  <Ico className={className}>
    <path d="M16 4l10 4v7c0 7-4.5 11-10 13C10.5 26 6 22 6 15V8z" />
    <polyline points="11,16 15,20 22,12" />
  </Ico>
);

export const IcoStar = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={cn("size-[17px]", className)} fill="currentColor" aria-hidden>
    <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.3l6.5-.9z" />
  </svg>
);
