import { forwardRef, useId } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, ShieldCheck } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { pathFor } from "@/lib/routes";
import { cn } from "@/lib/utils";

const control =
  "w-full border-0 border-b border-ink/30 bg-transparent px-0 py-3 text-base text-ink placeholder:text-ink-dim/60 transition-colors focus:border-accent focus:outline-none focus:ring-0 aria-[invalid=true]:border-danger";

type FieldProps = { label: string; error?: string; hint?: string; className?: string; children: (id: string, describedBy?: string) => React.ReactNode; required?: boolean };

/** Etichetta sempre visibile sopra il campo, errore subito sotto. */
export function Field({ label, error, hint, className, children, required }: FieldProps) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col", className)}>
      <label htmlFor={id} className="label text-2xs text-ink-dim">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      {children(id, describedBy)}
      {hint && (
        <p id={`${id}-hint`} className="mt-2 text-2xs text-ink-dim">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-2 text-2xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <input ref={ref} className={cn(control, "min-h-12", className)} {...p} />
));
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => (
  <textarea ref={ref} rows={4} className={cn(control, "resize-y", className)} {...p} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...p }, ref) => (
  <select ref={ref} className={cn(control, "min-h-12 cursor-pointer appearance-none bg-[length:12px] bg-[right_4px_center] bg-no-repeat [&>option]:bg-surface", className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23B3A69F' fill='none' stroke-width='1.5'/%3E%3C/svg%3E\")" }} {...p}>
    {children}
  </select>
));
Select.displayName = "Select";

export const Checkbox = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode }>(({ label, className, ...p }, ref) => (
  <label className={cn("flex cursor-pointer items-start gap-3 text-sm text-ink-dim", className)}>
    <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
      <input ref={ref} type="checkbox" className="peer absolute inset-0 cursor-pointer appearance-none border border-ink/40 checked:border-accent checked:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" {...p} />
      <Check className="pointer-events-none relative size-3.5 text-bg opacity-0 peer-checked:opacity-100" aria-hidden />
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
      <Link to={pathFor("privacy", lang)} target="_blank" className="text-ink underline underline-offset-4 hover:text-accent">
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
    <div className="flex min-h-[65px] items-center gap-3 border border-dashed border-line px-4 text-2xs text-ink-dim">
      <ShieldCheck className="size-4 shrink-0 text-accent" aria-hidden />
      <span>
        {t("form.turnstile")} · {t("form.turnstilePending")}
      </span>
    </div>
  );
}

export function SentPanel({ title, body, demo }: { title: string; body: string; demo?: boolean }) {
  const { t } = useTranslation();
  return (
    <div role="status" className="border border-ok/40 bg-ok/5 p-8">
      <p className="label text-2xs text-ok">✓ {title}</p>
      <p className="mt-3 font-display text-xl italic text-ink">{body}</p>
      {demo && <p className="mt-4 text-2xs text-ink-dim">{t("form.demoNote")}</p>}
    </div>
  );
}
