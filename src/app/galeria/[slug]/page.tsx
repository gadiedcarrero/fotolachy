import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/site/Header";
import GridGallery from "@/components/site/GridGallery";
import SectionCards from "@/components/site/SectionCards";
import Footer from "@/components/site/Footer";
import Reveal from "@/components/site/Reveal";
import { getSectionBySlug, getSections, getSettings, sectionCover } from "@/lib/data";
import type { MenuItem } from "@/components/site/MenuOverlay";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/galeria/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const section = await getSectionBySlug(slug);
  return { title: section ? section.title : "Galería" };
}

export default async function GalleryPage({ params }: PageProps<"/galeria/[slug]">) {
  const { slug } = await params;
  const [settings, sections, section] = await Promise.all([getSettings(), getSections(), getSectionBySlug(slug)]);
  if (!section) notFound();

  const menuSections = sections.filter((s) => s.showInMenu);
  const menuItems: MenuItem[] = [
    ...menuSections.map((s, i) => ({
      label: s.title,
      href: `/galeria/${s.slug}`,
      image: sectionCover(s),
      group: (i < Math.ceil(menuSections.length / 2) ? "primary" : "secondary") as MenuItem["group"],
    })),
    { label: "Nosotros", href: "/#nosotros", image: settings.aboutPhotoUrl, group: "secondary" },
    { label: "Contacto", href: "/#contacto", image: settings.heroPhotoUrl, group: "secondary" },
  ];

  // Historias (sub-galerías) de esta sección, como tarjetas
  const stories = section.children
    .filter((c) => c.photos.length > 0 || c.coverUrl)
    .map((c) => ({ id: c.id, slug: c.slug, title: c.title, subtitle: c.subtitle, cover: sectionCover(c), count: c.photos.length }));

  return (
    <>
      <Header siteName={settings.siteName} items={menuItems} />
      <main className="pt-32 md:pt-40 pb-24">
        <div className="px-6 md:px-16">
          <Reveal>
            {section.parent && (
              <Link href={`/galeria/${section.parent.slug}`} className="eyebrow text-muted hover:opacity-60 transition-opacity">
                ← {section.parent.title}
              </Link>
            )}
            <p className={`eyebrow text-muted ${section.parent ? "mt-6" : ""}`}>{section.subtitle || "Galería"}</p>
            <h1 className="display-serif mt-3 text-[clamp(3rem,8vw,7.5rem)]">{section.title}</h1>
            {section.description && <p className="mt-6 max-w-2xl leading-relaxed text-ink/80 whitespace-pre-line">{section.description}</p>}
          </Reveal>
        </div>

        {stories.length > 0 && <SectionCards heading="Historias" cards={stories} />}

        {section.photos.length > 0 && (
          <div className="px-6 md:px-16 mt-16">
            <GridGallery photos={section.photos} />
          </div>
        )}

        {stories.length === 0 && section.photos.length === 0 && (
          <p className="px-6 md:px-16 mt-16 text-muted">Aún no hay fotos en esta galería.</p>
        )}
      </main>
      <Footer
        siteName={settings.siteName}
        email={settings.contactEmail}
        instagramUrl={settings.instagramUrl}
        footerText={settings.footerText}
        links={menuSections.map((s) => ({ label: s.title, href: `/galeria/${s.slug}` }))}
      />
    </>
  );
}
