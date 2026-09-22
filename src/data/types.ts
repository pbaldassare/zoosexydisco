/**
 * Tipi che rispecchiano le tabelle previste su Supabase (sezione 7 del brief).
 * Oggi i dati arrivano da file locali in src/data; quando si collega Supabase
 * cambia solo src/services/api.ts.
 */
export type L = { it: string; en: string };

/** Una persona da contattare: il telefono è sempre anche WhatsApp. */
export type Contact = { name: string; phone: string };

/**
 * Una finestra di apertura. `day` segue Date.getDay() (domenica = 0);
 * `close` può cadere dopo la mezzanotte, quindi il giorno successivo.
 */
export type OpeningWindow = { day: number; open: string; close: string };

export type SiteSettings = {
  company_name: string;
  legal_address: string;
  vat_number: string;
  rea: string;
  registry: string;
  share_capital: string;
  pec: string;
  email: string;
  phone: string;
  whatsapp: string;
  contacts: Contact[];
  opening_windows: OpeningWindow[];
  instagram_handle: string;
  instagram_url: string;
  google_reviews_url: string;
  address_venue: string;
  maps_query: string;
  opening_hours: L;
  entry_prices: L;
  drink_prices: L;
  logo_path: string;
  upload_video_max_mb: number;
  upload_video_max_seconds: number;
};

export type Theme = {
  id: string;
  name: string;
  accent: string;
  accent_hot: string;
  hero_image_path: string;
  hero_video_path?: string;
  logo_path?: string;
  starts_at?: string;
  ends_at?: string;
  is_default: boolean;
  force_active: boolean;
};

export type EventItem = {
  id: string;
  slug: string;
  title: L;
  starts_at: string;
  ends_at: string;
  dress_code: L;
  description: L;
  cover_path: string;
  entry: L;
  theme_id?: string;
  members_only: boolean;
  published: boolean;
  is_sample: boolean;
};

export type EventStatus = "upcoming" | "tonight" | "archived";

export type Show = {
  id: string;
  title: L;
  description: L;
  schedule: L;
  cover_path: string;
  sort: number;
  published: boolean;
  is_sample: boolean;
};

export type Placement = "gallery" | "home" | "members";

export type Media = {
  id: string;
  kind: "image" | "video";
  path: string;
  thumb_path: string;
  poster_path?: string;
  width: number;
  height: number;
  duration_s?: number;
  event_id?: string;
  placement: Placement[];
  alt?: L;
  visible: boolean;
  sort: number;
  is_sample: boolean;
};

export type Review = {
  id: string;
  author_name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: L;
  source: "google" | "manual";
  review_date: string;
  visible: boolean;
  sort: number;
  is_sample: boolean;
};

export type Promotion = {
  id: string;
  title: L;
  body: L;
  code?: string;
  image_path?: string;
  valid_from: string;
  valid_to: string;
  audience: "public" | "members";
  published: boolean;
};

export type JobRole = { id: string; name: L; active: boolean; sort: number };

export type TimelineStep = { year: L; title: L; text: L };
