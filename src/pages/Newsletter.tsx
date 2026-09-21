import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import type { z } from "zod";
import { Gift } from "lucide-react";
import { Checkbox, ConsentLabel, Field, Input, SentPanel, TurnstileSlot } from "@/components/forms/fields";
import { newsletterSchema } from "@/components/forms/schemas";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/ui/seo";
import { useContent } from "@/hooks/useData";
import { useLang } from "@/hooks/useLang";
import { api } from "@/services/api";

type Values = z.infer<ReturnType<typeof newsletterSchema>>;

export default function Newsletter() {
  const { t } = useTranslation();
  const c = useContent();
  const lang = useLang();
  const [params] = useSearchParams();
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState } = useForm<Values>({
    resolver: zodResolver(newsletterSchema(t)),
    defaultValues: { email: params.get("email") ?? "" },
  });
  const e = formState.errors;

  return (
    <>
      <Seo title={t("newsletter.page")} description={c("newsletter.body")} />
      <section className="relative overflow-hidden pb-24 pt-[calc(var(--header-h)+4rem)]">
        <img src="/placeholders/theme-bg-gatsby.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/80 to-bg" aria-hidden />
        <div className="container-site relative grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="label mb-5 text-accent">{t("nav.newsletter")}</p>
            <h1 className="text-[52px] leading-none sm:text-3xl md:text-4xl">{c("newsletter.title")}</h1>
            <p className="mt-6 max-w-prose text-ink-dim md:text-lg">{c("newsletter.body")}</p>
            <div className="mt-10 flex gap-4 border border-accent/40 bg-accent/5 p-6">
              <Gift className="size-6 shrink-0 text-accent" aria-hidden />
              <p className="text-ink">{c("newsletter.gift")}</p>
            </div>
          </div>
          <div className="md:col-span-6 md:col-start-7 md:pt-16">
            {sent ? (
              <SentPanel title={t("form.sentTitle")} body={t("newsletter.confirmPending")} demo />
            ) : (
              <form
                noValidate
                className="grid gap-8"
                onSubmit={handleSubmit(async (v) => {
                  await api.subscribe({ name: v.name, email: v.email, lang });
                  setSent(true);
                })}
              >
                <Field label={t("form.name")} error={e.name?.message} required>
                  {(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!e.name} autoComplete="given-name" {...register("name")} />}
                </Field>
                <Field label={t("form.email")} error={e.email?.message} required>
                  {(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!e.email} type="email" autoComplete="email" {...register("email")} />}
                </Field>
                <div>
                  <Checkbox label={<ConsentLabel />} aria-invalid={!!e.consent} {...register("consent")} />
                  {e.consent && <p role="alert" className="mt-2 text-2xs text-danger">{e.consent.message}</p>}
                </div>
                <TurnstileSlot />
                <div>
                  <Button type="submit" size="lg" disabled={formState.isSubmitting}>
                    {formState.isSubmitting ? t("cta.sending") : t("cta.subscribe")}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
