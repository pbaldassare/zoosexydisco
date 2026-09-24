import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import type { z } from "zod";
import { Mail, MapPin, Phone } from "lucide-react";
import { Checkbox, ConsentLabel, Field, Input, SentPanel, Textarea, TurnstileSlot } from "@/components/forms/fields";
import { contactSchema } from "@/components/forms/schemas";
import { InstagramQr } from "@/components/sections/InstagramQr";
import { PageHero } from "@/components/sections/PageHero";
import { Button } from "@/components/ui/button";
import { WhatsAppGlyph } from "@/components/ui/icons";
import { Seo } from "@/components/ui/seo";
import { useContent, useSettings } from "@/hooks/useData";
import { useL } from "@/hooks/useLang";
import { nightClubJsonLd } from "@/lib/jsonld";
import { mapsDirections } from "@/lib/maps";
import { telLink, waLink } from "@/lib/whatsapp";
import { api } from "@/services/api";

type Values = z.infer<ReturnType<typeof contactSchema>>;

/** Mappa di Google caricata solo al clic: prima nessuna richiesta verso Google. */
function ClickToMap({ query }: { query: string }) {
  const { t } = useTranslation();
  const [on, setOn] = useState(false);
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-line bg-panel md:aspect-auto md:h-full md:min-h-[420px]">
      {on ? (
        <iframe
          title="Google Maps"
          src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
          className="absolute inset-0 h-full w-full grayscale invert-[0.92] hue-rotate-180"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center p-6 text-center" style={{ background: "radial-gradient(circle at 50% 45%, rgb(var(--pink)/0.14), transparent 60%)" }}>
          <div className="flex max-w-xs flex-col items-center">
            <MapPin className="size-8 text-pink" aria-hidden />
            <Button variant="outline" className="mt-5" onClick={() => setOn(true)}>
              {t("cta.showMap")}
            </Button>
            <p className="mt-4 text-xs text-ink-dim">{t("contacts.mapNote")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Contacts() {
  const { t } = useTranslation();
  const c = useContent();
  const l = useL();
  const { data: s } = useSettings();
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState } = useForm<Values>({ resolver: zodResolver(contactSchema(t)) });
  const e = formState.errors;
  if (!s) return null;
  const tel = telLink(s.phone);

  return (
    <>
      <Seo title={t("contacts.title")} description={c("contacts.intro")} jsonLd={nightClubJsonLd(s)} />
      <PageHero title={t("contacts.title")} intro={c("contacts.intro")} image="/placeholders/locale-03.webp" compact>
        <div className="hero-step mt-8 flex flex-wrap gap-3 [animation-delay:300ms]">
          <Button asChild>
            <a href={waLink(s.whatsapp, t("events.waGeneric"))} target="_blank" rel="noopener">
              <WhatsAppGlyph /> WhatsApp
            </a>
          </Button>
          {tel && (
            <Button asChild variant="outline">
              <a href={tel}>
                <Phone className="size-[19px]" aria-hidden /> {t("cta.call")}
              </a>
            </Button>
          )}
        </div>
      </PageHero>

      <section className="container-site grid gap-12 py-16 md:grid-cols-12 md:py-24">
        <dl className="space-y-8 md:col-span-5">
          {[
            [MapPin, t("contacts.address"), s.address_venue],
            [Phone, t("contacts.phone"), s.phone],
            [WhatsAppGlyph, "WhatsApp", s.whatsapp],
            [Mail, t("contacts.email"), s.email],
          ].map(([Icon, k, v]) => {
            const I = Icon as React.ComponentType<{ className?: string }>;
            return (
              <div key={k as string} className="flex gap-4">
                <I className="mt-1 size-5 shrink-0 text-pink" />
                <div>
                  <dt className="label text-ink-faint">{k as string}</dt>
                  <dd className="mt-1 text-lg text-ink">
                    {k === t("contacts.email") ? (
                      <a href={`mailto:${v}`}>{v as string}</a>
                    ) : k === t("contacts.address") ? (
                      <a href={mapsDirections(v as string)} target="_blank" rel="noopener">
                        {v as string}
                      </a>
                    ) : (
                      (v as string)
                    )}
                  </dd>
                </div>
              </div>
            );
          })}
          <div className="border-t border-line pt-8">
            <dt className="label text-ink-faint">{t("contacts.hours")}</dt>
            <dd className="mt-1 text-ink">{l(s.opening_hours)}</dd>
          </div>
          <div>
            <dt className="label text-ink-faint">{t("contacts.directions")}</dt>
            <dd className="mt-1 text-ink-dim">{c("club.directions")}</dd>
            <dd className="mt-4">
              <Button asChild variant="outline" size="sm">
                <a href={mapsDirections(s.address_venue)} target="_blank" rel="noopener">
                  <MapPin className="size-4" aria-hidden /> {t("cta.directions")}
                </a>
              </Button>
            </dd>
          </div>
        </dl>
        <div className="md:col-span-7">
          <ClickToMap query={s.maps_query} />
        </div>
      </section>

      <section className="pt-section">
        <div className="container-site">
          <div className="wash-panel grid gap-12 rounded-band border border-line p-[clamp(24px,5vw,56px)] md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 className="h2 tube-pink text-2xl">{t("contacts.form")}</h2>
            <div className="mt-10">
              <p className="label mb-4 text-ink-faint">{t("contacts.instagram")}</p>
              <InstagramQr url={s.instagram_url} handle={s.instagram_handle} size={148} />
            </div>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            {sent ? (
              <SentPanel title={t("form.sentTitle")} body={t("form.sentBody")} demo />
            ) : (
              <form
                noValidate
                className="grid gap-8 sm:grid-cols-2"
                onSubmit={handleSubmit(async (v) => {
                  await api.submitContact({ kind: "contact", ...v });
                  setSent(true);
                })}
              >
                <Field label={t("form.name")} error={e.name?.message} required>
                  {(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!e.name} autoComplete="name" {...register("name")} />}
                </Field>
                <Field label={t("form.email")} error={e.email?.message} required>
                  {(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!e.email} type="email" autoComplete="email" {...register("email")} />}
                </Field>
                <Field label={t("form.phoneOptional")} error={e.phone?.message} className="sm:col-span-2">
                  {(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!e.phone} type="tel" autoComplete="tel" {...register("phone")} />}
                </Field>
                <Field label={t("form.message")} error={e.message?.message} required className="sm:col-span-2">
                  {(id, d) => <Textarea id={id} aria-describedby={d} aria-invalid={!!e.message} {...register("message")} />}
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
