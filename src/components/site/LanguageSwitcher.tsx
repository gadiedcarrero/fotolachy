"use client";

import { useTransition } from "react";
import { setLang } from "@/app/actions/lang";
import { LANGS, type Lang } from "@/lib/i18n";

/** Selector ES / EN: guarda el idioma en una cookie y la página se vuelve a pedir en ese idioma. */
export default function LanguageSwitcher({ lang, label }: { lang: Lang; label: string }) {
  const [pending, startTransition] = useTransition();

  const choose = (next: Lang) => {
    if (next === lang) return;
    startTransition(() => setLang(next));
  };

  return (
    <div role="group" aria-label={label} className={`flex items-center gap-1 text-[0.8rem] tracking-[0.12em] ${pending ? "opacity-60" : ""}`}>
      {LANGS.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden className="text-bg/40">/</span>}
          <button
            type="button"
            onClick={() => choose(l)}
            aria-pressed={l === lang}
            className={`uppercase transition-opacity ${l === lang ? "text-bg" : "text-bg/50 hover:text-bg"}`}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
