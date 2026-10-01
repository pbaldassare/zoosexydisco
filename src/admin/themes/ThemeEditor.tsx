import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Film, Power, Trash2 } from "lucide-react";
import { Field, Input } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { Notice } from "../AuthShell";
import { fromRome, toRome } from "../events/rome";
import { probeVideo } from "../media/process";
import { newName, removeFiles, uploadResumable } from "../media/upload";
import { loadLimits } from "../media/data";
import { assetUrl, deleteTheme, forceTheme, invalidateThemes, loadThemes, saveTheme, type ThemeRow } from "./data";

const HEX = /^#[0-9A-Fa-f]{6}$/;

type Form = { name: string; accent: string; accent_hot: string; from_date: string; from_time: string; to_date: string; to_time: string };

function toForm(t?: ThemeRow): Form {
  const f = t?.starts_at ? fromRome(t.starts_at) : null;
  const e = t?.ends_at ? fromRome(t.ends_at) : null;
  return {
    name: t?.name ?? "",
    accent: t?.accent ?? "#E939D7",
    accent_hot: t?.accent_hot ?? "#3B81E9",
    from_date: f?.date ?? "",
    from_time: f?.time ?? "12:00",
    to_date: e?.date ?? "",
    to_time: e?.time ?? "06:00",
  };
}

/** Un colore: il selettore del telefono e il codice, che si possono usare tutti e due. */
function ColorField({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label} hint={hint} error={HEX.test(value) ? undefined : "Un colore come #E939D7."}>
      {(id, d) => (
        <div className="flex items-center gap-3">
          <input type="color" aria-label={`${label}, selettore`} value={HEX.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value.toUpperCase())} className="size-[52px] shrink-0 cursor-pointer rounded-pill border-[1.5px] border-line bg-transparent p-1" />
          <Input id={id} aria-describedby={d} value={value} onChange={(e) => onChange(e.target.value.trim())} className="font-mono uppercase" maxLength={7} />
        </div>
      )}
    </Field>
  );
}

export function ThemeEditor() {
  const { id = "nuovo" } = useParams();
  const isNew = id === "nuovo";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const themes = useQuery({ queryKey: ["admin", "themes"], queryFn: loadThemes });
  const theme = themes.data?.find((t) => t.id === id);
  if (themes.isLoading) return <p className="text-ink-dim">Carico…</p>;
  if (!isNew && !theme) return <Notice tone="error">Questo tema non esiste più.</Notice>;
  return <ThemeForm key={id} theme={theme} onDone={() => navigate("/admin/temi")} invalidate={() => invalidateThemes(qc)} />;
}

