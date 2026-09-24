import { useTranslation } from "react-i18next";
import { ContactButtons } from "@/components/sections/ContactButtons";
import { useSettings } from "@/hooks/useData";
import { useLang } from "@/hooks/useLang";
import { useNow } from "@/hooks/useNow";
import { openState, weekdayName } from "@/lib/opening";
import { capitalize, cn } from "@/lib/utils";

/**
 * Il pannello delle serate, sotto l'insegna. La serata di turno si accende in
 * rosa, le altre restano tubi blu. Sotto, una frase che dice se stasera siamo
 * aperti o qual è la prossima serata: mai la parola «Chiuso» (DESIGN.md).
 */
export function OpenPanel() {
  const { t } = useTranslation();
  const lang = useLang();
  const now = useNow();
  const { data: s } = useSettings();

  const windows = s?.opening_windows ?? [];
  const state = openState(windows, now);
  if (!state) return null;

  const when =
    state.inDays === 0 ? t("home.state.tonight") : state.inDays === 1 ? t("home.state.tomorrow") : weekdayName(state.day, lang);

  return (
    <div className="panel-raised mt-6 grid w-[min(100%,620px)] justify-items-center gap-4 px-[clamp(18px,4vw,34px)] pb-6 pt-[22px]" aria-live="polite">
      <p className="tube m-0 flex flex-nowrap justify-center gap-x-[0.35em] whitespace-nowrap text-[clamp(28px,3.4vw,40px)] leading-[1.15] max-[560px]:flex-col max-[560px]:items-center max-[560px]:gap-0.5 max-[560px]:text-[34px]">
        {windows.map((w, i) => (
          <span key={w.day} className="contents">
            {i > 0 && (
              <i className="not-italic text-ink-faint max-[560px]:hidden" aria-hidden>
                ·
              </i>
            )}
            <span className={w.day === state.day ? "tube-pink" : "tube-blue"}>{capitalize(weekdayName(w.day, lang))}</span>
          </span>
        ))}
      </p>

      <p className="m-0 max-w-[40ch] text-center text-base text-ink">
        {state.open ? (
          <>
            <b className="font-bold text-pink-core">{t("home.state.openStrong")}</b>
            {t("home.state.openRest", { close: state.closesAt })}
          </>
        ) : (
          <>
            {t("home.state.nextLead")}
            <b className="font-bold text-pink-core">{when}</b>
            {t("home.state.nextRest", { open: state.opensAt })}
          </>
        )}
      </p>

      <ContactButtons text={t("events.waGeneric")} />
    </div>
  );
}

/**
 * «Le nostre notti»: righe separate da filetti, non una griglia di card uguali
 * (DESIGN.md, Layout). La notte di turno è l'unica accesa in rosa.
 */
export function NightsList({ className }: { className?: string }) {
  const { t } = useTranslation();
  const lang = useLang();
  const now = useNow();
  const { data: s } = useSettings();

  const windows = s?.opening_windows ?? [];
  const state = openState(windows, now);

  return (
    <div className={cn("grid border-t border-line", className)}>
      {windows.map((w) => {
        const isTurn = state?.day === w.day;
        return (
          <div
            key={w.day}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-[22px] gap-y-1.5 border-b border-line px-1 py-[22px]"
          >
            <span className={cn("tube text-[clamp(40px,9vw,88px)]", isTurn ? "tube-pink" : "tube-blue opacity-[0.78]")}>
              {capitalize(weekdayName(w.day, lang))}
            </span>
            {/* L'ora in mono con le cifre tabellari, la frase no: il mono non
                si usa per le frasi (DESIGN.md, Don'ts). */}
            <span className="max-w-[16ch] text-balance text-right text-[clamp(15px,1.9vw,20px)] leading-snug text-ink md:max-w-none md:whitespace-nowrap">
              {t("home.from")} <span className="tnum font-mono font-medium">{w.open}</span> {t("home.untilLate")}
            </span>
            {isTurn && (
              <span
                className={cn(
                  "label col-span-full justify-self-start rounded-pill px-2.5 py-[7px] text-[13px] leading-none",
                  state?.open
                    ? "bg-ok text-[#08130E] shadow-[0_0_14px_rgb(var(--ok)/0.45)]"
                    : "text-pink-core shadow-[inset_0_0_0_1.5px_rgb(var(--pink)),0_0_12px_rgb(var(--pink)/0.35)]",
                )}
              >
                {state?.open ? t("home.state.openNow") : t("home.state.nextNight")}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
