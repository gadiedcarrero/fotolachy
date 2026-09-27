import { createHash } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import type { Photo, Section, SiteSettings, Video } from "@prisma/client";
import type { Lang } from "./i18n";

/**
 * Traducción automática del contenido editable. El panel es solo en español; la versión en inglés
 * se genera a partir de él. Cada texto se traduce una vez y se guarda en la tabla Translation,
 * así que un cambio en el panel solo traduce los textos nuevos o modificados.
 * Si la traducción falla (sin servicio configurado, sin red...), se muestra el texto en español.
 */

const idFor = (lang: Lang, source: string) => createHash("sha1").update(`${lang}\n${source}`).digest("hex");

const LANG_NAMES: Record<Lang, string> = { es: "Spanish", en: "English" };

const SYSTEM_PROMPT = `You translate the website of a wedding and event photography studio from Spanish.
Keep the tone elegant, warm and editorial, as a native copywriter would write it. Keep proper names, brand names,
place names, email addresses, URLs, @handles and line breaks unchanged. Keep the capitalization style of each text
(ALL CAPS stays ALL CAPS). Return exactly one translation per input text, in the same order.`;

let client: Anthropic | null = null;

/** Traduce varios textos del español al idioma indicado con Claude. Devuelve null si no hay servicio disponible. */
async function machineTranslate(texts: string[], lang: Lang): Promise<string[] | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client ??= new Anthropic({ timeout: 60_000, maxRetries: 1 });

  const response = await client.beta.messages.create({
    model: "claude-opus-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: {
      effort: "low",
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: { translations: { type: "array", items: { type: "string" } } },
          required: ["translations"],
          additionalProperties: false,
        },
      },
    },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Translate each of these ${texts.length} texts into ${LANG_NAMES[lang]}:\n\n${JSON.stringify(texts)}`,
      },
    ],
  });

  if (response.stop_reason !== "end_turn") {
    console.error("[translate] respuesta incompleta:", response.stop_reason);
    return null;
  }
  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") return null;
  const { translations } = JSON.parse(text.text) as { translations: string[] };
  return translations.length === texts.length ? translations : null;
}

/** Devuelve un mapa texto original → traducción para todos los textos pedidos. */
export async function translateMany(texts: (string | null | undefined)[], lang: Lang): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const unique = [...new Set(texts.filter((t): t is string => !!t && t.trim() !== ""))];
  if (lang === "es" || unique.length === 0) return result;

  try {
    const ids = unique.map((t) => idFor(lang, t));
    const saved = await prisma.translation.findMany({ where: { id: { in: ids } } });
    for (const row of saved) result.set(row.source, row.text);

    const missing = unique.filter((t) => !result.has(t));
    if (missing.length === 0) return result;

    // En tandas, para que una galería con muchas fotos no genere una petición enorme
    for (let i = 0; i < missing.length; i += 60) {
      const batch = missing.slice(i, i + 60);
      const translated = await machineTranslate(batch, lang);
      if (!translated) break;
      const rows = batch.map((source, j) => ({ id: idFor(lang, source), lang, source, text: translated[j] }));
      rows.forEach((r) => result.set(r.source, r.text));
      await prisma.translation.createMany({ data: rows, skipDuplicates: true });
    }
  } catch (err) {
    console.error("[translate]", err);
  }
  return result;
}

/* ---------- Contenido del sitio ---------- */

const SETTINGS_FIELDS = [
  "tagline", "heroLine1", "heroLine2", "heroLine3", "heroSubtitle", "introQuote", "introText",
  "bookingTitle", "bookingText", "bookingCta", "aboutTitle", "aboutText", "contactText",
  "whatsappMessage", "pressText", "footerText",
] as const satisfies readonly (keyof SiteSettings)[];

const SECTION_FIELDS = ["title", "subtitle", "description"] as const satisfies readonly (keyof Section)[];

type WithPhotos = { photos?: Photo[]; videos?: Video[] };
type Localizable = Section & WithPhotos & { children?: (Section & WithPhotos)[]; parent?: Section | null };

function sectionTexts(s: Localizable): (string | null)[] {
  return [
    ...SECTION_FIELDS.map((f) => s[f]),
    ...(s.photos ?? []).map((p) => p.alt),
    ...(s.videos ?? []).map((v) => v.title),
    ...(s.children ?? []).flatMap(sectionTexts),
    ...(s.parent ? sectionTexts(s.parent) : []),
  ];
}

function applySection<T extends Localizable>(s: T, map: Map<string, string>): T {
  const tr = <V extends string | null>(v: V): V => (v ? ((map.get(v) ?? v) as V) : v);
  return {
    ...s,
    title: tr(s.title),
    subtitle: tr(s.subtitle),
    description: tr(s.description),
    photos: s.photos?.map((p) => ({ ...p, alt: tr(p.alt) })),
    videos: s.videos?.map((v) => ({ ...v, title: tr(v.title) })),
    children: s.children?.map((c) => applySection(c, map)),
    parent: s.parent ? applySection(s.parent, map) : s.parent,
  };
}

/** Ajustes y secciones en el idioma pedido. En español se devuelven tal cual. */
export async function localizeContent<S extends Localizable>(
  lang: Lang,
  settings: SiteSettings,
  sections: S[],
): Promise<{ settings: SiteSettings; sections: S[] }> {
  if (lang === "es") return { settings, sections };
  const map = await translateMany(
    [...SETTINGS_FIELDS.map((f) => settings[f]), ...sections.flatMap(sectionTexts)],
    lang,
  );
  const localizedSettings = { ...settings };
  for (const f of SETTINGS_FIELDS) localizedSettings[f] = map.get(settings[f]) ?? settings[f];
  return { settings: localizedSettings, sections: sections.map((s) => applySection(s, map)) };
}

/** Pretraduce todo el contenido tras un cambio en el panel, para que el primer visitante en inglés no espere. */
export async function warmTranslations(): Promise<void> {
  const [settings, sections] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
    prisma.section.findMany({ include: { photos: true, videos: true } }),
  ]);
  if (!settings) return;
  await localizeContent("en", settings, sections);
}
