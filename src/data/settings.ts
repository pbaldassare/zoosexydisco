import { PLACEHOLDER } from "@/lib/utils";
import type { SiteSettings } from "./types";

/**
 * Riga unica di site_settings. Dati societari, contatti e orari sono quelli
 * reali forniti dal cliente; restano segnaposto solo prezzi e Instagram.
 */
export const settings: SiteSettings = {
  company_name: "Venera S.r.l.s.",
  legal_address: "Via Vincenzo Bellini 43, 24040 Madone (BG)",
  vat_number: "04616100162",
  rea: "BG-476301",
  registry: "Registro Imprese di Bergamo n. 04616100162",
  share_capital: "€ 500,00 i.v.",
  pec: "venerasrls@arubapec.it",
  email: "info@zoosexydisco.it",
  phone: "347 587 2376",
  whatsapp: "347 587 2376",
  // Il contatto è a un tocco da ogni schermata (PRODUCT.md, principio 2).
  contacts: [
    { name: "Diana", phone: "347 587 2376" },
    { name: "Alessia", phone: "333 894 2087" },
  ],
  // Giovedì 22–02, venerdì e sabato 22–03:30. Le aperture extra di festività
  // e dicembre si pubblicano di volta in volta come serate.
  opening_windows: [
    { day: 4, open: "22:00", close: "02:00" },
    { day: 5, open: "22:00", close: "03:30" },
    { day: 6, open: "22:00", close: "03:30" },
  ],
  instagram_handle: "zoosexydisco_",
  instagram_url: "https://www.instagram.com/zoosexydisco_/",
  google_reviews_url: "",
  address_venue: "Via Vincenzo Bellini 43, 24040 Madone (BG)",
  maps_query: "ZOO Sexy Disco Madone BG",
  // Riga leggibile, usata dove serve una frase sola (Il locale, Contatti,
  // dati strutturati). Niente orario di chiusura: vale quanto si legge in home.
  opening_hours: {
    it: "Giovedì, venerdì e sabato, dalle 22:00 sino a notte fonda",
    en: "Thursday, Friday and Saturday, from 22:00 until late",
  },
  entry_prices: { it: PLACEHOLDER, en: PLACEHOLDER },
  drink_prices: { it: PLACEHOLDER, en: PLACEHOLDER },
  logo_path: "/brand/logo-zoo.webp",
  upload_video_max_mb: 50,
  upload_video_max_seconds: 90,
};
