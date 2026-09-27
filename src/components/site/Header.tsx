"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import MenuOverlay, { type MenuItem } from "./MenuOverlay";
import LanguageSwitcher from "./LanguageSwitcher";
import type { Dict, Lang } from "@/lib/i18n";

type Props = {
  siteName: string;
  items: MenuItem[];
  lang: Lang;
  t: Dict;
};

export default function Header({ siteName, items, lang, t }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Barra oscura: el logo crema y dorado se lee sobre cualquier foto */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-3 md:px-8 md:py-4 bg-ink/95 backdrop-blur-md text-bg">
        <Link href="/" onClick={() => setOpen(false)} aria-label={siteName} className="block">
          <Image src="/lachy.png" alt={siteName} width={1536} height={1024} priority className="h-12 md:h-16 w-auto" />
        </Link>
        <div className="flex items-center gap-5 md:gap-7">
          <LanguageSwitcher lang={lang} label={t.languageLabel} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="menu-btn"
          >
            {open ? t.close : t.menu}
          </button>
        </div>
      </header>
      <MenuOverlay open={open} items={items} onClose={() => setOpen(false)} />
    </>
  );
}
