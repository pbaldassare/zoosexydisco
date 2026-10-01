import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Trash2, X } from "lucide-react";
import { Checkbox, Field, Input, Select } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { fmt } from "@/lib/format";
import { Notice } from "../AuthShell";
import { deleteMedia, moveBucket, PLACEMENTS, swapSort, updateMedia, videoUrl, type EventOption, type MediaRow, type Placement } from "./data";

type Props = {
  row: MediaRow;
  preview?: string;
  events: EventOption[];
  /** Vicini nella lista filtrata, per «sposta prima / dopo». */
  prev?: MediaRow;
  next?: MediaRow;
  onClose: () => void;
};

/** Scheda di una foto o di un video: dove compare, serata, descrizione, persona ritratta. */
export function MediaEditor({ row, preview, events, prev, next, onClose }: Props) {
  const qc = useQueryClient();
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onClose);
  const [form, setForm] = useState(() => ({
    placement: row.placement,
    event_id: row.event_id ?? "",
    alt_it: row.alt_it ?? "",
    alt_en: row.alt_en ?? "",
    people_tag: row.people_tag ?? "",
    release_signed: row.release_signed,
    release_date: row.release_date ?? "",
  }));
  const [video, setVideo] = useState<string>();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (row.kind === "video") void videoUrl(row).then(setVideo).catch(() => setVideo(""));
  }, [row]);

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["admin", "media"] });
    await qc.invalidateQueries({ queryKey: ["media"] });
    await qc.invalidateQueries({ queryKey: ["members-media"] });
  };

  const save = useMutation({
    mutationFn: async () => {
      const toMembers = form.placement.includes("members");
      const moved = toMembers !== row.placement.includes("members") ? await moveBucket(row, toMembers) : {};
      await updateMedia(row.id, {
        ...moved,
        placement: form.placement,
        event_id: form.event_id || null,
        alt_it: form.alt_it.trim() || null,
        alt_en: form.alt_en.trim() || null,
        people_tag: form.people_tag.trim().toLowerCase() || null,
        release_signed: form.release_signed,
        release_date: form.release_signed && form.release_date ? form.release_date : null,
      });
    },
    onSuccess: async () => {
      await refresh();
      onClose();
    },
  });
  const quick = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: () => deleteMedia([row]),
    onSuccess: async () => {
      await refresh();
      onClose();
    },
  });

  function toggle(p: Placement) {
    setForm((f) => {
      if (p === "members") return { ...f, placement: f.placement.includes("members") ? ["gallery"] : ["members"] };
      const base = f.placement.filter((x) => x !== "members");
      return { ...f, placement: base.includes(p) ? base.filter((x) => x !== p) : [...base, p] };
    });
  }

  const busy = save.isPending || quick.isPending || remove.isPending;

  return createPortal(
    <div ref={ref} role="dialog" aria-modal="true" aria-label={row.kind === "video" ? "Video" : "Foto"} className="fixed inset-0 z-[70] overflow-y-auto bg-wall/[0.97] backdrop-blur-xl">
      <div className="container-site max-w-3xl py-4">
        <div className="flex items-center justify-between">
          <span className="label text-ink-faint">{row.kind === "video" ? `Video · ${fmt.duration(Number(row.duration_s ?? 0))}` : "Foto"}</span>
          <button type="button" onClick={onClose} aria-label="Chiudi" className="grid size-12 place-items-center rounded-pill text-ink hover:text-pink-core">
            <X className="size-6" aria-hidden />
          </button>
        </div>

        <div className="mt-2 overflow-hidden rounded-tile bg-panel">
          {row.kind === "video" ? (
            video ? (
              <video src={video} poster={preview} controls playsInline className="max-h-[60svh] w-full" />
            ) : (
              <img src={preview} alt="" className="max-h-[60svh] w-full object-contain" />
            )
          ) : (
            <img src={preview} alt="" className="max-h-[60svh] w-full object-contain" />
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => quick.mutate(() => updateMedia(row.id, { visible: !row.visible }))}>
            {row.visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
            {row.visible ? "Nascondi" : "Mostra di nuovo"}
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={busy || !prev} onClick={() => prev && quick.mutate(() => swapSort(row, prev))}>
            <ArrowLeft className="size-4" aria-hidden /> Prima
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={busy || !next} onClick={() => next && quick.mutate(() => swapSort(row, next))}>
            Dopo <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
        {!row.visible && <p className="mt-2 text-sm text-ink-dim">Nascosta: non compare sul sito, ma resta qui.</p>}

        <fieldset className="mt-8">
          <legend className="label mb-3 text-ink-faint">Dove compare</legend>
          <div className="grid gap-3">
            {PLACEMENTS.map((p) => (
              <Checkbox
                key={p.id}
                checked={form.placement.includes(p.id)}
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

        <div className="mt-8 grid gap-6">
          <Field label="Serata">
            {(id) => (
              <Select id={id} value={form.event_id} onChange={(e) => setForm((f) => ({ ...f, event_id: e.target.value }))}>
                <option value="">Nessuna serata</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {new Date(ev.starts_at).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })} · {ev.title}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Descrizione · italiano" hint="Per chi non vede le immagini. Facoltativa.">
              {(id, d) => <Input id={id} aria-describedby={d} value={form.alt_it} onChange={(e) => setForm((f) => ({ ...f, alt_it: e.target.value }))} />}
            </Field>
            <Field label="Descrizione · inglese">
              {(id) => <Input id={id} lang="en" value={form.alt_en} onChange={(e) => setForm((f) => ({ ...f, alt_en: e.target.value }))} />}
            </Field>
          </div>
          <Field label="Persona ritratta" hint="Un nome di riferimento, per esempio «giulia». Serve a togliere in un colpo solo tutte le sue foto se lo chiede.">
            {(id, d) => <Input id={id} aria-describedby={d} value={form.people_tag} onChange={(e) => setForm((f) => ({ ...f, people_tag: e.target.value }))} />}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
            <Checkbox checked={form.release_signed} onChange={(e) => setForm((f) => ({ ...f, release_signed: e.target.checked }))} label="Liberatoria firmata" />
            {form.release_signed && (
              <Field label="Data della liberatoria">
                {(id) => <Input id={id} type="date" value={form.release_date} onChange={(e) => setForm((f) => ({ ...f, release_date: e.target.value }))} />}
              </Field>
            )}
          </div>
        </div>

        {(save.isError || quick.isError || remove.isError) && (
          <div className="mt-6">
            <Notice tone="error">Operazione non riuscita. Riprova.</Notice>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-6">
          <Button type="button" onClick={() => save.mutate()} disabled={busy || !form.placement.length}>
            {save.isPending ? "Salvo…" : "Salva"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Annulla
          </Button>
          <span className="flex-1" />
          {confirmDelete ? (
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-danger">Si cancella per sempre.</span>
              <Button type="button" size="sm" className="bg-danger text-wall" disabled={busy} onClick={() => remove.mutate()}>
                Sì, cancella
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                No
              </Button>
            </span>
          ) : (
            <Button type="button" variant="ghost" onClick={() => setConfirmDelete(true)} className="text-danger hover:text-danger">
              <Trash2 className="size-4" aria-hidden /> Elimina
            </Button>
          )}
        </div>
        {!form.placement.length && <p className="mt-2 text-xs text-danger">Scegli almeno un posto in cui farla comparire.</p>}
      </div>
    </div>,
    document.body,
  );
}
