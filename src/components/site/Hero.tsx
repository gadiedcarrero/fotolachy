"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

type Props = {
  photoUrl: string | null;
  line1: string;
  line2: string;
  line3: string;
  subtitle: string;
};

export default function Hero({ photoUrl, line1, line2, line3, subtitle }: Props) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-line]",
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power4.out", delay: 0.2 },
      );
      gsap.fromTo("[data-hero-photo]", { scale: 1.08, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.8, ease: "power3.out" });
      gsap.fromTo("[data-hero-sub]", { opacity: 0 }, { opacity: 1, duration: 1, delay: 1 });
      // Parallax suave de la foto al hacer scroll
      gsap.to("[data-hero-photo]", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative min-h-[100svh] overflow-hidden">
      {/* Foto principal: ocupa el lado izquierdo en desktop, todo el fondo en móvil */}
      <div className="absolute inset-0 md:right-[38%] mono" data-hero-photo>
        {photoUrl ? (
          <Image src={photoUrl} alt="" fill priority sizes="100vw" className="object-cover object-top" />
        ) : (
          <div className="h-full w-full bg-[#e6e4dd]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-bg hidden md:block" />
        <div className="absolute inset-0 bg-bg/40 md:hidden" />
      </div>

      {/* Título */}
      <div className="relative z-10 flex min-h-[100svh] flex-col justify-end md:justify-center items-start md:items-end px-6 md:px-16 pb-28 md:pb-0">
        <h1 className="text-left md:text-right">
          <span data-hero-line className="block display-serif text-[clamp(3.2rem,9vw,9.5rem)]">
            {line1}
          </span>
          <span data-hero-line className="block display-sans text-[clamp(3rem,8.4vw,8.8rem)]">
            {line2}
          </span>
          <span data-hero-line className="block display-serif text-[clamp(3.2rem,9vw,9.5rem)]">
            {line3}
          </span>
        </h1>
      </div>

      <p data-hero-sub className="absolute bottom-8 left-6 md:left-auto md:right-16 eyebrow text-ink/80">
        {subtitle}
      </p>
    </section>
  );
}
