/**
 * Lavorazione dei file nel browser, prima dell'upload (brief §11).
 * Foto: si ridisegnano su canvas, quindi escono senza EXIF né GPS; l'originale
 * non lascia mai il telefono. Video: si leggono durata e misure dai metadati
 * e si estrae la copertina al secondo 1.
 */

export type ProcessedImage = { large: Blob; thumb: Blob; width: number; height: number };
export type ProbedVideo = { poster: Blob; width: number; height: number; duration: number };

const LARGE = 1600;
const THUMB = 480;
const QUALITY = 0.82;

function canvasBlob(canvas: HTMLCanvasElement, type = "image/webp", quality = QUALITY): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Il browser non riesce a creare l'immagine."))), type, quality),
  );
}

function draw(source: CanvasImageSource, w: number, h: number, maxSide: number) {
  const scale = Math.min(1, maxSide / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Il browser non riesce a lavorare l'immagine.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function processImage(file: File): Promise<ProcessedImage> {
  let bitmap: ImageBitmap;
  try {
    // L'orientamento EXIF si applica qui; poi i metadati spariscono con il ridisegno.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Formato non leggibile. Usa JPG, PNG o WebP (dall'iPhone le foto arrivano già in JPG).");
  }
  try {
    const large = draw(bitmap, bitmap.width, bitmap.height, LARGE);
    const thumb = draw(bitmap, bitmap.width, bitmap.height, THUMB);
    return { large: await canvasBlob(large), thumb: await canvasBlob(thumb), width: large.width, height: large.height };
  } finally {
    bitmap.close();
  }
}

export const VIDEO_TYPES = ["video/mp4", "video/quicktime"];

export async function probeVideo(file: File, limits: { maxMb: number; maxSeconds: number }): Promise<ProbedVideo> {
  if (!VIDEO_TYPES.includes(file.type)) throw new Error("Solo video MP4 o MOV.");
  if (file.size > limits.maxMb * 1024 * 1024) {
    throw new Error(`Il video pesa ${Math.round(file.size / 1024 / 1024)} MB: il massimo è ${limits.maxMb} MB. Accorcialo o esportalo più leggero.`);
  }
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Questo video non si apre nel browser. Prova a esportarlo in MP4 (H.264)."));
    });
    let duration = video.duration;
    if (!Number.isFinite(duration)) {
      // Alcuni MP4 (registrati a pezzi) non dichiarano la durata: si salta in fondo e la si legge.
      video.currentTime = 1e7;
      await new Promise<void>((resolve) => {
        video.ondurationchange = () => Number.isFinite(video.duration) && resolve();
        video.onseeked = () => resolve();
      });
      duration = video.duration;
    }
    if (!Number.isFinite(duration) || duration > limits.maxSeconds) {
      throw new Error(`Il video dura ${Math.round(duration)} secondi: il massimo è ${limits.maxSeconds}.`);
    }
    video.currentTime = Math.min(1, duration / 2);
    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () => reject(new Error("Non riesco a estrarre la copertina dal video."));
    });
    const frame = draw(video, video.videoWidth, video.videoHeight, LARGE);
    return { poster: await canvasBlob(frame), width: video.videoWidth, height: video.videoHeight, duration };
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}
