import { useTranslation } from "react-i18next";
import { CameraOff, EyeOff, ShieldCheck } from "lucide-react";

export function HouseRules({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  const items = [
    { icon: ShieldCheck, label: t("rules.adults"), mark: "18+" },
    { icon: CameraOff, label: t("rules.noPhoto") },
    { icon: EyeOff, label: t("rules.privacy") },
  ];
  return (
    <ul className={`flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-10 ${className}`}>
      {items.map(({ icon: Icon, label, mark }) => (
        <li key={label} className="label flex items-center gap-3 text-2xs text-ink-dim">
          {mark ? (
            <span className="grid size-9 place-items-center rounded-full border border-accent-hot text-[11px] text-accent-hot">{mark}</span>
          ) : (
            <span className="grid size-9 place-items-center rounded-full border border-line">
              <Icon className="size-4 text-ink" aria-hidden />
            </span>
          )}
          {label}
        </li>
      ))}
    </ul>
  );
}
