import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useLang, pick } from "./useLang";
import type { Media } from "@/data/types";

export const useSettings = () => useQuery({ queryKey: ["settings"], queryFn: api.settings });
/**
 * Tema attivo. Con «?tema=<id>» nell'indirizzo mostra quel tema solo a chi
 * apre il link: è l'anteprima del pannello, i visitatori non la vedono.
 */
export const useActiveTheme = () => {
  const preview = new URLSearchParams(window.location.search).get("tema");
  return useQuery({
    queryKey: ["active-theme", preview],
    queryFn: async () => (preview && (await api.themes()).find((t) => t.id === preview)) || api.activeTheme(),
    staleTime: 5 * 60_000,
  });
};
export const useThemes = () => useQuery({ queryKey: ["themes"], queryFn: api.themes });
export const useEvents = () => useQuery({ queryKey: ["events"], queryFn: api.events });
export const useEvent = (slug: string) => useQuery({ queryKey: ["event", slug], queryFn: () => api.event(slug) });
export const useNextEvent = () => useQuery({ queryKey: ["next-event"], queryFn: api.nextEvent });
export const useTimeline = () => useQuery({ queryKey: ["timeline"], queryFn: api.timeline });
export const useJobRoles = () => useQuery({ queryKey: ["job-roles"], queryFn: api.jobRoles });
export const useReviews = () => useQuery({ queryKey: ["reviews"], queryFn: api.reviews });
export const usePromotions = (a: "public" | "members") => useQuery({ queryKey: ["promotions", a], queryFn: () => api.promotions(a) });
export const useMedia = (opts: Parameters<typeof api.media>[0] = {}) =>
  useQuery({ queryKey: ["media", opts], queryFn: () => api.media(opts) });
export const useMembersMedia = () => useQuery<Media[]>({ queryKey: ["members-media"], queryFn: api.membersMedia });

/** content_blocks nella lingua corrente. */
export function useContent() {
  const lang = useLang();
  const { data } = useQuery({ queryKey: ["content"], queryFn: api.content });
  return (key: string) => pick(data?.[key], lang);
}
