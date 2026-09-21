import { z } from "zod";
import type { TFunction } from "i18next";

const phoneRe = /^\+?[\d\s().-]{6,20}$/;

export const contactSchema = (t: TFunction) =>
  z.object({
    name: z.string().trim().min(2, t("form.required")),
    email: z.string().trim().email(t("form.invalidEmail")),
    phone: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || phoneRe.test(v), t("form.invalidPhone")),
    message: z.string().trim().min(5, t("form.required")),
    consent: z.literal(true, { message: t("form.consentRequired") }),
  });

export const partySchema = (t: TFunction) =>
  z.object({
    name: z.string().trim().min(2, t("form.required")),
    phone: z.string().trim().regex(phoneRe, t("form.invalidPhone")),
    email: z.string().trim().email(t("form.invalidEmail")),
    party_type: z.enum(["celibato", "compleanno", "aziendale", "altro"], { message: t("form.required") }),
    party_date: z.string().min(1, t("form.required")),
    guests: z.string().regex(/^[1-9]\d{0,2}$/, t("form.required")),
    notes: z.string().trim().optional(),
    consent: z.literal(true, { message: t("form.consentRequired") }),
  });

export const newsletterSchema = (t: TFunction) =>
  z.object({
    name: z.string().trim().min(2, t("form.required")),
    email: z.string().trim().email(t("form.invalidEmail")),
    consent: z.literal(true, { message: t("form.consentRequired") }),
  });

/** Età compiuta alla data di oggi. Lo stesso controllo lo ripete la Edge Function. */
export function ageFrom(isoDate: string, now = new Date()) {
  const b = new Date(isoDate);
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export const applicationSchema = (t: TFunction) =>
  z.object({
    first_name: z.string().trim().min(2, t("form.required")),
    last_name: z.string().trim().min(2, t("form.required")),
    birth_date: z
      .string()
      .min(1, t("form.required"))
      .refine((v) => !Number.isNaN(Date.parse(v)) && ageFrom(v) >= 18, t("form.underage")),
    city: z.string().trim().optional(),
    phone: z.string().trim().regex(phoneRe, t("form.invalidPhone")),
    email: z.string().trim().email(t("form.invalidEmail")),
    role_id: z.string().min(1, t("form.required")),
    experience: z.string().trim().optional(),
    days: z.array(z.string()),
    period: z.string().trim().optional(),
    travel: z.enum(["yes", "no"]).optional(),
    notes: z.string().trim().optional(),
    consent: z.literal(true, { message: t("form.consentRequired") }),
  });
