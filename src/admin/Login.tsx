import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Field, Input } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { adminClient } from "@/lib/supabase";
import { AuthShell, Notice } from "./AuthShell";
import { useAuth } from "./auth";
import { PasswordInput } from "./PasswordInput";

const schema = z.object({
  email: z.string().trim().email("Scrivi un indirizzo email valido."),
  password: z.string().min(1, "Scrivi la password."),
});
type Values = z.infer<typeof schema>;

export function Login() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/admin";
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, getValues, formState } = useForm<Values>({ resolver: zodResolver(schema) });
  const e = formState.errors;

  if (status === "in") return <Navigate to={from} replace />;

  if (!adminClient) {
    return (
      <AuthShell title="Admin">
        <Notice tone="error">Supabase non è configurato: mancano VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.</Notice>
      </AuthShell>
    );
  }
  const db = adminClient;

  const onSubmit = handleSubmit(async (v) => {
    setError("");
    const { error: err } = await db.auth.signInWithPassword(v);
    if (err) {
      setError(err.message === "Invalid login credentials" ? "Email o password sbagliate." : "Accesso non riuscito. Riprova tra poco.");
      return;
    }
    navigate(from, { replace: true });
  });

  async function forgot() {
    setError("");
    const email = getValues("email")?.trim();
    if (!z.string().email().safeParse(email).success) {
      setError("Scrivi prima la tua email, poi premi «Password dimenticata».");
      return;
    }
    await db.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin/password` });
    // Stessa risposta che l'email esista o no: non diciamo chi è registrato.
    setSent(true);
  }

  return (
    <AuthShell title="Accesso admin">
      <form noValidate onSubmit={onSubmit} className="grid gap-6">
        <Field label="Email" error={e.email?.message}>
          {(id, d) => <Input id={id} type="email" autoComplete="username" inputMode="email" aria-describedby={d} aria-invalid={!!e.email} {...register("email")} />}
        </Field>
        <Field label="Password" error={e.password?.message}>
          {(id, d) => <PasswordInput id={id} autoComplete="current-password" aria-describedby={d} aria-invalid={!!e.password} {...register("password")} />}
        </Field>
        {error && <Notice tone="error">{error}</Notice>}
        {sent && <Notice tone="ok">Se l'indirizzo è registrato, arriva un'email con il link per scegliere una nuova password.</Notice>}
        <Button type="submit" size="lg" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? "Accesso…" : "Entra"}
        </Button>
        <button type="button" onClick={forgot} className="justify-self-center text-sm text-ink-dim underline-offset-4 hover:text-pink-core hover:underline">
          Password dimenticata
        </button>
      </form>
      <p className="mt-12 text-center text-sm">
        <Link to="/it" className="text-ink-faint hover:text-ink">
          ← Torna al sito
        </Link>
      </p>
    </AuthShell>
  );
}
