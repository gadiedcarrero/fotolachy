"use client";

/**
 * Reduce una imagen en el navegador antes de subirla:
 * máximo 2400px en su lado mayor y JPEG al 90%.
 * Así las fotos de cámara (10-30 MB) pasan a ~1-2 MB y respetan
 * el límite de 4.5 MB por petición de Vercel.
 */
export async function shrinkImage(file: File, maxSide = 2400): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 3_500_000) {
      bitmap.close();
      return file;
    }
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export type UploadedImage = { id?: string; url: string; width: number; height: number };

/** Sube una foto (ya reducida) a /api/upload. Si se pasa sectionId, queda registrada en esa sección. */
export async function uploadImage(file: File, sectionId?: string): Promise<UploadedImage> {
  const fd = new FormData();
  if (sectionId) fd.append("sectionId", sectionId);
  fd.append("files", await shrinkImage(file));
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Error al subir (${res.status})`);
  const img = json.images?.[0];
  if (!img) throw new Error("El servidor no devolvió la imagen");
  return img;
}
