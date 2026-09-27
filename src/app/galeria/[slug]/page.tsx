import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/site/Header";
import GridGallery from "@/components/site/GridGallery";
import SectionCards from "@/components/site/SectionCards";
import Footer from "@/components/site/Footer";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import Reveal from "@/components/site/Reveal";
import VideoGallery from "@/components/site/VideoGallery";
import { getSectionBySlug, getSections, getSettings, sectionCover, type SectionDetail, type SectionTree } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { buildMenu, socialLinks, visibleInMenu } from "@/lib/menu";
import { localizeContent, translateMany } from "@/lib/translate";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/galeria/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getLang();
  const section = await getSectionBySlug(slug);
  if (!section) return { title: getDict(lang).gallery };
  const map = await translateMany([section.title], lang);
  return { title: map.get(section.title) ?? section.title };
}

export default async function GalleryPage({ params }: PageProps<"/galeria/[slug]">) {
  const { slug } = await params;
  const lang = await getLang();
  const t = getDict(lang);
  const [rawSettings, rawSections, rawSection] = await Promise.all([getSettings(), getSections(), getSectionBySlug(slug)]);
  if (!rawSection) notFound();
  // Se traducen juntas para hacer una sola consulta de traducciones
  const localized = await localizeContent(lang, rawSettings, [rawSection, ...rawSections]);
  const { settings } = localized;
  const [section, ...sections] = localized.sections as [SectionDetail, ...SectionTree[]];

  const menuSections = visibleInMenu(sections);
  const menuItems = buildMenu(sections, settings, t);

  // Historias (sub-galerías) de esta sección, como tarjetas
  const stories = section.children
    .filter((c) => c.photos.length > 0 || c.coverUrl)
    .map((c) => ({ id: c.id, slug: c.slug, title: c.title, subtitle: c.subtitle, cover: sectionCover(c), count: c.photos.length }));

  return (
    <>
      <Header siteName={settings.siteName} items={menuItems} lang={lang} t={t} />
      <main className="pt-32 md:pt-40 pb-24">
        <div className="px-6 md:px-16">
          <Reveal>
            {section.parent && (
              <Link href={`/galeria/${section.parent.slug}`} className="eyebrow text-muted hover:opacity-60 transition-opacity">
                ← {section.parent.title}
              </Link>
            )}
            <p className={`eyebrow text-muted ${section.parent ? "mt-6" : ""}`}>{section.subtitle || t.gallery}</p>
            <h1 className="display-serif mt-3 text-[clamp(3rem,8vw,7.5rem)]">{section.title}</h1>
            {section.description && <p className="mt-6 max-w-2xl leading-relaxed text-ink/80 whitespace-pre-line">{section.description}</p>}
          </Reveal>
        </div>

        {stories.length > 0 && <SectionCards heading={t.stories} cards={stories} t={t} />}

        {section.photos.length > 0 && (
          <div className="px-6 md:px-16 mt-16">
            <GridGallery photos={section.photos} emptyText={t.noPhotos} />
          </div>
        )}

        {section.videos.length > 0 && (
          <div className="px-6 md:px-16 mt-20">
            <p className="eyebrow text-muted mb-8">{t.videos}</p>
            <VideoGallery videos={section.videos} playLabel={t.playVideo} />
          </div>
        )}

        {stories.length === 0 && section.photos.length === 0 && section.videos.length === 0 && (
          <p className="px-6 md:px-16 mt-16 text-muted">{t.noPhotos}</p>
        )}
      </main>
      <WhatsAppButton number={settings.whatsappNumber} message={settings.whatsappMessage} label={t.whatsapp} />
      <Footer
        siteName={settings.siteName}
        email={settings.contactEmail}
        socials={socialLinks(settings)}
        footerText={settings.footerText}
        links={menuSections.map((s) => ({ label: s.title, href: `/galeria/${s.slug}` }))}
      />
    </>
  );
}
