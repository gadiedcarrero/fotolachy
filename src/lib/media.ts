import path from "node:path";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { put, del } from "@vercel/blob";

/**
 * Almacenamiento de fotos.
 *  - En Vercel (BLOB_READ_WRITE_TOKEN definido): se guardan en Vercel Blob y la URL es pública.
 *  - En local: se guardan en UPLOAD_DIR y se sirven por /media/<archivo>.
 */

export function uploadDir(): string {
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.UPLOAD_DIR || "./data/uploads");
}

export const MEDIA_PREFIX = "/media/";
const MAX_WIDTH = 2400;

export type StoredImage = { url: string; width: number; height: number };

function blobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Procesa una imagen subida: la redimensiona (máx 2400px de ancho),
 * la convierte a WebP y la guarda (Blob o disco local).
 */
export async function storeImage(buffer: Buffer): Promise<StoredImage> {
  const name = `${randomUUID()}.webp`;
  const out = await sharp(buffer)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer({ resolveWithObject: true });

  if (blobEnabled()) {
    const blob = await put(`fotos/${name}`, out.data, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    });
    return { url: blob.url, width: out.info.width, height: out.info.height };
  }

  await mkdir(uploadDir(), { recursive: true });
  await writeFile(path.join(uploadDir(), name), out.data);
  return { url: MEDIA_PREFIX + name, width: out.info.width, height: out.info.height };
}

/** Borra el archivo físico (Blob o disco) si la URL es de una foto subida. Ignora placeholders externos. */
export async function deleteStoredImage(url: string | null | undefined): Promise<void> {
  if (!url) return;
  try {
    if (url.startsWith(MEDIA_PREFIX)) {
      await unlink(path.join(uploadDir(), path.basename(url)));
    } else if (url.includes(".blob.vercel-storage.com/") && blobEnabled()) {
      await del(url);
    }
  } catch {
    /* ya no existe o no se pudo borrar; no es crítico */
  }
}

export function isLocalMedia(url: string): boolean {
  return url.startsWith(MEDIA_PREFIX);
}
