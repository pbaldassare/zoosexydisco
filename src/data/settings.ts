import { PLACEHOLDER } from "@/lib/utils";
import type { SiteSettings } from "./types";

/** Riga unica di site_settings. Dati societari reali; il resto è segnaposto. */
export const settings: SiteSettings = {
  company_name: "Venera S.r.l.s.",
  legal_address: "Via Vincenzo Bellini 43, 24040 Madone (BG)",
  vat_number: "04616100162",
  rea: "BG-476301",
  registry: "Registro Imprese di Bergamo n. 04616100162",
  share_capital: "€ 500,00 i.v.",
  pec: "venerasrls@arubapec.it",
  email: "info@zoosexydisco.it",
  phone: PLACEHOLDER,
  whatsapp: PLACEHOLDER,
  instagram_handle: PLACEHOLDER,
  instagram_url: "",
  google_reviews_url: "",
  address_venue: `Madone (BG) · ${PLACEHOLDER}`,
  maps_query: "ZOO Sexy Disco Madone BG",
  opening_hours: { it: PLACEHOLDER, en: PLACEHOLDER },
  entry_prices: { it: PLACEHOLDER, en: PLACEHOLDER },
  drink_prices: { it: PLACEHOLDER, en: PLACEHOLDER },
  logo_path: "/brand/logo-placeholder.svg",
  upload_video_max_mb: 50,
  upload_video_max_seconds: 90,
};
