"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

export type MenuItem = {
  label: string;
  href: string;
  image?: string | null;
  /** "primary" va arriba de la foto, "secondary" debajo */
  group: "primary" | "secondary";
};

type Props = {
  open: boolean;
  items: MenuItem[];
  onClose: () => void;
};

/**
 * Menú a pantalla completa que baja desde arriba.
 * Al pasar el mouse por un ítem cambia la foto central (como en la referencia).
 */
export default function MenuOverlay({ open, items, onClose }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const withImage = items.filter((i) => i.image);
  const [active, setActive] = useState<string | null>(withImage[0]?.image ?? null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const links = el.querySelectorAll("[data-menu-link]");
    const img = el.querySelector("[data-menu-image]");
    if (open) {
      document.body.style.overflow = "hidden";
      gsap.set(el, { display: "flex" });
      const tl = gsap.timeline();
      tl.fromTo(el, { yPercent: -100 }, { yPercent: 0, duration: 0.8, ease: "power4.out" })
        .fromTo(
          links,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power3.out" },
          "-=0.4",
        )
        .fromTo(img, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }, "-=0.6");
      return () => {
        tl.kill();
      };
    } else {
      document.body.style.overflow = "";
      gsap.to(el, {
        yPercent: -100,
        duration: 0.6,
        ease: "power4.inOut",
        onComplete: () => gsap.set(el, { display: "none" }),
      });
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Transición suave de la imagen al cambiar de ítem
  useEffect(() => {
    const img = root.current?.querySelector("[data-menu-image]");
    if (!img) return;
    gsap.fromTo(img, { opacity: 0.4 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
  }, [active]);

  const primary = items.filter((i) => i.group === "primary");
  const secondary = items.filter((i) => i.group === "secondary");

  const renderLink = (item: MenuItem) => (
    <Link
      key={item.href + item.label}
      href={item.href}
      data-menu-link
      onClick={onClose}
      onMouseEnter={() => item.image && setActive(item.image)}
      onFocus={() => item.image && setActive(item.image)}
      className="display-sans text-[clamp(1.6rem,3.6vw,2.6rem)] text-ink hover:opacity-50 transition-opacity leading-none py-0.5"
    >
      {item.label}
    </Link>
  );

  return (
    <div
      ref={root}
      id="site-menu"
      className="fixed inset-0 z-40 bg-bg hidden flex-col items-center justify-center text-center px-6 overflow-y-auto"
      style={{ display: "none" }}
      aria-hidden={!open}
    >
      <nav className="flex flex-col items-center gap-1 pt-20 md:pt-0">{primary.map(renderLink)}</nav>

      <div
        data-menu-image
        className="relative my-4 w-[38vw] max-w-[380px] aspect-[3/4] photo-frame mono shrink-0"
      >
        {active && (
          <Image
            src={active}
            alt=""
            fill
            sizes="(max-width: 768px) 60vw, 380px"
            className="object-cover"
            priority
          />
        )}
      </div>

      <nav className="flex flex-col items-center gap-1 pb-10 md:pb-0">{secondary.map(renderLink)}</nav>
    </div>
  );
}
