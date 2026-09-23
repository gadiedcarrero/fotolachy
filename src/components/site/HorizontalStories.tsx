"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export type Story = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  cover: string | null;
  count: number;
};

type Props = {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  href: string;
  stories: Story[];
};

/**
 * Sección "pinned": mientras el usuario hace scroll vertical, la fila de historias
 * se desplaza horizontalmente. Cada historia es una tarjeta que lleva a su propia galería.
 */
export default function HorizontalStories({ title, subtitle, description, href, stories }: Props) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = root.current;
    const inner = track.current;
    if (!section || !inner || stories.length === 0) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const getDistance = () => Math.max(0, inner.scrollWidth - window.innerWidth);
      const tween = gsap.to(inner, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      inner.querySelectorAll("img").forEach((img) => img.addEventListener("load", () => ScrollTrigger.refresh(), { once: true }));
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
    return () => mm.revert();
  }, [stories.length]);

  if (stories.length === 0) return null;

  return (
    <section ref={root} className="relative overflow-hidden bg-bg">
      <div className="flex h-auto md:h-[100svh] flex-col md:flex-row md:items-center">
        <div ref={track} className="flex flex-col md:flex-row md:items-center gap-8 md:gap-10 will-change-transform px-6 md:pl-16 md:pr-16 py-16 md:py-0">
          {/* Encabezado: viaja con el track */}
          <div className="md:w-[30vw] md:min-w-[30vw] md:pr-12">
            <p className="eyebrow text-muted">{subtitle || "Historias"}</p>
            <h2 className="display-serif mt-3 text-[clamp(2.6rem,6vw,5.5rem)]">{title}</h2>
            {description && <p className="mt-5 max-w-sm text-ink/75 leading-relaxed">{description}</p>}
            <Link href={href} className="btn-outline mt-8">
              Ver todas
            </Link>
          </div>

          {stories.map((s, i) => (
            <Link
              key={s.id}
              href={`/galeria/${s.slug}`}
              className={`group shrink-0 w-full md:w-[28vw] ${i % 2 === 1 ? "md:mt-28" : "md:-mt-10"}`}
            >
              <figure className="photo-frame mono aspect-[3/4]">
                {s.cover && (
                  <Image
                    src={s.cover}
                    alt={s.title}
                    width={900}
                    height={1200}
                    sizes="(max-width: 768px) 100vw, 28vw"
                    className="h-full w-full object-cover"
                  />
                )}
              </figure>
              <figcaption className="mt-4 flex items-baseline justify-between gap-4">
                <span>
                  <span className="display-serif block text-[1.9rem] leading-none group-hover:opacity-60 transition-opacity">{s.title}</span>
                  {s.subtitle && <span className="eyebrow mt-2 block text-muted normal-case tracking-[0.12em]">{s.subtitle}</span>}
                </span>
                <span className="eyebrow text-muted whitespace-nowrap">{s.count} fotos</span>
              </figcaption>
            </Link>
          ))}
          <div className="hidden md:block md:w-[6vw] shrink-0" />
        </div>
      </div>
    </section>
  );
}
