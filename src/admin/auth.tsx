import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { adminClient } from "@/lib/supabase";

/**
 * Stato dell'accesso admin. Essere loggati non basta: is_admin() controlla
 * admin_users sul server, e le RLS rifiutano comunque chi non c'è.
 */
type AuthState = {
  status: "loading" | "out" | "in";
  session: Session | null;
  isAdmin: boolean;
  /** true quando si arriva dal link «password dimenticata». */
  recovering: boolean;
};

const AuthContext = createContext<AuthState>({ status: "loading", session: null, isAdmin: false, recovering: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", session: null, isAdmin: false, recovering: false });

  useEffect(() => {
    if (!adminClient) {
      setState({ status: "out", session: null, isAdmin: false, recovering: false });
      return;
    }
    const db = adminClient;
    let alive = true;

    async function apply(session: Session | null, recovering = false) {
      if (!session) {
        if (alive) setState({ status: "out", session: null, isAdmin: false, recovering: false });
        return;
      }
      const { data } = await db.rpc("is_admin");
      if (alive) setState({ status: "in", session, isAdmin: data === true, recovering });
    }

    void db.auth.getSession().then(({ data }) => apply(data.session));
    // Il callback non deve attendere altre chiamate Supabase: le rimandiamo.
    const { data: sub } = db.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
      setTimeout(() => void apply(session, event === "PASSWORD_RECOVERY"), 0);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export async function signOut() {
  await adminClient?.auth.signOut();
}
