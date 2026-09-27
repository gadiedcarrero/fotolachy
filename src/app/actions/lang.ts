"use server";

import { cookies } from "next/headers";
import { LANG_COOKIE, normalizeLang } from "@/lib/i18n";

/** Guarda el idioma elegido en el selector. Al cambiar una cookie, Next vuelve a renderizar la página. */
export async function setLang(lang: string): Promise<void> {
  (await cookies()).set(LANG_COOKIE, normalizeLang(lang), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
