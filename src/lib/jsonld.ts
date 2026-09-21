import type { EventItem, SiteSettings } from "@/data/types";
import { isPlaceholder } from "./utils";
import type { Lang } from "./routes";

const SITE = import.meta.env.VITE_SITE_URL || "https://www.zoosexydisco.it";

export function nightClubJsonLd(s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "NightClub",
    name: "ZOO Sexy Disco",
    url: SITE,
    image: `${SITE}/og-image.jpg`,
    email: s.email,
    ...(isPlaceholder(s.phone) ? {} : { telephone: s.phone }),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Madone",
      addressRegion: "BG",
      postalCode: "24040",
      addressCountry: "IT",
    },
    parentOrganization: { "@type": "Organization", name: s.company_name, vatID: `IT${s.vat_number}` },
  };
}

export function eventJsonLd(e: EventItem, lang: Lang, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title[lang] || e.title.it,
    startDate: e.starts_at,
    endDate: e.ends_at,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    description: e.description[lang] || e.description.it,
    image: `${SITE}${e.cover_path}`,
    url: `${SITE}${url}`,
    typicalAgeRange: "18-",
    location: {
      "@type": "NightClub",
      name: "ZOO Sexy Disco",
      address: { "@type": "PostalAddress", addressLocality: "Madone", addressRegion: "BG", postalCode: "24040", addressCountry: "IT" },
    },
    organizer: { "@type": "Organization", name: "ZOO Sexy Disco", url: SITE },
  };
}
