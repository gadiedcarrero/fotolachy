"use client";

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
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 md:px-8 mix-blend-difference text-white">
        <Link
          href="/"
          className="font-sans text-[0.8rem] font-medium tracking-[0.35em] uppercase"
          onClick={() => setOpen(false)}
        >
          {siteName}
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-menu"
          className="font-sans text-[0.8rem] tracking-[0.1em] px-2 py-0.5 border border-current outline outline-1 outline-offset-2 outline-current hover:bg-white hover:text-black transition-colors"
        >
          {open ? "CERRAR" : "MENU"}
        </button>
      </header>
      <MenuOverlay open={open} items={items} onClose={() => setOpen(false)} />
    </>
  );
}
