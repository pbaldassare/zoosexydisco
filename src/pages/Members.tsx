import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyRound, Mail } from "lucide-react";
import { Field, Input } from "@/components/forms/fields";
import { ProtectedImage } from "@/components/media/ProtectedImage";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/ui/seo";
import { useMembersMedia, usePromotions } from "@/hooks/useData";
import { useL } from "@/hooks/useLang";
import { useVeil } from "@/hooks/useVeil";
import { cn } from "@/lib/utils";

/**
 * Area riservata. Con Supabase: login OTP via email, solo iscritti confermati
 * (utente creato alla conferma della newsletter, shouldCreateUser: false).
 * In anteprima si entra con un'email di prova per vedere la filigrana personale.
 */
export default function Members() {
  const { t } = useTranslation();
  const l = useL();
  const [email, setEmail] = useState("");
  const [demoUser, setDemoUser] = useState<string | null>(null);
  const { data: promos = [] } = usePromotions("members");
  const { data: media = [] } = useMembersMedia();
  const veiled = useVeil();

  return (
    <>
      <Seo title={t("members.title")} description={t("members.intro")} />
      <section className="container-site pb-24 pt-[calc(var(--header-h)+4rem)]">
        <p className="label mb-5 text-accent">{t("nav.members")}</p>
        <h1 className="text-[52px] leading-none sm:text-3xl md:text-4xl">{t("members.title")}</h1>

        {!demoUser ? (
          <div className="mt-10 max-w-lg">
            <p className="text-ink-dim md:text-lg">{t("members.intro")}</p>
            <form
              className="mt-10 grid gap-6"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes("@")) setDemoUser(email.trim());
              }}
            >
              <Field label={t("form.email")}>
                {(id) => <Input id={id} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />}
              </Field>
              <div>
                <Button type="submit">
                  <Mail className="size-4" aria-hidden /> {t("members.enterDemo")}
                </Button>
              </div>
              <p className="text-2xs text-ink-dim">{t("members.demo")}</p>
            </form>
          </div>
        ) : (
          <div className="mt-12 space-y-20">
            <section aria-labelledby="m-promos">
              <h2 id="m-promos" className="label mb-6 text-accent">
                {t("members.promos")}
              </h2>
              <ul className="grid gap-4 md:grid-cols-2">
                {promos.map((p) => (
                  <li key={p.id} className="relative overflow-hidden border border-accent/40 bg-surface p-8">
                    <h3 className="text-xl">{l(p.title)}</h3>
                    <p className="mt-3 text-ink-dim">{l(p.body)}</p>
                    {p.code && (
                      <div className="mt-6 flex items-center gap-4 border-t border-dashed border-line pt-6">
                        <KeyRound className="size-5 text-accent" aria-hidden />
                        <div>
                          <p className="label text-2xs text-ink-dim">{t("members.showCode")}</p>
                          <p className="font-label text-xl font-bold tracking-[0.2em] text-accent">{p.code}</p>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="m-media">
              <h2 id="m-media" className="label mb-6 text-accent">
                {t("members.media")}
              </h2>
              <ul className={cn("grid gap-4 sm:grid-cols-2", veiled && "gallery-veiled")}>
                {media.map((m) => (
                  <li key={m.id}>
                    <ProtectedImage src={m.path} thumb={m.thumb_path} width={m.width} height={m.height} alt="" className="aspect-[3/2]" personalMark={demoUser} />
                  </li>
                ))}
              </ul>
            </section>

            <Button variant="outline" onClick={() => setDemoUser(null)}>
              {t("members.unsubscribe")}
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
