import { prisma } from "@/lib/prisma";
import type { Photo, Section, SiteSettings } from "@prisma/client";

export type SectionWithPhotos = Section & { photos: Photo[] };
export type SectionTree = SectionWithPhotos & { children: SectionWithPhotos[] };
export type SectionDetail = SectionTree & { parent: Section | null };

export type Layout = "stories" | "vertical" | "card";
export const LAYOUTS: { value: Layout; label: string }[] = [
  { value: "stories", label: "Historias con scroll horizontal (cada historia tiene su galería)" },
  { value: "vertical", label: "Fotos en vertical dentro de la home" },
  { value: "card", label: "Solo tarjeta que lleva a su página" },
];

/** Devuelve la configuración del sitio, creándola con valores por defecto si no existe. */
export async function getSettings(): Promise<SiteSettings> {
  const existing = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.siteSettings.create({ data: { id: 1 } });
}

const photosInclude = { photos: { orderBy: { order: "asc" as const } } };

/** Secciones de primer nivel con sus fotos y sus historias (hijas). */
export async function getSections(): Promise<SectionTree[]> {
  return prisma.section.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    include: {
      ...photosInclude,
      children: { orderBy: { order: "asc" }, include: photosInclude },
    },
  });
}

export async function getSectionBySlug(slug: string): Promise<SectionDetail | null> {
  return prisma.section.findUnique({
    where: { slug },
    include: {
      ...photosInclude,
      parent: true,
      children: { orderBy: { order: "asc" }, include: photosInclude },
    },
  });
}

export async function getSectionById(id: string): Promise<SectionDetail | null> {
  return prisma.section.findUnique({
    where: { id },
    include: {
      ...photosInclude,
      parent: true,
      children: { orderBy: { order: "asc" }, include: photosInclude },
    },
  });
}

/** Foto de portada de una sección: la definida en coverUrl, la primera foto, o la portada de su primera historia. */
export function sectionCover(section: SectionWithPhotos & { children?: SectionWithPhotos[] }): string | null {
  if (section.coverUrl) return section.coverUrl;
  if (section.photos[0]) return section.photos[0].url;
  const child = section.children?.find((c) => c.coverUrl || c.photos[0]);
  return child ? child.coverUrl || child.photos[0]?.url || null : null;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "seccion";
}
