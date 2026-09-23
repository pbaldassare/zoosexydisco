import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import type { z } from "zod";
import { FileText, ImagePlus, Info, X } from "lucide-react";
import { Checkbox, ConsentLabel, Field, Input, Select, SentPanel, Textarea, TurnstileSlot } from "@/components/forms/fields";
import { applicationSchema } from "@/components/forms/schemas";
import { PageHero } from "@/components/sections/PageHero";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/ui/seo";
import { useContent, useJobRoles } from "@/hooks/useData";
import { useL } from "@/hooks/useLang";
import { MB, resizeToWebp } from "@/lib/images";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";

type Values = z.infer<ReturnType<typeof applicationSchema>>;
type Photo = { name: string; blob: Blob; preview: string };

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export default function Work() {
  const { t } = useTranslation();
  const c = useContent();
  const l = useL();
  const { data: roles = [] } = useJobRoles();
  const [sent, setSent] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [cv, setCv] = useState<File | null>(null);
  const [extra, setExtra] = useState<File[]>([]);
  const [fileErr, setFileErr] = useState<{ photos?: string; cv?: string; extra?: string }>({});
  const [busy, setBusy] = useState(false);

  const { register, handleSubmit, formState, reset } = useForm<Values>({
    resolver: zodResolver(applicationSchema(t)),
    defaultValues: { days: [], role_id: "" },
  });
  const e = formState.errors;
  const weekdays = t("form.weekdays", { returnObjects: true }) as string[];

  async function addPhotos(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    if (photos.length + incoming.length > 3) return setFileErr((f) => ({ ...f, photos: t("form.tooManyPhotos") }));
    setBusy(true);
    const next: Photo[] = [];
    for (const f of incoming) {
      const typeOk = PHOTO_TYPES.includes(f.type) || /\.(heic|heif)$/i.test(f.name);
      if (!typeOk) {
        setFileErr((x) => ({ ...x, photos: t("form.fileType") }));
        continue;
      }
      if (f.size > 8 * MB) {
        setFileErr((x) => ({ ...x, photos: t("form.fileTooBig") }));
        continue;
      }
      try {
        const blob = await resizeToWebp(f);
        next.push({ name: f.name.replace(/\.[^.]+$/, ".webp"), blob, preview: URL.createObjectURL(blob) });
      } catch {
        setFileErr((x) => ({ ...x, photos: t("form.fileType") }));
      }
    }
    setPhotos((p) => [...p, ...next]);
    if (next.length) setFileErr((x) => ({ ...x, photos: undefined }));
    setBusy(false);
  }

  function pickPdf(list: FileList | null, max: number): File[] | string {
    const files = Array.from(list ?? []);
    if (files.length > max) return t("form.fileTooBig");
    for (const f of files) {
      if (f.type !== "application/pdf") return t("form.fileType");
      if (f.size > 5 * MB) return t("form.fileTooBig");
    }
    return files;
  }

  const onSubmit = handleSubmit(async (v) => {
    if (!photos.length) return setFileErr((x) => ({ ...x, photos: t("form.needPhoto") }));
    const fd = new FormData();
    Object.entries(v).forEach(([k, val]) => fd.append(k, Array.isArray(val) ? JSON.stringify(val) : String(val ?? "")));
    photos.forEach((p) => fd.append("photos", p.blob, p.name));
    if (cv) fd.append("cv", cv);
    extra.forEach((f) => fd.append("extra", f));
    await api.submitApplication(fd);
    // Nessun dato resta nel browser dopo l'invio.
    photos.forEach((p) => URL.revokeObjectURL(p.preview));
    setPhotos([]);
    setCv(null);
    setExtra([]);
    reset();
    setSent(true);
  });

  return (
    <>
      <Seo title={t("work.title")} description={c("work.intro")} />
      <PageHero title={t("work.title")} intro={c("work.intro")} image="/placeholders/show-04.webp" compact />

      <section className="container-site grid gap-12 pt-section md:grid-cols-12">
        <div className="md:col-span-5">
          <h2 className="h2 tube-blue text-2xl">{t("work.roles")}</h2>
          <ul className="divide-y divide-line border-y border-line">
            {roles.map((r) => (
              <li key={r.id} className="tube py-4 text-xl text-ink">
                {l(r.name)}
              </li>
            ))}
          </ul>
          <h2 className="h2 tube-blue mt-12 text-2xl">{t("work.offer")}</h2>
          <p className="text-ink-dim">{c("work.offer")}</p>
        </div>

        <div className="md:col-span-7">
          <h2 className="h2 tube-pink text-2xl">{t("work.form")}</h2>
          {sent ? (
            <SentPanel title={t("form.sentTitle")} body={t("form.appSentBody")} demo />
          ) : (
            <form noValidate onSubmit={onSubmit} className="grid gap-8 sm:grid-cols-2">
              <Field label={t("form.firstName")} error={e.first_name?.message} required>
                {(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!e.first_name} autoComplete="given-name" {...register("first_name")} />}
              </Field>
              <Field label={t("form.lastName")} error={e.last_name?.message} required>
                {(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!e.last_name} autoComplete="family-name" {...register("last_name")} />}
              </Field>
              <Field label={t("form.birthDate")} error={e.birth_date?.message} required>
                {(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!e.birth_date} type="date" max={new Date().toISOString().slice(0, 10)} autoComplete="bday" {...register("birth_date")} />}
              </Field>
              <Field label={t("form.city")}>{(id) => <Input id={id} autoComplete="address-level2" {...register("city")} />}</Field>
              <Field label={t("form.mobile")} error={e.phone?.message} required>
                {(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!e.phone} type="tel" autoComplete="tel" {...register("phone")} />}
              </Field>
              <Field label={t("form.email")} error={e.email?.message} required>
                {(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!e.email} type="email" autoComplete="email" {...register("email")} />}
              </Field>
              <Field label={t("form.role")} error={e.role_id?.message} required className="sm:col-span-2">
                {(id, d) => (
                  <Select id={id} aria-describedby={d} aria-invalid={!!e.role_id} {...register("role_id")}>
                    <option value="" disabled>
                      {t("form.choose")}
                    </option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {l(r.name)}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label={t("form.experience")} className="sm:col-span-2">
                {(id) => <Textarea id={id} {...register("experience")} />}
              </Field>

              <fieldset className="sm:col-span-2">
                <legend className="label mb-3 text-ink-faint">{t("form.days")}</legend>
                <div className="flex flex-wrap gap-2">
                  {weekdays.map((d, i) => (
                    <label key={d} className="cursor-pointer">
                      <input type="checkbox" value={String(i + 1)} className="peer sr-only" {...register("days")} />
                      <span className="inline-flex min-h-11 min-w-14 items-center justify-center rounded-pill border border-line px-3 font-body text-[15px] text-ink-dim transition-colors peer-checked:border-transparent peer-checked:bg-pink peer-checked:text-[#12040F] peer-checked:shadow-[0_0_14px_rgb(var(--pink)/0.4)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-pink">
                        {d}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field label={t("form.period")}>{(id) => <Input id={id} {...register("period")} />}</Field>
              <fieldset>
                <legend className="label mb-3 text-ink-faint">{t("form.travel")}</legend>
                <div className="flex gap-6 pt-2">
                  {(["yes", "no"] as const).map((v) => (
                    <label key={v} className="flex min-h-11 cursor-pointer items-center gap-2 text-ink">
                      <input type="radio" value={v} className="size-4 accent-[rgb(var(--accent))]" {...register("travel")} />
                      {t(`form.${v}`)}
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* foto */}
              <div className="sm:col-span-2">
                <p className="label text-ink-faint">
                  {t("form.photos")} <span className="text-pink">*</span>
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {photos.map((p, i) => (
                    <div key={p.preview} className="relative aspect-[3/4] overflow-hidden rounded-tile border border-line bg-panel">
                      <img src={p.preview} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(p.preview);
                          setPhotos((x) => x.filter((_, k) => k !== i));
                        }}
                        className="absolute right-1 top-1 grid size-9 place-items-center rounded-full bg-wall/80 text-ink transition-colors hover:text-danger"
                        aria-label={`${t("gallery.close")} ${i + 1}`}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 3 && (
                    <label className={cn("flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-2 rounded-tile border border-dashed border-line text-ink-dim transition-colors hover:border-pink hover:text-pink-core", busy && "opacity-50")}>
                      <ImagePlus className="size-6" aria-hidden />
                      <span className="label text-[11px]">+ {3 - photos.length}</span>
                      <input type="file" accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/*" multiple className="sr-only" onChange={(ev) => void addPhotos(ev.target.files)} disabled={busy} />
                    </label>
                  )}
                </div>
                <p className="mt-2 text-xs text-ink-dim">{t("form.photosHint")}</p>
                {fileErr.photos && (
                  <p role="alert" className="mt-2 text-xs text-danger">
                    {fileErr.photos}
                  </p>
                )}
              </div>

              {/* documenti */}
              <div className="sm:col-span-2">
                <label className="label text-ink-faint" htmlFor="cv">
                  {t("form.cv")}
                </label>
                <FilePick
                  id="cv"
                  files={cv ? [cv] : []}
                  onPick={(list) => {
                    const r = pickPdf(list, 1);
                    if (typeof r === "string") setFileErr((x) => ({ ...x, cv: r }));
                    else {
                      setCv(r[0] ?? null);
                      setFileErr((x) => ({ ...x, cv: undefined }));
                    }
                  }}
                />
                {fileErr.cv && <p role="alert" className="mt-2 text-xs text-danger">{fileErr.cv}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label text-ink-faint" htmlFor="extra">
                  {t("form.extra")}
                </label>
                <p className="mt-2 flex gap-2 rounded-tile border-l-2 border-blue bg-blue/5 px-3 py-2 text-xs text-ink">
                  <Info className="mt-px size-4 shrink-0 text-blue" aria-hidden />
                  {t("work.idNote")}
                </p>
                <FilePick
                  id="extra"
                  multiple
                  files={extra}
                  onPick={(list) => {
                    const r = pickPdf(list, 2);
                    if (typeof r === "string") setFileErr((x) => ({ ...x, extra: r }));
                    else {
                      setExtra(r);
                      setFileErr((x) => ({ ...x, extra: undefined }));
                    }
                  }}
                />
                {fileErr.extra && <p role="alert" className="mt-2 text-xs text-danger">{fileErr.extra}</p>}
              </div>

              <Field label={t("form.notes")} className="sm:col-span-2">
                {(id) => <Textarea id={id} {...register("notes")} />}
              </Field>
              <div className="sm:col-span-2">
                <Checkbox label={<ConsentLabel />} aria-invalid={!!e.consent} {...register("consent")} />
                {e.consent && <p role="alert" className="mt-2 text-xs text-danger">{e.consent.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <TurnstileSlot />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={formState.isSubmitting || busy}>
                  {formState.isSubmitting ? t("cta.sending") : t("cta.send")}
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

function FilePick({ id, files, onPick, multiple }: { id: string; files: File[]; onPick: (l: FileList | null) => void; multiple?: boolean }) {
  return (
    <div className="mt-3">
      <label htmlFor={id} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-pill border border-dashed border-line px-5 text-sm text-ink-dim transition-colors hover:border-pink hover:text-pink-core">
        <FileText className="size-5 shrink-0" aria-hidden />
        <span className="truncate">{files.length ? files.map((f) => f.name).join(", ") : "PDF"}</span>
      </label>
      <input id={id} type="file" accept="application/pdf,.pdf" multiple={multiple} className="sr-only" onChange={(e) => onPick(e.target.files)} />
    </div>
  );
}
