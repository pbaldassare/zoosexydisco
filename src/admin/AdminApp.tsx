import { Helmet } from "react-helmet-async";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import { AdminHome } from "./AdminHome";
import { Applications } from "./applications/Applications";
import { AdminLayout } from "./AdminLayout";
import { EventEditorPage } from "./events/EventEditor";
import { Events } from "./events/Events";
import { Login } from "./Login";
import { Media } from "./media/Media";
import { Messages } from "./messages/Messages";
import { NewPassword } from "./NewPassword";
import { NotAdmin } from "./NotAdmin";
import { Settings } from "./settings/Settings";
import { Promotions } from "./promotions/Promotions";
import { Reviews } from "./reviews/Reviews";
import { Roles } from "./roles/Roles";
import { Samples } from "./samples/Samples";
import { Texts } from "./texts/Texts";
import { ThemeEditor } from "./themes/ThemeEditor";
import { Themes } from "./themes/Themes";

/** Senza sessione si va al login; con sessione ma fuori da admin_users, nessuna sezione. */
function Guard({ children }: { children: React.ReactNode }) {
  const { status, isAdmin, recovering } = useAuth();
  const { pathname } = useLocation();
  if (status === "loading") return <div className="min-h-screen" aria-busy="true" />;
  if (status === "out") return <Navigate to="/admin/login" replace state={{ from: pathname }} />;
  if (recovering) return <Navigate to="/admin/password" replace />;
  if (!isAdmin) return <NotAdmin />;
  return <>{children}</>;
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <Helmet>
        <html lang="it" />
        <title>Admin · ZOO Sexy Disco</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="password" element={<NewPassword />} />
        <Route
          element={
            <Guard>
              <AdminLayout />
            </Guard>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="testi" element={<Texts />} />
          <Route path="impostazioni" element={<Settings />} />
          <Route path="media" element={<Media />} />
          <Route path="eventi" element={<Events />} />
          <Route path="eventi/:id" element={<EventEditorPage />} />
          <Route path="temi" element={<Themes />} />
          <Route path="temi/:id" element={<ThemeEditor />} />
          <Route path="promozioni" element={<Promotions />} />
          <Route path="recensioni" element={<Reviews />} />
          <Route path="ruoli" element={<Roles />} />
          <Route path="esempi" element={<Samples />} />
          <Route path="messaggi" element={<Messages />} />
          <Route path="candidature" element={<Applications />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
