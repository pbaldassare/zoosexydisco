import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Mail, Phone, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppGlyph } from "@/components/ui/icons";
import { adminClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { telLink, waLink } from "@/lib/whatsapp";
import { Notice } from "../AuthShell";
import { deleteRow, saveRow } from "../shared/rows";

type Message = {
  id: string;
  kind: "contact" | "party";
  name: string;
  email: string;
  phone: string | null;
  party_type: string | null;
  party_date: string | null;
  guests: number | null;
  message: string | null;
  handled: boolean;
  delete_after: string;
  created_at: string;
};
const KEY = ["admin", "messages"];
const PARTY: Record<string, string> = { celibato: "Addio al celibato", compleanno: "Compleanno", aziendale: "Festa aziendale", altro: "Altro" };
const when = (iso: string) => new Date(iso).toLocaleString("it-IT", { timeZone: "Europe/Rome", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const daysLeft = (iso: string) => Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 86_400_000));

async function load(): Promise<Message[]> {
  const { data, error } = await adminClient!.from("contact_messages").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Message[];
}

/** Messaggi dal modulo contatti: da gestire in cima, con i pulsanti per rispondere subito. */
export function Messages() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: KEY, queryFn: load });
  const [tab, setTab] = useState<"open" | "done">("open");
  const [confirm, setConfirm] = useState<string | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: KEY });
  const act = useMutation({ mutationFn: (fn: () => Promise<unknown>) => fn(), onSuccess: async () => (setConfirm(null), refresh()) });

  if (list.isLoading) return <p className="text-ink-dim">Carico i messaggi…</p>;
  if (list.error) return <Notice tone="error">Non riesco a leggere i messaggi. Ricarica la pagina.</Notice>;
  const rows = list.data ?? [];
  const open = rows.filter((m) => !m.handled);
  const done = rows.filter((m) => m.handled);
  const shown = tab === "open" ? open : done;
  const chip = (active: boolean) =>
    cn("min-h-11 shrink-0 rounded-pill border px-4 text-[15px] transition-colors", active ? "border-transparent bg-pink font-bold text-[#12040F]" : "border-line text-ink-dim hover:text-ink");

  return (
    <div className="pb-16">
      <h1 className="tube tube-pink text-3xl">Messaggi</h1>
      <p className="mt-3 max-w-prose text-sm text-ink-dim">
        Quello che arriva dal modulo della pagina Contatti. Rispondi con un tocco, poi segnalo come gestito. Ogni messaggio si cancella da solo dopo 12 mesi.
      </p>

      <div className="mt-8 flex gap-2" role="group" aria-label="Quali messaggi">
        <button type="button" aria-pressed={tab === "open"} onClick={() => setTab("open")} className={chip(tab === "open")}>
          Da gestire ({open.length})
        </button>
        <button type="button" aria-pressed={tab === "done"} onClick={() => setTab("done")} className={chip(tab === "done")}>
          Gestiti ({done.length})
        </button>
      </div>

      {!shown.length && <p className="mt-8 text-ink-dim">{tab === "open" ? "Niente da gestire." : "Nessun messaggio gestito."}</p>}
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {shown.map((m) => {
          const tel = m.phone ? telLink(m.phone) : undefined;
          return (
            <li key={m.id} className="py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-lg font-bold text-ink">{m.name}</p>
                <p className="text-sm text-ink-dim">{when(m.created_at)}</p>
              </div>
              {m.kind === "party" && (
                <p className="mt-1 text-sm text-pink-core">
                  {PARTY[m.party_type ?? "altro"]}
                  {m.party_date && ` · ${new Date(m.party_date).toLocaleDateString("it-IT", { day: "numeric", month: "long" })}`}
                  {m.guests && ` · ${m.guests} persone`}
                </p>
              )}
              {m.message && <p className="mt-3 whitespace-pre-line text-ink">{m.message}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {m.phone && (
                  <Button asChild size="sm">
                    <a href={waLink(m.phone, `Ciao ${m.name.split(" ")[0]}, ti scriviamo da ZOO Sexy Disco.`)} target="_blank" rel="noopener">
                      <WhatsAppGlyph className="size-4" /> WhatsApp
                    </a>
                  </Button>
                )}
                {tel && (
                  <Button asChild variant="outline" size="sm">
                    <a href={tel}>
                      <Phone className="size-4" aria-hidden /> {m.phone}
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline" size="sm">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent("ZOO Sexy Disco")}`}>
                    <Mail className="size-4" aria-hidden /> {m.email}
                  </a>
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button type="button" variant="ghost" size="sm" disabled={act.isPending} onClick={() => act.mutate(() => saveRow("contact_messages", m.id, { handled: !m.handled }))}>
                  {m.handled ? <RotateCcw className="size-4" aria-hidden /> : <Check className="size-4" aria-hidden />}
                  {m.handled ? "Rimetti da gestire" : "Segna come gestito"}
                </Button>
                {confirm === m.id ? (
                  <>
                    <Button type="button" size="sm" className="bg-danger text-wall" disabled={act.isPending} onClick={() => act.mutate(() => deleteRow("contact_messages", m.id))}>
                      Sì, cancella
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setConfirm(null)}>
                      No
                    </Button>
                  </>
                ) : (
                  <Button type="button" variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={() => setConfirm(m.id)}>
                    <Trash2 className="size-4" aria-hidden /> Elimina
                  </Button>
                )}
                <span className="ml-auto text-xs text-ink-faint">si cancella tra {daysLeft(m.delete_after)} giorni</span>
              </div>
            </li>
          );
        })}
      </ul>
      {act.isError && <p className="mt-4 text-sm text-danger">Operazione non riuscita. Riprova.</p>}
    </div>
  );
}
