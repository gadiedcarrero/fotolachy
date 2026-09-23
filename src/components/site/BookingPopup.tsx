"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

type Props = {
  enabled: boolean;
  title: string;
  text: string;
  cta: string;
  delayMs: number;
  href?: string;
};

/** Tarjeta de "Reservas" que aparece en la esquina inferior derecha tras unos segundos. */
export default function BookingPopup({ enabled, title, text, cta, delayMs, href = "#contacto" }: Props) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    try {
      if (sessionStorage.getItem("wf_booking_dismissed") === "1") return;
    } catch {}
    const t = setTimeout(() => setVisible(true), Math.max(0, delayMs));
    return () => clearTimeout(t);
  }, [enabled, delayMs]);

  useEffect(() => {
    if (!visible || !box.current) return;
    gsap.fromTo(box.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
  }, [visible]);

  const close = () => {
    if (!box.current) return setDismissed(true);
    gsap.to(box.current, {
      y: 30,
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        setDismissed(true);
        try {
          sessionStorage.setItem("wf_booking_dismissed", "1");
        } catch {}
      },
    });
  };

  if (!enabled || !visible || dismissed) return null;

  return (
    <div
      ref={box}
      role="dialog"
      aria-label={title}
      className="fixed bottom-24 right-4 z-30 w-[calc(100%-2rem)] max-w-[460px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] px-6 pt-8 pb-5 text-center"
    >
      <button
        type="button"
        onClick={close}
        aria-label="Cerrar"
        className="absolute right-3 top-2 text-xl leading-none text-ink/70 hover:text-ink"
      >
        ×
      </button>
      <h3 className="display-serif text-[2rem] text-ink">{title}</h3>
      <p className="mt-1 font-serif italic text-[1.05rem] text-ink/80">{text}</p>
      <a href={href} onClick={close} className="btn-outline mt-5 w-full">
        {cta}
      </a>
    </div>
  );
}
