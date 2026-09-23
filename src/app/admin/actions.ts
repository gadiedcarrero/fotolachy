"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_MAX_AGE, checkPassword, sessionToken } from "@/lib/auth";
import { deleteStoredImage } from "@/lib/media";
import { slugify } from "@/lib/data";

export type ActionState = { ok: boolean; message: string } | null;

function revalidateSite() {
  revalidatePath("/", "layout");
}

/* ---------- Sesión ---------- */

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  if (!checkPassword(password)) return { ok: false, message: "Contraseña incorrecta." };
  (await cookies()).set(SESSION_COOKIE, await sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/* ---------- Ajustes generales ---------- */

const TEXT_FIELDS = [
  "siteName", "tagline", "heroLine1", "heroLine2", "heroLine3", "heroSubtitle",
  "introQuote", "introText", "bookingTitle", "bookingText", "bookingCta",
  "aboutTitle", "aboutText", "contactEmail", "contactText", "instagramUrl", "pressText", "footerText",
  "whatsappNumber", "whatsappMessage",
] as const;

export async function updateSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const data: Record<string, string | number | boolean> = {};
  for (const f of TEXT_FIELDS) {
    const v = formData.get(f);
    if (typeof v === "string") data[f] = v.trim();
  }
  data.bookingEnabled = formData.get("bookingEnabled") === "on";
  const delay = Number(formData.get("bookingDelayMs"));
  if (Number.isFinite(delay) && delay >= 0) data.bookingDelayMs = Math.round(delay);

  await prisma.siteSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  revalidateSite();
  return { ok: true, message: "Ajustes guardados." };
}

export type ImageField = "heroPhotoUrl" | "aboutPhotoUrl";

function isImageField(f: string): f is ImageField {
  return f === "heroPhotoUrl" || f === "aboutPhotoUrl";
}

/**
 * Asigna una foto fija (hero o "sobre nosotros") a partir de una URL ya subida por /api/upload.
 * La subida se hace desde el navegador para respetar el límite de tamaño por petición.
 */
export async function setSettingsImage(field: string, url: string): Promise<void> {
  if (!isImageField(field) || !url) return;
  const current = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { [field]: url },
    create: { id: 1, [field]: url },
  });
  if (current?.[field] && current[field] !== url) await deleteStoredImage(current[field]);
  revalidateSite();
  revalidatePath("/admin/ajustes");
}

export async function clearSettingsImage(field: string): Promise<void> {
  if (!isImageField(field)) return;
  const current = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  await prisma.siteSettings.update({ where: { id: 1 }, data: { [field]: null } });
  await deleteStoredImage(current?.[field]);
  revalidateSite();
  revalidatePath("/admin/ajustes");
}

/* ---------- Secciones ---------- */

export async function createSection(formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  let slug = slugify(String(formData.get("slug") || title));
  const clash = await prisma.section.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;
  const parentId = String(formData.get("parentId") || "") || null;
  const last = await prisma.section.findFirst({ where: { parentId }, orderBy: { order: "desc" } });
  const section = await prisma.section.create({
    data: {
      title,
      slug,
      parentId,
      subtitle: String(formData.get("subtitle") ?? "").trim() || null,
      order: (last?.order ?? -1) + 1,
      layout: normalizeLayout(formData.get("layout")),
      // Las historias (hijas) no van al menú ni a la home por sí solas: viven dentro de su sección padre
      showInMenu: !parentId,
      showInHome: !parentId,
    },
  });
  revalidateSite();
  redirect(`/admin/secciones/${section.id}`);
}

function normalizeLayout(value: FormDataEntryValue | null): string {
  const v = String(value ?? "");
  return v === "stories" || v === "vertical" || v === "card" ? v : "card";
}

