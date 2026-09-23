import Image from "next/image";
import Link from "next/link";
import { getSections, sectionCover, LAYOUTS } from "@/lib/data";
import { createSection, moveSection } from "../actions";

export const dynamic = "force-dynamic";

const layoutLabel: Record<string, string> = {
  stories: "historias · scroll horizontal",
  vertical: "fotos en vertical",
  card: "tarjeta",
};

export default async function SectionsPage() {
  const sections = await getSections();

  return (
    <div>
      <h1 className="display-serif text-4xl">Secciones y fotos</h1>
      <p className="mt-2 text-muted">
        Cada sección aparece en el menú y en la home, y tiene su propia página. Una sección de tipo &quot;historias&quot; contiene sub-galerías
        (una por boda) que se muestran con scroll horizontal. El orden aquí es el orden en el sitio.
      </p>

      <form action={createSection} className="mt-8 flex flex-wrap items-end gap-3 rounded-lg border border-line bg-white p-5">
        <label className="flex flex-col gap-1 text-sm flex-1 min-w-50">
          <span className="font-medium">Nueva sección</span>
          <input name="title" placeholder="Ej: Bodas reales" required className="admin-input" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Presentación en la home</span>
          <select name="layout" defaultValue="card" className="admin-input">
            {LAYOUTS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <button className="admin-btn">Crear</button>
      </form>

      <ul className="mt-6 flex flex-col gap-3">
        {sections.map((s, i) => {
          const cover = sectionCover(s);
          const total = s.photos.length + s.children.reduce((n, c) => n + c.photos.length, 0);
          return (
            <li key={s.id} className="rounded-lg border border-line bg-white p-3">
              <div className="flex items-center gap-4">
                <div className="relative w-16 aspect-3/4 shrink-0 overflow-hidden rounded bg-[#e6e4dd]">
                  {cover && <Image src={cover} alt="" fill sizes="64px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/secciones/${s.id}`} className="font-medium hover:underline">
                    {s.title}
                  </Link>
                  <p className="text-xs text-muted truncate">
                    /galeria/{s.slug} · {total} fotos · {layoutLabel[s.layout] ?? s.layout}
                    {s.layout === "stories" && ` · ${s.children.length} historias`}
                    {!s.showInMenu && " · oculta en menú"}
                    {!s.showInHome && " · oculta en home"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <form action={moveSection}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="dir" value="up" />
                    <button disabled={i === 0} className="admin-btn-ghost disabled:opacity-30" title="Subir">↑</button>
                  </form>
                  <form action={moveSection}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="dir" value="down" />
                    <button disabled={i === sections.length - 1} className="admin-btn-ghost disabled:opacity-30" title="Bajar">↓</button>
                  </form>
                  <Link href={`/admin/secciones/${s.id}`} className="admin-btn-ghost">
                    Editar
                  </Link>
                </div>
              </div>

              {s.children.length > 0 && (
                <ul className="mt-3 ml-20 flex flex-col gap-1 border-l border-line pl-4">
                  {s.children.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-3 text-sm">
                      <Link href={`/admin/secciones/${c.id}`} className="hover:underline truncate">
                        {c.title}
                        {c.subtitle && <span className="text-muted"> · {c.subtitle}</span>}
                      </Link>
                      <span className="text-xs text-muted whitespace-nowrap">{c.photos.length} fotos</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
        {sections.length === 0 && <li className="text-sm text-muted">Aún no hay secciones. Crea la primera arriba.</li>}
      </ul>
    </div>
  );
}
