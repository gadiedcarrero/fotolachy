import type { SiteSettings } from "@prisma/client";
import type { MenuItem } from "@/components/site/MenuOverlay";
import { sectionCover, type SectionTree } from "./data";
import type { Dict } from "./i18n";

/** Ítems del menú: las secciones visibles repartidas arriba/abajo de la foto, más Nosotros y Contacto. */
export function buildMenu(sections: SectionTree[], settings: SiteSettings, t: Dict): MenuItem[] {
  const menuSections = sections.filter((s) => s.showInMenu);
  return [
    ...menuSections.map((s, i) => ({
      label: s.title,
      href: `/galeria/${s.slug}`,
      image: sectionCover(s),
      group: (i < Math.ceil(menuSections.length / 2) ? "primary" : "secondary") as MenuItem["group"],
    })),
    { label: t.about, href: "/#nosotros", image: settings.aboutPhotoUrl, group: "secondary" },
    { label: t.contact, href: "/#contacto", image: settings.heroPhotoUrl, group: "secondary" },
  ];
}

export type SocialLink = { label: string; href: string };

/** Redes sociales configuradas en el panel (las vacías no se muestran). */
export function socialLinks(settings: SiteSettings): SocialLink[] {
  return [
    { label: "Instagram", href: settings.instagramUrl },
    { label: "Facebook", href: settings.facebookUrl },
    { label: "TikTok", href: settings.tiktokUrl },
  ].filter((l) => /^https?:\/\/[^/]+\/./.test(l.href.trim()));
}
