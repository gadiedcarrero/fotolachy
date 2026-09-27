import { cookies } from "next/headers";
import { LANG_COOKIE, normalizeLang, type Lang } from "./i18n";

/** Idioma elegido por el visitante (cookie del selector). Por defecto español. */
export async function getLang(): Promise<Lang> {
  return normalizeLang((await cookies()).get(LANG_COOKIE)?.value);
}
