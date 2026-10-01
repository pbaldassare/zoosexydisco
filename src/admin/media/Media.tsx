import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EyeOff, Play } from "lucide-react";
import { Select } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Notice } from "../AuthShell";
import { deleteMedia, loadEvents, loadMedia, PLACEMENTS, previewUrls, updateMedia, type MediaRow, type Placement } from "./data";
import { MediaEditor } from "./MediaEditor";
import { Uploader } from "./Uploader";

type Kind = "all" | "image" | "video";

/** Foto e video del sito: carica, filtra, apri la scheda di ognuno. */
export function Media() {
  const media = useQuery({ queryKey: ["admin", "media"], queryFn: loadMedia });
  const events = useQuery({ queryKey: ["admin", "events-options"], queryFn: loadEvents });
  const rows = useMemo(() => media.data ?? [], [media.data]);
  const previews = useQuery({ queryKey: ["admin", "media-previews", rows.map((r) => r.id + r.bucket).join()], queryFn: () => previewUrls(rows), enabled: rows.length > 0 });

  const [kind, setKind] = useState<Kind>("all");
  const [where, setWhere] = useState<Placement | "all">("all");
  const [eventId, setEventId] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const list = rows.filter(
    (r) => (kind === "all" || r.kind === kind) && (where === "all" || r.placement.includes(where)) && (!eventId || r.event_id === eventId),
  );
  const current = list.findIndex((r) => r.id === open);
  const openRow = current >= 0 ? list[current] : rows.find((r) => r.id === open);

  if (media.isLoading) return <p className="text-ink-dim">Carico foto e video…</p>;
  if (media.error) return <Notice tone="error">Non riesco a leggere foto e video. Ricarica la pagina.</Notice>;

  const chip = (active: boolean) =>
    cn("min-h-11 shrink-0 rounded-pill border px-4 text-[15px] transition-colors", active ? "border-transparent bg-pink font-bold text-[#12040F]" : "border-line text-ink-dim hover:text-ink");

  return (
    <div className="pb-16">
      <h1 className="tube tube-pink text-3xl">Media</h1>
      <p className="mt-3 max-w-prose text-sm text-ink-dim">
        Le foto si rimpiccioliscono e perdono i dati nascosti (posizione GPS compresa) prima di partire dal telefono. Video MP4 o MOV.
      </p>

      <Uploader events={events.data ?? []} />

      <h2 className="tube tube-blue mt-12 text-2xl">Sul sito</h2>
      <div className="-mx-gutter mt-4 flex gap-2 overflow-x-auto px-gutter pb-1" role="group" aria-label="Tipo">
        {(
          [
            ["all", "Tutti"],
            ["image", "Foto"],
            ["video", "Video"],
          ] as const
        ).map(([k, label]) => (
          <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={chip(kind === k)}>
            {label}
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Select aria-label="Dove compaiono" value={where} onChange={(e) => setWhere(e.target.value as Placement | "all")}>
          <option value="all">Ovunque</option>
          {PLACEMENTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>
        <Select aria-label="Serata" value={eventId} onChange={(e) => setEventId(e.target.value)}>
          <option value="">Tutte le serate</option>
          {(events.data ?? []).map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </Select>
      </div>

      <p className="mt-6 text-sm text-ink-dim">{list.length === 1 ? "1 elemento" : `${list.length} elementi`} · tocca per aprire la scheda</p>
      {!list.length && <p className="mt-6 text-ink-dim">Niente da mostrare con questi filtri.</p>}
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {list.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => setOpen(r.id)}
              className="group relative block aspect-square w-full overflow-hidden rounded-[18px] bg-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink"
              aria-label={`${r.kind === "video" ? "Video" : "Foto"}${r.visible ? "" : ", nascosta"}: apri la scheda`}
            >
              {previews.data?.[r.id] && (
                <img src={previews.data[r.id]} alt="" loading="lazy" className={cn("h-full w-full object-cover transition-transform group-hover:scale-105", !r.visible && "opacity-35 grayscale")} />
              )}
              <span className="absolute left-2 top-2 flex flex-wrap gap-1">
                {r.kind === "video" && (
                  <span className="label inline-flex items-center gap-1 rounded-pill bg-wall/80 px-2 py-1 text-ink">
                    <Play className="size-3" aria-hidden /> {fmt.duration(Number(r.duration_s ?? 0))}
                  </span>
                )}
                {!r.visible && (
                  <span className="label inline-flex items-center gap-1 rounded-pill bg-wall/80 px-2 py-1 text-ink">
                    <EyeOff className="size-3" aria-hidden /> Nascosta
                  </span>
                )}
                {r.is_sample && <span className="label rounded-pill bg-sample px-2 py-1 text-wall">Esempio</span>}
              </span>
              <span className="label absolute bottom-2 left-2 rounded-pill bg-wall/80 px-2 py-1 text-ink-dim">
                {r.placement.map((p) => PLACEMENTS.find((x) => x.id === p)?.label).join(" · ")}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <RemovePerson rows={rows} />

      {openRow && (
        <MediaEditor
          key={openRow.id}
          row={openRow}
          preview={previews.data?.[openRow.id]}
          events={events.data ?? []}
          prev={current > 0 ? list[current - 1] : undefined}
          next={current >= 0 && current < list.length - 1 ? list[current + 1] : undefined}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

/** «Rimuovi ovunque»: se una persona lo chiede, via tutte le sue foto e i suoi video in un colpo. */
function RemovePerson({ rows }: { rows: MediaRow[] }) {
  const qc = useQueryClient();
  const people = [...new Set(rows.map((r) => r.people_tag).filter((p): p is string => !!p))].sort();
  const [who, setWho] = useState("");
  const [confirm, setConfirm] = useState(false);
  const theirs = rows.filter((r) => r.people_tag === who);
  const visible = theirs.filter((r) => r.visible);

  const refresh = async () => {
    setConfirm(false);
    await qc.invalidateQueries({ queryKey: ["admin", "media"] });
    await qc.invalidateQueries({ queryKey: ["media"] });
    await qc.invalidateQueries({ queryKey: ["members-media"] });
  };
  const hide = useMutation({ mutationFn: () => Promise.all(visible.map((r) => updateMedia(r.id, { visible: false }))), onSuccess: refresh });
  const erase = useMutation({ mutationFn: () => deleteMedia(theirs), onSuccess: async () => (setWho(""), refresh()) });

  return (
    <section className="mt-16 rounded-tile border border-line p-5">
      <h2 className="tube tube-pink text-2xl">Rimuovi ovunque</h2>
      <p className="mt-2 text-sm text-ink-dim">
        Se una persona chiede di non comparire più, scegli il suo nome: puoi nascondere o cancellare tutte le foto e i video in cui è segnata.
      </p>
      {!people.length ? (
        <p className="mt-4 text-sm text-ink-faint">Nessuna persona segnata finora. Si segna dalla scheda di ogni foto, alla voce «Persona ritratta».</p>
      ) : (
        <>
          <Select className="mt-4" aria-label="Persona" value={who} onChange={(e) => (setWho(e.target.value), setConfirm(false))}>
            <option value="">Scegli una persona</option>
            {people.map((p) => (
              <option key={p} value={p}>
                {p} ({rows.filter((r) => r.people_tag === p).length})
              </option>
            ))}
          </Select>
          {who && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" size="sm" disabled={!visible.length || hide.isPending} onClick={() => hide.mutate()}>
                Nascondi {visible.length ? `tutti (${visible.length})` : "— già tutti nascosti"}
              </Button>
              {confirm ? (
                <>
                  <span className="text-sm text-danger">Cancelli {theirs.length} file per sempre?</span>
                  <Button type="button" size="sm" className="bg-danger text-wall" disabled={erase.isPending} onClick={() => erase.mutate()}>
                    Sì, cancella
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setConfirm(false)}>
                    No
                  </Button>
                </>
              ) : (
                <Button type="button" variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={() => setConfirm(true)}>
                  Cancella tutti ({theirs.length})
                </Button>
              )}
            </div>
          )}
          {(hide.isError || erase.isError) && <p className="mt-2 text-sm text-danger">Operazione non riuscita. Riprova.</p>}
        </>
      )}
    </section>
  );
}
