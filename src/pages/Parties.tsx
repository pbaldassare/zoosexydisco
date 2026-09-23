import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import type { z } from "zod";
import { Checkbox, ConsentLabel, Field, Input, Select, SentPanel, Textarea, TurnstileSlot } from "@/components/forms/fields";
import { partySchema } from "@/components/forms/schemas";
import { PageHero } from "@/components/sections/PageHero";
import { Button } from "@/components/ui/button";
import { WhatsAppGlyph } from "@/components/ui/icons";
import { Seo } from "@/components/ui/seo";
import { useContent, useSettings } from "@/hooks/useData";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/whatsapp";
import { api } from "@/services/api";

type Values = z.infer<ReturnType<typeof partySchema>>;

const KINDS = [
  { key: "celibato", img: "/placeholders/party-celibato.webp" },
  { key: "compleanni", img: "/placeholders/party-compleanni.webp" },
  { key: "aziendali", img: "/placeholders/party-aziendali.webp" },
] as const;

export default function Parties() {
  const { t, i18n } = useTranslation();
  const c = useContent();
  const { data: s } = useSettings();
  const en = i18n.language === "en";
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState } = useForm<Values>({
    resolver: zodResolver(partySchema(t)),
    defaultValues: { party_type: undefined, notes: "" },
  });
  const e = formState.errors;
  const types = t("form.partyTypes", { returnObjects: true }) as Record<string, string>;

  return (
    <>
      <Seo title={t("parties.title")} description={c("parties.intro")} />
      <PageHero title={en ? "Your night," : "La vostra notte,"} accent={en ? "our table." : "il nostro tavolo."} intro={c("parties.intro")} image="/placeholders/party-compleanni.webp" />

      <section className="container-site pt-section">
        <ul className="grid list-none gap-12 p-0 md:grid-cols-3 md:gap-6">
          {KINDS.map((k, i) => (
            <li key={k.key} className={i === 1 ? "md:mt-16" : i === 2 ? "md:mt-32" : undefined}>
              <img src={k.img} alt="" width={1600} height={1067} loading="lazy" className="aspect-[4/5] w-full rounded-card border border-line object-cover" />
              <h2 className={cn("tube mt-6 text-2xl", i === 1 ? "tube-blue" : "tube-pink")}>{t(`parties.${k.key}`)}</h2>
              <p className="mt-3 text-ink-dim">{c(`parties.${k.key}`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="pt-section" aria-labelledby="party-form">
        <div className="container-site">
          <div className="wash-panel grid gap-12 rounded-band border border-line p-[clamp(24px,5vw,56px)] md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 id="party-form" className="h2 tube-pink text-2xl">
              {t("parties.formTitle")}
            </h2>
            <p className="mt-6 text-ink-dim">{t("parties.orWhatsapp")}</p>
            <Button asChild variant="outline" className="mt-4">
              <a href={waLink(s?.whatsapp ?? "", t("events.waGeneric"))} target="_blank" rel="noopener">
                <WhatsAppGlyph /> WhatsApp
              </a>
            </Button>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            {sent ? (
              <SentPanel title={t("form.sentTitle")} body={t("form.sentBody")} demo />
            ) : (
              <form
                noValidate
                className="grid gap-8 sm:grid-cols-2"
                onSubmit={handleSubmit(async (v) => {
                  await api.submitContact({ kind: "party", ...v });
                  setSent(true);
                })}
              >
                <Field label={t("form.name")} error={e.name?.message} required>
                  {(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!e.name} autoComplete="name" {...register("name")} />}
                </Field>
                <Field label={t("form.phone")} error={e.phone?.message} required>
                  {(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!e.phone} type="tel" autoComplete="tel" {...register("phone")} />}
                </Field>
                <Field label={t("form.email")} error={e.email?.message} required className="sm:col-span-2">
                  {(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!e.email} type="email" autoComplete="email" {...register("email")} />}
                </Field>
                <Field label={t("form.partyType")} error={e.party_type?.message} required>
                  {(id, d) => (
                    <Select id={id} aria-describedby={d} aria-invalid={!!e.party_type} defaultValue="" {...register("party_type")}>
                      <option value="" disabled>
                        {t("form.choose")}
                      </option>
                      {Object.entries(types).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
                <Field label={t("form.partyDate")} error={e.party_date?.message} required>
                  {(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!e.party_date} type="date" min={new Date().toISOString().slice(0, 10)} {...register("party_date")} />}
                </Field>
                <Field label={t("form.guests")} error={e.guests?.message} required>
                  {(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!e.guests} type="number" inputMode="numeric" min={1} {...register("guests")} />}
                </Field>
                <Field label={t("form.notes")} className="sm:col-span-2">
                  {(id) => <Textarea id={id} {...register("notes")} />}
                </Field>
                <div className="sm:col-span-2">
                  <Checkbox label={<ConsentLabel />} aria-invalid={!!e.consent} {...register("consent")} />
                  {e.consent && (
                    <p role="alert" className="mt-2 text-xs text-danger">
                      {e.consent.message}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <TurnstileSlot />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={formState.isSubmitting}>
                    {formState.isSubmitting ? t("cta.sending") : t("cta.send")}
                  </Button>
                </div>
              </form>
            )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
