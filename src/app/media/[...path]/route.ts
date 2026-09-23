import { NextResponse } from "next/server";
import path from "node:path";
import { stat, readFile } from "node:fs/promises";
import { uploadDir } from "@/lib/media";

/**
 * Sirve las imágenes subidas desde el directorio de uploads.
 * Se usa un route handler (y no /public) para que las fotos subidas
 * después del build sigan funcionando en producción.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  const name = path.basename(parts.join("/"));
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) return new NextResponse("Not found", { status: 404 });

  const file = path.join(uploadDir(), name);
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error("not file");
    const data = await readFile(file);
    const ext = path.extname(name).toLowerCase();
    const type =
      ext === ".webp" ? "image/webp" :
      ext === ".png" ? "image/png" :
      ext === ".gif" ? "image/gif" :
      ext === ".avif" ? "image/avif" :
      "image/jpeg";
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
