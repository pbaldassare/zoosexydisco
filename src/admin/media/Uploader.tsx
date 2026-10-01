import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ImagePlus, TriangleAlert } from "lucide-react";
import { Checkbox, Select } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLACEMENTS, uploadBatch, type EventOption, type Placement, type UploadStep } from "./data";

/**
 * Pulsante unico «Carica»: si scelgono i file (anche dalla fotocamera),
 * poi dove compaiono e la serata, poi parte il lotto con l'avanzamento.
 */
export function Uploader({ events }: { events: EventOption[] }) {
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [placement, setPlacement] = useState<Placement[]>(["gallery"]);
  const [eventId, setEventId] = useState("");
  const [steps, setSteps] = useState<UploadStep[]>([]);
  const running = steps.some((s) => s.status === "waiting" || s.status === "working");
  const finished = steps.length > 0 && !running;

  function toggle(p: Placement) {
    setPlacement((cur) => {
      // «Area riservata» esclude il resto: un contenuto riservato non compare altrove.
      if (p === "members") return cur.includes("members") ? ["gallery"] : ["members"];
      const base = cur.filter((x) => x !== "members");
      return base.includes(p) ? base.filter((x) => x !== p) : [...base, p];
    });
  }

  async function start() {
    setSteps(files.map((f) => ({ name: f.name, status: "waiting", progress: 0 })));
    await uploadBatch(files, { placement, eventId: eventId || null }, (i, s) =>
      setSteps((cur) => cur.map((x, j) => (j === i ? { ...x, ...s } : x))),
    );
    await qc.invalidateQueries({ queryKey: ["admin", "media"] });
    await qc.invalidateQueries({ queryKey: ["media"] });
    await qc.invalidateQueries({ queryKey: ["members-media"] });
  }

  function close() {
    setFiles([]);
    setSteps([]);
    if (input.current) input.current.value = "";
  }

  const done = steps.filter((s) => s.status === "done").length;
  const failed = steps.filter((s) => s.status === "error").length;

  return (
    <div className="mt-6">
      <input
        ref={input}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/heic,video/mp4,video/quicktime"
        className="sr-only"
        aria-label="Scegli foto e video"
        onChange={(e) => {
          setSteps([]);
          setFiles(Array.from(e.target.files ?? []));
        }}
      />
      {!files.length && (
        <Button type="button" size="lg" className="w-full sm:w-auto" onClick={() => input.current?.click()}>
          <ImagePlus className="size-5" aria-hidden /> Carica foto e video
        </Button>
      )}

      {files.length > 0 && (
        <div className="rounded-tile border border-line bg-panel/60 p-5">
          <p className="font-bold text-ink">
            {files.length === 1 ? "1 file scelto" : `${files.length} file scelti`}
          </p>

          {!steps.length && (
            <>
              <fieldset className="mt-5">
                <legend className="label mb-3 text-ink-faint">Dove compaiono</legend>
                <div className="grid gap-3">
                  {PLACEMENTS.map((p) => (
                    <Checkbox
                      key={p.id}
                      checked={placement.includes(p.id)}
                      onChange={() => toggle(p.id)}
                      label={
                        <span>
                          <span className="font-bold text-ink">{p.label}</span>
                          <span className="block text-xs">{p.hint}</span>
                        </span>
                      }
                    />
                  ))}
                </div>
              </fieldset>
              <label className="mt-6 grid gap-2">
                <span className="label text-ink-faint">Serata</span>
                <Select value={eventId} onChange={(e) => setEventId(e.target.value)}>
                  <option value="">Nessuna serata</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {new Date(ev.starts_at).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })} · {ev.title}
                    </option>
                  ))}
                </Select>
                <span className="text-xs text-ink-dim">Con una serata, le foto compaiono anche nella sua pagina.</span>
              </label>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="button" onClick={() => void start()} disabled={!placement.length}>
                  Carica {files.length === 1 ? "il file" : `${files.length} file`}
                </Button>
                <Button type="button" variant="ghost" onClick={close}>
                  Annulla
                </Button>
              </div>
              {!placement.length && <p className="mt-2 text-xs text-danger">Scegli almeno un posto in cui farli comparire.</p>}
            </>
          )}

          {steps.length > 0 && (
            <>
              <ul className="mt-4 grid gap-3" aria-live="polite">
                {steps.map((s, i) => (
                  <li key={i} className="grid gap-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate text-ink-dim">{s.name}</span>
                      {s.status === "done" && <Check className="size-4 shrink-0 text-blue-core" aria-label="Caricato" />}
                      {s.status === "error" && <TriangleAlert className="size-4 shrink-0 text-danger" aria-label="Errore" />}
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-pill bg-line" role="progressbar" aria-valuenow={s.progress} aria-valuemin={0} aria-valuemax={100} aria-label={s.name}>
                      <div className={cn("h-full transition-[width]", s.status === "error" ? "bg-danger" : "bg-pink")} style={{ width: `${s.status === "error" ? 100 : s.progress}%` }} />
                    </div>
                    {s.message && <p className="text-xs text-danger">{s.message}</p>}
                  </li>
                ))}
              </ul>
              {finished && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-ink">
                    {done} caricati{failed ? `, ${failed} non riusciti` : ""}.
                  </p>
                  <Button type="button" size="sm" onClick={close}>
                    Fatto
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
