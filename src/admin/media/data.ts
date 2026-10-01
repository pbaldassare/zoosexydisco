import { adminClient } from "@/lib/supabase";
import { processImage, probeVideo, VIDEO_TYPES } from "./process";
import { newName, removeFiles, uploadResumable, uploadSmall } from "./upload";

export type Placement = "gallery" | "home" | "club" | "members";

export const PLACEMENTS: { id: Placement; label: string; hint: string }[] = [
  { id: "gallery", label: "Gallery", hint: "Foto nella gallery foto, video nella gallery video" },
  { id: "home", label: "Home", hint: "La striscia di foto in home" },
  { id: "club", label: "Il locale", hint: "Le foto dei tre ambienti: sala, tavoli, privé, in quest'ordine" },
  { id: "members", label: "Area riservata", hint: "Solo per gli iscritti: non compare da nessun'altra parte" },
];

export type MediaRow = {
  id: string;
  kind: "image" | "video";
  bucket: "public-media" | "private-video" | "members-media";
  path: string;
  thumb_path: string | null;
  poster_path: string | null;
  width: number | null;
  height: number | null;
  duration_s: number | null;
  size_bytes: number | null;
  event_id: string | null;
  placement: Placement[];
  alt_it: string | null;
  alt_en: string | null;
  people_tag: string | null;
  release_signed: boolean;
  release_date: string | null;
  visible: boolean;
  sort: number;
  is_sample: boolean;
  created_at: string;
};

export type EventOption = { id: string; title: string; starts_at: string };

const db = () => adminClient!;

export async function loadMedia(): Promise<MediaRow[]> {
  const { data, error } = await db().from("media").select("*").order("sort").order("created_at");
  if (error) throw error;
  return data as MediaRow[];
}

export async function loadEvents(): Promise<EventOption[]> {
  const { data, error } = await db().from("events").select("id, title_it, starts_at").order("starts_at", { ascending: false });
  if (error) throw error;
  return data.map((e) => ({ id: e.id as string, title: e.title_it as string, starts_at: e.starts_at as string }));
}

export async function loadLimits() {
  const { data } = await db().from("site_settings").select("upload_video_max_mb, upload_video_max_seconds").eq("singleton", true).single();
  return { maxMb: Number(data?.upload_video_max_mb ?? 50), maxSeconds: Number(data?.upload_video_max_seconds ?? 90) };
}

