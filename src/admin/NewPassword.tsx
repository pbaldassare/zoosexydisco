import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Navigate } from "react-router-dom";
import { Field } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { adminClient } from "@/lib/supabase";
import { AuthShell, Notice } from "./AuthShell";
import { useAuth } from "./auth";
import { PasswordInput } from "./PasswordInput";

const schema = z
  .object({
    password: z.string().min(8, "Almeno 8 caratteri."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Le due password non coincidono." });
type Values = z.infer<typeof schema>;

/** Nuova password: dal link «password dimenticata» o da «Cambia password» nel pannello. */
export function NewPassword() {
  const { status, recovering } = useAuth();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState } = useForm<Values>({ resolver: zodResolver(schema) });
  const e = formState.errors;

  if (status === "loading") return <div className="min-h-screen" aria-busy="true" />;
  if (status === "out") return <Navigate to="/admin/login" replace />;

  const onSubmit = handleSubmit(async (v) => {
    setError("");
    const { error: err } = await adminClient!.auth.updateUser({ password: v.password });
    if (err) {
      setError(err.code === "same_password" ? "È uguale a quella di prima: scegline una diversa." : "Non sono riuscito a salvarla. Riprova.");
      return;
    }
    setDone(true);
  });

  return (
    <AuthShell title="Nuova password">
      {done ? (
        <div className="grid gap-8">
          <Notice tone="ok">Password salvata. D'ora in poi entri con questa.</Notice>
          {/* Dopo il recupero la pagina va ricaricata: la sessione smette di essere «di recupero». */}
          <Button asChild size="lg">
            <a href="/admin">Vai al pannello</a>
          </Button>
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} className="grid gap-6">
          <Field label="Nuova password" hint="Almeno 8 caratteri." error={e.password?.message}>
            {(id, d) => <PasswordInput id={id} autoComplete="new-password" aria-describedby={d} aria-invalid={!!e.password} {...register("password")} />}
          </Field>
          <Field label="Ripeti la password" error={e.confirm?.message}>
            {(id, d) => <PasswordInput id={id} autoComplete="new-password" aria-describedby={d} aria-invalid={!!e.confirm} {...register("confirm")} />}
          </Field>
          {error && <Notice tone="error">{error}</Notice>}
          <Button type="submit" size="lg" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Salvo…" : "Salva la password"}
          </Button>
          {!recovering && (
            <Link to="/admin" className="justify-self-center text-sm text-ink-dim hover:text-ink">
              Annulla
            </Link>
          )}
        </form>
      )}
    </AuthShell>
  );
}