export async function updateSection(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !title) return { ok: false, message: "El título es obligatorio." };
  const slug = slugify(String(formData.get("slug") || title));
  const clash = await prisma.section.findFirst({ where: { slug, NOT: { id } } });
  if (clash) return { ok: false, message: `La URL "${slug}" ya está en uso por otra sección.` };

  await prisma.section.update({
    where: { id },
    data: {
      title,
      slug,
      subtitle: String(formData.get("subtitle") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      layout: normalizeLayout(formData.get("layout")),
      showInMenu: formData.get("showInMenu") === "on",
      showInHome: formData.get("showInHome") === "on",
    },
  });
  revalidateSite();
  revalidatePath(`/admin/secciones/${id}`);
  return { ok: true, message: "Sección guardada." };
}

export async function deleteSection(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const section = await prisma.section.findUnique({
    where: { id },
    include: { photos: true, children: { include: { photos: true } } },
  });
  if (!section) return;
  await prisma.section.delete({ where: { id } }); // las historias hijas se borran en cascada
  const urls = [
    section.coverUrl,
    ...section.photos.map((p) => p.url),
    ...section.children.flatMap((c) => [c.coverUrl, ...c.photos.map((p) => p.url)]),
  ];
  await Promise.all(urls.map((u) => deleteStoredImage(u)));
  revalidateSite();
  redirect(section.parentId ? `/admin/secciones/${section.parentId}` : "/admin/secciones");
}

/** Sube o baja una sección entre sus hermanas (mismo padre). */
export async function moveSection(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const dir = formData.get("dir") === "up" ? -1 : 1;
  const me = await prisma.section.findUnique({ where: { id }, select: { parentId: true } });
  if (!me) return;
  const all = await prisma.section.findMany({ where: { parentId: me.parentId }, orderBy: { order: "asc" } });
  const idx = all.findIndex((s) => s.id === id);
  const swap = idx + dir;
  if (idx < 0 || swap < 0 || swap >= all.length) return;
  [all[idx], all[swap]] = [all[swap], all[idx]];
  await prisma.$transaction(all.map((s, i) => prisma.section.update({ where: { id: s.id }, data: { order: i } })));
  revalidateSite();
  revalidatePath("/admin/secciones");
  if (me.parentId) revalidatePath(`/admin/secciones/${me.parentId}`);
}

/** Define la foto de portada (la que aparece en el menú) a partir de una foto de la sección. */
export async function setSectionCover(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const url = String(formData.get("url"));
  await prisma.section.update({ where: { id }, data: { coverUrl: url || null } });
  revalidateSite();
  revalidatePath(`/admin/secciones/${id}`);
}

/* ---------- Fotos ---------- */

export async function deletePhoto(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return;
  await prisma.photo.delete({ where: { id } });
  // Si era la portada de la sección, limpiarla
  if (photo.sectionId) {
    await prisma.section.updateMany({ where: { id: photo.sectionId, coverUrl: photo.url }, data: { coverUrl: null } });
  }
  await deleteStoredImage(photo.url);
  revalidateSite();
  if (photo.sectionId) revalidatePath(`/admin/secciones/${photo.sectionId}`);
}

export async function updatePhotoAlt(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const alt = String(formData.get("alt") ?? "").trim();
  const photo = await prisma.photo.update({ where: { id }, data: { alt } });
  revalidateSite();
  if (photo.sectionId) revalidatePath(`/admin/secciones/${photo.sectionId}`);
}

/** Reordena las fotos de una sección. orderedIds = ids en el nuevo orden. */
export async function reorderPhotos(sectionId: string, orderedIds: string[]): Promise<void> {
  await prisma.$transaction(
    orderedIds.map((id, i) => prisma.photo.update({ where: { id, sectionId }, data: { order: i } })),
  );
  revalidateSite();
  revalidatePath(`/admin/secciones/${sectionId}`);
}

/* ---------- Mensajes ---------- */

export async function toggleInquiryRead(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const inquiry = await prisma.inquiry.findUnique({ where: { id } });
  if (!inquiry) return;
  await prisma.inquiry.update({ where: { id }, data: { read: !inquiry.read } });
  revalidatePath("/admin/mensajes");
}

export async function deleteInquiry(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  await prisma.inquiry.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/mensajes");
}