/** Miniature: pubbliche per public-media, firmate per un'ora per i file riservati. */
export async function previewUrls(rows: MediaRow[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const signed: { id: string; path: string }[] = [];
  for (const r of rows) {
    if (r.poster_path) out[r.id] = db().storage.from("public-media").getPublicUrl(r.poster_path).data.publicUrl;
    else if (r.bucket === "public-media") out[r.id] = db().storage.from("public-media").getPublicUrl(r.thumb_path ?? r.path).data.publicUrl;
    else if (r.kind === "image") signed.push({ id: r.id, path: r.thumb_path ?? r.path });
  }
  if (signed.length) {
    const { data } = await db().storage.from("members-media").createSignedUrls(signed.map((s) => s.path), 3600);
    data?.forEach((d, i) => d.signedUrl && (out[signed[i]!.id] = d.signedUrl));
  }
  return out;
}

/** URL firmato di 5 minuti per guardare un video dal pannello. */
export async function videoUrl(r: MediaRow) {
  const { data, error } = await db().storage.from(r.bucket).createSignedUrl(r.path, 300);
  if (error) throw error;
  return data.signedUrl;
}

export type UploadChoice = { placement: Placement[]; eventId: string | null };
export type UploadStep = { name: string; status: "waiting" | "working" | "done" | "error"; progress: number; message?: string };

/**
 * Carica un lotto: per ogni file lavora, carica e crea la riga in media.
 * Un file che non va non ferma gli altri.
 */
export async function uploadBatch(files: File[], choice: UploadChoice, onStep: (i: number, s: Partial<UploadStep>) => void) {
  const limits = await loadLimits();
  // Il lotto nuovo va in testa, nell'ordine in cui è stato scelto: le foto dell'ultima serata si vedono per prime.
  const { data: first } = await db().from("media").select("sort").order("sort").limit(1);
  let sort = Number(first?.[0]?.sort ?? 0) - files.length;
  const members = choice.placement.includes("members");

  for (const [i, file] of files.entries()) {
    onStep(i, { status: "working", progress: 0 });
    const uploaded: { bucket: string; path: string }[] = [];
    try {
      const isVideo = VIDEO_TYPES.includes(file.type) || /\.(mp4|mov)$/i.test(file.name);
      let row: Partial<MediaRow>;
      if (isVideo) {
        const v = await probeVideo(file, limits);
        const bucket = members ? "members-media" : "private-video";
        const ext = file.type === "video/quicktime" || /\.mov$/i.test(file.name) ? "mov" : "mp4";
        const path = newName(ext);
        const poster = newName("webp");
        await uploadSmall("public-media", poster, v.poster);
        uploaded.push({ bucket: "public-media", path: poster });
        await uploadResumable(bucket, path, file, (p) => onStep(i, { progress: p }));
        uploaded.push({ bucket, path });
        row = { kind: "video", bucket, path, poster_path: poster, width: v.width, height: v.height, duration_s: Math.round(v.duration * 100) / 100, size_bytes: file.size };
      } else {
        const img = await processImage(file);
        const bucket = members ? "members-media" : "public-media";
        const id = crypto.randomUUID();
        const path = `${id}.webp`;
        const thumb = `${id}-480.webp`;
        onStep(i, { progress: 40 });
        await uploadSmall(bucket, path, img.large);
        uploaded.push({ bucket, path });
        onStep(i, { progress: 80 });
        await uploadSmall(bucket, thumb, img.thumb);
        uploaded.push({ bucket, path: thumb });
        row = { kind: "image", bucket, path, thumb_path: thumb, width: img.width, height: img.height, size_bytes: img.large.size };
      }
      const { error } = await db()
        .from("media")
        .insert({ ...row, placement: choice.placement, event_id: choice.eventId, visible: true, sort: sort++, is_sample: false });
      if (error) throw new Error(`Salvataggio non riuscito: ${error.message}`);
      onStep(i, { status: "done", progress: 100 });
    } catch (err) {
      // Niente file orfani: quello che era già salito si toglie.
      for (const u of uploaded) await removeFiles(u.bucket, [u.path]).catch(() => {});
      onStep(i, { status: "error", message: err instanceof Error ? err.message : "Errore sconosciuto." });
    }
  }
}

export async function updateMedia(id: string, patch: Partial<MediaRow>) {
  const { error } = await db().from("media").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

/** Cancella righe e file. I file di esempio condivisi con il sito locale non esistono qui: si tolgono solo quelli nei bucket. */
export async function deleteMedia(rows: MediaRow[]) {
  for (const r of rows) {
    await removeFiles(r.bucket, [r.path, r.thumb_path]);
    await removeFiles("public-media", [r.poster_path]);
  }
  const { error } = await db().from("media").delete().in("id", rows.map((r) => r.id));
  if (error) throw error;
}

/** Scambia la posizione di due elementi. */
export async function swapSort(a: MediaRow, b: MediaRow) {
  // Se hanno lo stesso numero, lo scambio non cambierebbe niente: si separano.
  const [sa, sb] = a.sort === b.sort ? [b.sort + 1, a.sort] : [b.sort, a.sort];
  await updateMedia(a.id, { sort: sa });
  await updateMedia(b.id, { sort: sb });
}

/** Spostare un contenuto tra pubblico e riservato vuol dire spostare i file di bucket. */
export async function moveBucket(r: MediaRow, toMembers: boolean): Promise<Partial<MediaRow>> {
  const target = toMembers ? "members-media" : r.kind === "video" ? "private-video" : "public-media";
  if (target === r.bucket) return {};
  // Lo spostamento avviene sul server: il video non ripassa dal telefono.
  for (const p of [r.path, r.thumb_path]) {
    if (!p) continue;
    const { error } = await db().storage.from(r.bucket).move(p, p, { destinationBucket: target });
    if (error) throw error;
  }
  return { bucket: target as MediaRow["bucket"] };
}
