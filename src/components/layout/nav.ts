import type { RouteKey } from "@/lib/routes";

export type NavItem = { key: RouteKey; label: string; children?: NavItem[] };

/** Menu principale, nell'ordine del brief. */
export const MAIN_NAV: NavItem[] = [
  { key: "club", label: "nav.club" },
  { key: "events", label: "nav.events" },
  { key: "shows", label: "nav.shows" },
  { key: "parties", label: "nav.parties" },
  {
    key: "photos",
    label: "nav.gallery",
    children: [
      { key: "photos", label: "nav.photos" },
      { key: "videos", label: "nav.videos" },
    ],
  },
  { key: "work", label: "nav.work" },
  { key: "contacts", label: "nav.contacts" },
];