function ThemeForm({ theme, onDone, invalidate }: { theme?: ThemeRow; onDone: () => void; invalidate: () => Promise<unknown> }) {
  const [form, setForm] = useState<Form>(() => toForm(theme));
  const [video, setVideo] = useState<string | null>(theme?.hero_video_path ?? null);
  const [progress, setProgress] = useState<number | null>(null);
  const [videoError, setVideoError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  // Video caricato ma non ancora salvato nel tema: se si esce senza salvare, si cancella.
  const unsaved = useRef<string | null>(null);
  useEffect(() => () => void (unsaved.current && removeFiles("theme-assets", [unsaved.current])), []);
  const set = (k: keyof Form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const scheduled = !!(form.from_date && form.to_date);
  const halfSchedule = !!form.from_date !== !!form.to_date;
  const starts = scheduled ? toRome(form.from_date, form.from_time) : null;
  const ends = scheduled ? toRome(form.to_date, form.to_time) : null;
  const badRange = scheduled && starts! >= ends!;
  const invalid = !form.name.trim() || !HEX.test(form.accent) || !HEX.test(form.accent_hot) || halfSchedule || badRange || progress !== null;

  async function pickVideo(file: File) {
    setVideoError("");
    try {
      if (file.type !== "video/mp4") throw new Error("Per lo sfondo serve un MP4: il MOV non parte su tutti i telefoni.");
      await probeVideo(file, await loadLimits());
      const path = newName("mp4");
      setProgress(0);
      await uploadResumable("theme-assets", path, file, setProgress);
      // Il vecchio video si toglie solo al salvataggio: se si annulla, resta quello di prima.
      if (unsaved.current) await removeFiles("theme-assets", [unsaved.current]);
      unsaved.current = path;
      setVideo(path);
    } catch (e) {
      setVideoError(e instanceof Error ? e.message : "Caricamento non riuscito.");
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  }

  const save = useMutation({
    mutationFn: async () => {
      await saveTheme(theme?.id ?? null, {
        name: form.name.trim(),
        accent: form.accent.toUpperCase(),
        accent_hot: form.accent_hot.toUpperCase(),
        hero_video_path: video,
        starts_at: starts,
        ends_at: ends,
      });
      unsaved.current = null;
      if (theme?.hero_video_path && theme.hero_video_path !== video) await removeFiles("theme-assets", [theme.hero_video_path]);
    },
    onSuccess: async () => {
      await invalidate();
      onDone();
    },
  });
  const force = useMutation({ mutationFn: (on: boolean) => forceTheme(on ? theme!.id : null), onSuccess: invalidate });
  const remove = useMutation({
    mutationFn: () => deleteTheme(theme!),
    onSuccess: async () => {
      await invalidate();
      onDone();
    },
  });
  const error = save.error ?? force.error ?? remove.error;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!invalid) save.mutate();
      }}
      className="pb-16"
    >
      <h1 className="tube tube-pink text-3xl">{theme ? theme.name : "Nuovo tema"}</h1>
      {theme?.is_default && <p className="mt-3 text-sm text-ink-dim">Il tema di tutti i giorni: vale quando nessun altro è acceso. Non si può cancellare.</p>}

      <section className="mt-10 grid gap-6">
        <Field label="Nome" error={form.name.trim() ? undefined : "Scrivi un nome."}>
          {(fid) => <Input id={fid} value={form.name} onChange={(e) => set("name")(e.target.value)} />}
        </Field>
        <div className="grid gap-6 md:grid-cols-2">
          <ColorField label="Primo colore" hint="Al posto del rosa: titoli, pulsanti, insegna." value={form.accent} onChange={set("accent")} />
          <ColorField label="Secondo colore" hint="Al posto del blu: i titoli che si alternano." value={form.accent_hot} onChange={set("accent_hot")} />
        </div>
        <div className="flex flex-wrap gap-6 rounded-tile border border-line bg-wall p-5" aria-label="Prova dei colori">
          <span className="font-neon text-3xl" style={{ color: form.accent, textShadow: `0 0 10px ${form.accent}, 0 0 28px ${form.accent}` }}>
            ZOO
          </span>
          <span className="font-neon text-3xl" style={{ color: form.accent_hot, textShadow: `0 0 10px ${form.accent_hot}, 0 0 28px ${form.accent_hot}` }}>
            Sexy Disco
          </span>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="tube tube-blue text-2xl">Video della home</h2>
        <p className="mt-2 text-sm text-ink-dim">Dietro l'insegna, al rallentatore, senza audio. MP4, al massimo 50 MB. Senza video resta la fotografia.</p>
        <input ref={input} type="file" accept="video/mp4" className="sr-only" aria-label="Scegli il video" onChange={(e) => e.target.files?.[0] && void pickVideo(e.target.files[0])} />
        {video && progress === null && <video src={assetUrl(video)} muted loop autoPlay playsInline className="mt-4 aspect-video w-full max-w-md rounded-tile bg-panel object-cover" />}
        {progress !== null && (
          <div className="mt-4 h-1.5 max-w-md overflow-hidden rounded-pill bg-line" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Caricamento del video">
            <div className="h-full bg-pink transition-[width]" style={{ width: `${progress}%` }} />
          </div>
        )}
        {videoError && <p className="mt-2 text-sm text-danger">{videoError}</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" variant="outline" size="sm" disabled={progress !== null} onClick={() => input.current?.click()}>
            <Film className="size-4" aria-hidden /> {video ? "Cambia video" : "Carica un video"}
          </Button>
          {video && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setVideo(null)}>
              Togli il video
            </Button>
          )}
        </div>
      </section>

      {!theme?.is_default && (
        <section className="mt-12 grid gap-4">
          <h2 className="tube tube-pink text-2xl">Quando si accende</h2>
          <p className="text-sm text-ink-dim">Facoltativo. Senza date si accende solo con le serate che lo usano, o con «Attiva adesso».</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Dal giorno">{(fid) => <Input id={fid} type="date" value={form.from_date} onChange={(e) => set("from_date")(e.target.value)} />}</Field>
            <Field label="Alle">{(fid) => <Input id={fid} type="time" value={form.from_time} onChange={(e) => set("from_time")(e.target.value)} />}</Field>
            <Field label="Al giorno">{(fid) => <Input id={fid} type="date" value={form.to_date} onChange={(e) => set("to_date")(e.target.value)} />}</Field>
            <Field label="Alle">{(fid) => <Input id={fid} type="time" value={form.to_time} onChange={(e) => set("to_time")(e.target.value)} />}</Field>
          </div>
          {halfSchedule && <p className="text-xs text-danger">Servono tutte e due le date, oppure nessuna.</p>}
          {badRange && <p className="text-xs text-danger">La fine deve venire dopo l'inizio.</p>}
          {(form.from_date || form.to_date) && (
            <Button type="button" variant="ghost" size="sm" className="justify-self-start" onClick={() => setForm((f) => ({ ...f, from_date: "", to_date: "" }))}>
              Togli le date
            </Button>
          )}
        </section>
      )}

      {error && (
        <div className="mt-8">
          <Notice tone="error">{error instanceof Error ? error.message : "Operazione non riuscita."}</Notice>
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-6">
        <Button type="submit" disabled={invalid || save.isPending}>
          {save.isPending ? "Salvo…" : "Salva"}
        </Button>
        <Button asChild variant="ghost">
          <Link to="/admin/temi">Annulla</Link>
        </Button>
        {theme && (
          <Button asChild variant="ghost">
            <a href={`/it?tema=${theme.id}`} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" aria-hidden /> Anteprima sulla home
            </a>
          </Button>
        )}
      </div>
      {theme && <p className="mt-2 text-xs text-ink-dim">L'anteprima mostra il tema salvato solo a te: i visitatori continuano a vedere quello acceso.</p>}

      {theme && !theme.is_default && (
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" size="sm" disabled={force.isPending} onClick={() => force.mutate(!theme.force_active)}>
            <Power className="size-4" aria-hidden /> {theme.force_active ? "Spegni e torna al Default" : "Attiva adesso"}
          </Button>
          <span className="flex-1" />
          {confirmDelete ? (
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-danger">Le serate che lo usano restano senza tema.</span>
              <Button type="button" size="sm" className="bg-danger text-wall" disabled={remove.isPending} onClick={() => remove.mutate()}>
                Sì, cancella
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                No
              </Button>
            </span>
          ) : (
            <Button type="button" variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" aria-hidden /> Elimina
            </Button>
          )}
        </div>
      )}
      {theme?.force_active && <p className="mt-2 text-xs text-pink-core">Acceso a mano: lo vedono tutti finché non lo spegni.</p>}
    </form>
  );
}
