import { Upload } from "tus-js-client";
import { adminClient } from "@/lib/supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

/** Nomi sempre <uuid>.<ext>, mai il nome originale del file. */
export const newName = (ext: string) => `${crypto.randomUUID()}.${ext}`;

/** Foto e copertine: pochi KB, basta l'upload semplice. */
export async function uploadSmall(bucket: string, path: string, blob: Blob) {
  const { error } = await adminClient!.storage.from(bucket).upload(path, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`Caricamento non riuscito: ${error.message}`);
}

/**
 * Video: upload a pezzi (TUS) con avanzamento. Se la rete cade riprova da
 * dove era arrivato invece di ricominciare da capo.
 */
export async function uploadResumable(bucket: string, path: string, file: File, onProgress: (pct: number) => void) {
  const { data } = await adminClient!.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sessione scaduta: esci e rientra.");
  await new Promise<void>((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
      retryDelays: [0, 2000, 5000, 10000, 20000],
      headers: { authorization: `Bearer ${token}`, "x-upsert": "false" },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: { bucketName: bucket, objectName: path, contentType: file.type, cacheControl: "31536000" },
      // Supabase vuole pezzi da 6 MB esatti.
      chunkSize: 6 * 1024 * 1024,
      onError: (err) => reject(new Error(`Caricamento del video non riuscito: ${err.message}`)),
      onProgress: (sent, total) => onProgress(Math.round((sent / total) * 100)),
      onSuccess: () => resolve(),
    });
    void upload.findPreviousUploads().then((previous) => {
      if (previous[0]) upload.resumeFromPreviousUpload(previous[0]);
      upload.start();
    });
  });
}

export async function removeFiles(bucket: string, paths: (string | null | undefined)[]) {
  const list = paths.filter((p): p is string => !!p);
  if (list.length) await adminClient!.storage.from(bucket).remove(list);
}
