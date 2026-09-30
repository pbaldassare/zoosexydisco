import { Button } from "@/components/ui/button";
import { AuthShell, Notice } from "./AuthShell";
import { signOut, useAuth } from "./auth";

/** Account valido ma non in admin_users: niente pannello. */
export function NotAdmin() {
  const { session } = useAuth();
  return (
    <AuthShell title="Accesso negato">
      <div className="grid gap-8">
        <Notice tone="error">L'account {session?.user.email} non è abilitato al pannello.</Notice>
        <Button variant="outline" size="lg" onClick={() => void signOut()}>
          Esci
        </Button>
      </div>
    </AuthShell>
  );
}
