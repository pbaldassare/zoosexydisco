import { forwardRef, useId } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, ShieldCheck } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { pathFor } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Vetro piegato anche nei moduli: pillole scure, bordo che si accende in rosa. */
const control =
  "w-full rounded-pill border-[1.5px] border-line bg-wall/70 px-[18px] font-body text-base text-ink transition-colors placeholder:text-ink-faint focus:border-pink focus:outline-none focus:ring-4 focus:ring-pink/20 aria-[invalid=true]:border-danger";

type FieldProps = { label: string; error?: string; hint?: string; className?: string; children: (id: string, describedBy?: string) => React.ReactNode; required?: boolean };

/** Etichetta sempre visibile sopra il campo, errore subito sotto. */
export function Field({ label, error, hint, className, children, required }: FieldProps) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="label text-ink-faint">
        {label}
        {required && <span className="text-pink"> *</span>}
      </label>
      {children(id, describedBy)}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-ink-dim">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <input ref={ref} className={cn(control, "min-h-[52px]", className)} {...p} />
));
Input.displayName = "Input";

/* Il messaggio non può essere una pillola: raggio da riquadro. */
export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => (
  <textarea ref={ref} rows={4} className={cn(control, "resize-y rounded-tile py-3.5", className)} {...p} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...p }, ref) => (
  <select
    ref={ref}
    className={cn(control, "min-h-[52px] cursor-pointer appearance-none bg-[length:12px] bg-[right_18px_center] bg-no-repeat pr-11 [&>option]:bg-panel", className)}
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23BDAAC4' fill='none' stroke-width='1.5'/%3E%3C/svg%3E\")",
    }}
    {...p}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export const Checkbox = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode }>(({ label, className, ...p }, ref) => (
  <label className={cn("flex cursor-pointer items-start gap-3 text-sm text-ink-dim", className)}>
    <span className="relative mt-0.5 grid size-[22px] shrink-0 place-items-center">
      <input
        ref={ref}
        type="checkbox"
        className="peer absolute inset-0 cursor-pointer appearance-none rounded-md border-[1.5px] border-line bg-wall/70 checked:border-pink checked:bg-pink checked:shadow-[0_0_12px_rgb(var(--pink)/0.45)]"
        {...p}
      />
      <Check className="pointer-events-none relative size-3.5 text-[#12040F] opacity-0 peer-checked:opacity-100" aria-hidden />
    </span>
    <span>{label}</span>
  </label>
));
Checkbox.displayName = "Checkbox";

export function ConsentLabel() {
  const { t } = useTranslation();
  const lang = useLang();
  return (
    <>
      {t("form.consentPre")}
      <Link to={pathFor("privacy", lang)} target="_blank" className="text-pink-core underline underline-offset-4">
        {t("form.consentLink")}
      </Link>
      {t("form.consentPost")}
    </>
  );
}

/**
 * Posto riservato al widget Cloudflare Turnstile. Con VITE_TURNSTILE_SITE_KEY
 * qui verrà montato il widget vero; fino ad allora lo dichiara apertamente.
 */
export function TurnstileSlot() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[65px] items-center gap-3 rounded-tile border border-dashed border-line px-5 text-xs text-ink-dim">
      <ShieldCheck className="size-4 shrink-0 text-pink" aria-hidden />
      <span>
        {t("form.turnstile")} · {t("form.turnstilePending")}
      </span>
    </div>
  );
}

export function SentPanel({ title, body, demo }: { title: string; body: string; demo?: boolean }) {
  const { t } = useTranslation();
  return (
    <div role="status" className="rounded-card border border-ok/40 bg-ok/5 p-8">
      <p className="label text-ok">✓ {title}</p>
      <p className="mt-3 text-lg text-ink">{body}</p>
      {demo && <p className="mt-4 text-xs text-ink-dim">{t("form.demoNote")}</p>}
    </div>
  );
}
