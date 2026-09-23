import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { LANGS, ROUTES, type Lang, type RouteKey } from "@/lib/routes";
import { safeStorage } from "@/lib/utils";
import Home from "@/pages/Home";

const pages: Record<Exclude<RouteKey, "home">, React.LazyExoticComponent<React.ComponentType>> = {
  club: lazy(() => import("@/pages/Club")),
  events: lazy(() => import("@/pages/Events")),
  event: lazy(() => import("@/pages/EventDetail")),
  photos: lazy(() => import("@/pages/GalleryPhotos")),
  videos: lazy(() => import("@/pages/GalleryVideos")),
  work: lazy(() => import("@/pages/Work")),
  contacts: lazy(() => import("@/pages/Contacts")),
  newsletter: lazy(() => import("@/pages/Newsletter")),
  newsletterConfirm: lazy(() => import("@/pages/NewsletterConfirm")),
  members: lazy(() => import("@/pages/Members")),
  privacy: lazy(() => import("@/pages/Privacy")),
};
const NotFound = lazy(() => import("@/pages/NotFound"));
const Admin = lazy(() => import("@/admin/AdminPlaceholder"));

/** «/» → lingua salvata dall'utente, altrimenti quella del browser. */
function RootRedirect() {
  const saved = safeStorage.get("zoo.lang") as Lang | null;
  const browser = (navigator.language || "it").slice(0, 2).toLowerCase();
  const lang: Lang = saved && LANGS.includes(saved) ? saved : browser === "it" ? "it" : "en";
  return <Navigate to={`/${lang}`} replace />;
}

function PageFallback() {
  return <div className="min-h-[70vh]" aria-busy="true" />;
}

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/admin/*" element={<Admin />} />
          {LANGS.map((lang) => (
            <Route key={lang} path={`/${lang}`} element={<SiteLayout />}>
              <Route index element={<Home />} />
              {(Object.keys(pages) as Array<keyof typeof pages>).map((key) => {
                const Page = pages[key];
                return <Route key={key} path={ROUTES[key][lang]} element={<Page />} />;
              })}
              <Route path="*" element={<NotFound />} />
            </Route>
          ))}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
