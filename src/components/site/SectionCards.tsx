import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";

export type SectionCard = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  cover: string | null;
  count: number;
};

/** Bloque de "bodas destacadas": tarjetas que llevan a cada galería. */
export default function SectionCards({ heading, cards }: { heading: string; cards: SectionCard[] }) {
  if (cards.length === 0) return null;
  return (
    <section className="px-6 md:px-16 py-24 md:py-32">
      <Reveal>
        <p className="eyebrow text-muted">Galerías</p>
        <h2 className="display-serif mt-3 text-[clamp(2.6rem,6vw,5.5rem)]">{heading}</h2>
      </Reveal>
      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        {cards.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.08}>
            <Link href={`/galeria/${c.slug}`} className="group block">
              <div className="photo-frame mono aspect-[3/4]">
                {c.cover && (
                  <Image src={c.cover} alt={c.title} width={900} height={1200} sizes="(max-width: 768px) 100vw, 33vw" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="display-serif text-[1.9rem] group-hover:opacity-60 transition-opacity">{c.title}</h3>
                <span className="eyebrow text-muted">{c.count} fotos</span>
              </div>
              {c.subtitle && <p className="mt-1 text-sm text-muted">{c.subtitle}</p>}
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
