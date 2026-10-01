import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Notice } from "../AuthShell";
import { countSamples, removeSamples, SAMPLE_TABLES, SAMPLES_KEY } from "./data";

/** Quanti contenuti di esempio restano, e il pulsante per toglierli tutti quando arrivano quelli veri. */
export function Samples() {
  const qc = useQueryClient();
  const counts = useQuery({ queryKey: SAMPLES_KEY, queryFn: countSamples });
  const [confirm, setConfirm] = useState(false);
  const remove = useMutation({
    mutationFn: removeSamples,
    onSuccess: async () => {
      setConfirm(false);
      // Cambia mezzo sito: si rilegge tutto.
      await qc.invalidateQueries();
    },
  });
  const total = Object.values(counts.data ?? {}).reduce((a, b) => a + b, 0);

  return (
    <div className="pb-16">
      <h1 className="tube tube-pink text-3xl">Esempi</h1>
      <p className="mt-3 max-w-prose text-sm text-ink-dim">
        Il sito è partito con contenuti di esempio: immagini segnaposto senza persone, serate e recensioni inventate. Nel pannello hanno il segno «Esempio».
        Quando avete caricato i vostri, toglieteli tutti da qui. Testi, impostazioni e ruoli restano: quelli si modificano.
      </p>

      {counts.isLoading ? (
        <p className="mt-8 text-ink-dim">Conto…</p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {SAMPLE_TABLES.map(({ table, label }) => (
            <li key={table} className="flex items-center justify-between py-4">
              <span className="text-ink">{label}</span>
              <span className={counts.data?.[table] ? "font-bold text-ink" : "text-ink-faint"}>{counts.data?.[table] ?? 0}</span>
            </li>
          ))}
        </ul>
      )}

      {remove.isError && (
        <div className="mt-6">
          <Notice tone="error">Qualcosa non è andato: una parte potrebbe essere già stata tolta. Riprova, il pulsante riparte da quello che resta.</Notice>
        </div>
      )}
      {remove.isSuccess && !total && (
        <div className="mt-6">
          <Notice tone="ok">Fatto: sul sito restano solo i vostri contenuti.</Notice>
        </div>
      )}

      {total > 0 && (
        <div className="mt-8 rounded-tile border border-danger/40 p-5">
          {confirm ? (
            <>
              <p className="text-ink">
                Si cancellano per sempre {total} contenuti di esempio, con le loro immagini. Le serate di esempio spariscono dal sito, e le pagine che non
                hanno ancora foto vostre tornano alle immagini di riserva.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button type="button" className="bg-danger text-wall" disabled={remove.isPending} onClick={() => remove.mutate()}>
                  {remove.isPending ? "Tolgo…" : "Sì, togli tutto"}
                </Button>
                <Button type="button" variant="ghost" disabled={remove.isPending} onClick={() => setConfirm(false)}>
                  No
                </Button>
              </div>
            </>
          ) : (
            <Button type="button" variant="ghost" className="text-danger hover:text-danger" onClick={() => setConfirm(true)}>
              Rimuovi tutti i contenuti di esempio
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
