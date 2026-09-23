import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, isValidSession } from "@/lib/auth";
import { storeImage } from "@/lib/media";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/upload  (multipart/form-data)
 *  - files[]:   una o varias imágenes
 *  - sectionId: (opcional) si se envía, las fotos se agregan a esa sección
 * Devuelve las imágenes almacenadas con su url/ancho/alto.
 */
export async function POST(req: Request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await isValidSession(token))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const sectionId = (form.get("sectionId") as string | null) || null;

  if (files.length === 0) {
    return NextResponse.json({ error: "No se recibieron archivos" }, { status: 400 });
  }

  let nextOrder = 0;
  if (sectionId) {
    const last = await prisma.photo.findFirst({
      where: { sectionId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    nextOrder = (last?.order ?? -1) + 1;
  }

  const results = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await storeImage(buffer);
    if (sectionId) {
      const photo = await prisma.photo.create({
        data: {
          url: stored.url,
          width: stored.width,
          height: stored.height,
          order: nextOrder++,
          sectionId,
          alt: file.name.replace(/\.[^.]+$/, ""),
        },
      });
      results.push(photo);
    } else {
      results.push(stored);
    }
  }

  return NextResponse.json({ ok: true, images: results });
}
