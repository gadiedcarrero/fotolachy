import path from "node:path";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

/** Carpeta física donde se guardan las fotos subidas (fuera de /public para que funcione en producción). */
export function uploadDir(): string {
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.UPLOAD_DIR || "./data/uploads");
}

export const MEDIA_PREFIX = "/media/";
const MAX_WIDTH = 2400;

export type StoredImage = { url: string; width: number; height: number };

/**
 * Procesa una imagen subida: la redimensiona (máx 2400px de ancho),
 * la convierte a WebP y la guarda en el directorio de uploads.
 */
export async function storeImage(buffer: Buffer): Promise<StoredImage> {
  await mkdir(uploadDir(), { recursive: true });
  const name = `${randomUUID()}.webp`;
  const out = await sharp(buffer)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer({ resolveWithObject: true });
  await writeFile(path.join(uploadDir(), name), out.data);
  return { url: MEDIA_PREFIX + name, width: out.info.width, height: out.info.height };
}

/** Borra el archivo físico si la URL apunta a un upload local. */
export async function deleteStoredImage(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith(MEDIA_PREFIX)) return;
  const name = path.basename(url);
  try {
    await unlink(path.join(uploadDir(), name));
  } catch {
    /* ya no existe */
  }
}

export function isLocalMedia(url: string): boolean {
  return url.startsWith(MEDIA_PREFIX);
}
