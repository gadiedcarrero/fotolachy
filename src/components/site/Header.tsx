"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import MenuOverlay, { type MenuItem } from "./MenuOverlay";

type Props = {
  siteName: string;
  items: MenuItem[];
};

export default function Header({ siteName, items }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Barra translúcida clara con desenfoque: el logo y el botón se leen sobre cualquier foto */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-3 md:px-8 md:py-4 bg-bg/85 backdrop-blur-md text-ink shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <Link href="/" onClick={() => setOpen(false)} aria-label={siteName} className="block">
          <Image src="/logo.png" alt={siteName} width={1200} height={295} priority className="h-9 md:h-11 w-auto" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-menu"
          className="menu-btn"
        >
          {open ? "CERRAR" : "MENU"}
        </button>
      </header>
      <MenuOverlay open={open} items={items} onClose={() => setOpen(false)} />
    </>
  );
}
