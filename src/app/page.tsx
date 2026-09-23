import Link from "next/link";
import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import BookingPopup from "@/components/site/BookingPopup";
import HorizontalStories from "@/components/site/HorizontalStories";
import GridGallery from "@/components/site/GridGallery";
import SectionCards from "@/components/site/SectionCards";
import About from "@/components/site/About";
import ContactForm from "@/components/site/ContactForm";
import Footer from "@/components/site/Footer";
import WhatsAppButton, { whatsappLink } from "@/components/site/WhatsAppButton";
import Reveal from "@/components/site/Reveal";
import { getSections, getSettings, sectionCover } from "@/lib/data";
import type { MenuItem } from "@/components/site/MenuOverlay";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, sections] = await Promise.all([getSettings(), getSections()]);

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

  const homeSections = sections.filter((s) => s.showInHome);
  const cardSections = homeSections
    .filter((s) => s.layout === "card" && (s.photos.length > 0 || s.children.length > 0))
    .map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      subtitle: s.subtitle,
      cover: sectionCover(s),
      count: s.photos.length + s.children.reduce((n, c) => n + c.photos.length, 0),
    }));

  return (
    <>
      <Header siteName={settings.siteName} items={menuItems} />
      <main>
        <Hero
          photoUrl={settings.heroPhotoUrl}
          line1={settings.heroLine1}
          line2={settings.heroLine2}
          line3={settings.heroLine3}
          subtitle={settings.heroSubtitle}
        />

        <section className="px-6 md:px-16 py-24 md:py-36 max-w-5xl">
          <Reveal>
            <p className="eyebrow text-muted">{settings.tagline}</p>
            <p className="display-serif mt-6 text-[clamp(1.9rem,3.6vw,3.4rem)] leading-[1.1]">“{settings.introQuote}”</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-2xl leading-relaxed text-ink/80">{settings.introText}</p>
          </Reveal>
        </section>

        {homeSections.map((s) => {
          if (s.layout === "stories") {
            const stories = s.children
              .filter((c) => c.photos.length > 0 || c.coverUrl)
              .map((c) => ({
                id: c.id,
                slug: c.slug,
                title: c.title,
                subtitle: c.subtitle,
                cover: sectionCover(c),
                count: c.photos.length,
              }));
            return (
              <HorizontalStories
                key={s.id}
                title={s.title}
                subtitle={s.subtitle}
                description={s.description}
                href={`/galeria/${s.slug}`}
                stories={stories}
              />
            );
          }
          if (s.layout === "vertical" && s.photos.length > 0) {
            return (
              <section key={s.id} className="px-6 md:px-16 py-24 md:py-32 border-t border-line">
                <Reveal>
                  <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                      <p className="eyebrow text-muted">{s.subtitle || "Galería"}</p>
                      <h2 className="display-serif mt-3 text-[clamp(2.6rem,6vw,5.5rem)]">{s.title}</h2>
                    </div>
                    <Link href={`/galeria/${s.slug}`} className="btn-outline">
                      Ver galería completa
                    </Link>
                  </div>
                </Reveal>
                <div className="mt-14">
                  <GridGallery photos={s.photos.slice(0, 9)} />
                </div>
              </section>
            );
          }
          return null;
        })}

        <SectionCards heading="Más galerías" cards={cardSections} />

        <About
          title={settings.aboutTitle}
          text={settings.aboutText}
          photoUrl={settings.aboutPhotoUrl}
          quote={settings.introQuote}
          pressText={settings.pressText}
        />

        <ContactForm
          title="Consulta tu fecha"
          text={settings.contactText}
          email={settings.contactEmail}
          whatsappHref={whatsappLink(settings.whatsappNumber, settings.whatsappMessage)}
        />
      </main>
      <WhatsAppButton number={settings.whatsappNumber} message={settings.whatsappMessage} />
      <Footer
        siteName={settings.siteName}
        email={settings.contactEmail}
        instagramUrl={settings.instagramUrl}
        footerText={settings.footerText}
        links={menuSections.map((s) => ({ label: s.title, href: `/galeria/${s.slug}` }))}
      />
      <BookingPopup
        enabled={settings.bookingEnabled}
        title={settings.bookingTitle}
        text={settings.bookingText}
        cta={settings.bookingCta}
        delayMs={settings.bookingDelayMs}
      />
    </>
  );
}
