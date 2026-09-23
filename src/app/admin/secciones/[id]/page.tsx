import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSectionById, sectionCover } from "@/lib/data";
import SectionForm from "./SectionForm";
import Uploader from "@/components/admin/Uploader";
import PhotoManager from "@/components/admin/PhotoManager";
import { createSection, deleteSection, moveSection } from "../../actions";

export const dynamic = "force-dynamic";

export default async function SectionEditPage({ params }: PageProps<"/admin/secciones/[id]">) {
  const { id } = await params;
  const section = await getSectionById(id);
  if (!section) notFound();

  const isStory = Boolean(section.parent);
  const isStoriesParent = section.layout === "stories" && !isStory;

  return (
    <div>
      <Link href={section.parent ? `/admin/secciones/${section.parent.id}` : "/admin/secciones"} className="text-sm text-muted hover:underline">
        ← {section.parent ? section.parent.title : "Secciones"}
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          {isStory && <p className="text-[0.7rem] font-medium tracking-[0.25em] uppercase text-muted">Historia</p>}
          <h1 className="display-serif text-4xl">{section.title}</h1>
        </div>
        <Link href={`/galeria/${section.slug}`} target="_blank" className="admin-btn-ghost">
          Ver en el sitio ↗
        </Link>
      </div>

      <div className="mt-8">
        <SectionForm s={section} isStory={isStory} />
      </div>

      {isStoriesParent && (
        <>
          <h2 className="mt-10 text-lg font-medium">Historias</h2>
          <p className="mt-1 text-sm text-muted">
            Cada historia es una boda con su propia galería. En la home se muestran con scroll horizontal, en este orden.
          </p>

          <form action={createSection} className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-line bg-white p-4">
            <input type="hidden" name="parentId" value={section.id} />
            <label className="flex flex-col gap-1 text-sm flex-1 min-w-45">
              <span className="font-medium">Nueva historia</span>
              <input name="title" placeholder="Ej: Sofía & Andrés" required className="admin-input" />
            </label>
            <label className="flex flex-col gap-1 text-sm flex-1 min-w-45">
              <span className="font-medium">Lugar</span>
              <input name="subtitle" placeholder="Ej: Villa Pizzo, Lago de Como" className="admin-input" />
            </label>
            <button className="admin-btn">Crear historia</button>
          </form>

          <ul className="mt-4 flex flex-col gap-2">
            {section.children.map((c, i) => {
              const cover = sectionCover(c);
              return (
                <li key={c.id} className="flex items-center gap-4 rounded-lg border border-line bg-white p-3">
                  <div className="relative w-12 aspect-3/4 shrink-0 overflow-hidden rounded bg-[#e6e4dd]">
                    {cover && <Image src={cover} alt="" fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/secciones/${c.id}`} className="font-medium hover:underline">
                      {c.title}
                    </Link>
                    <p className="text-xs text-muted truncate">
                      {c.subtitle && `${c.subtitle} · `}
                      {c.photos.length} fotos · /galeria/{c.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <form action={moveSection}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="dir" value="up" />
                      <button disabled={i === 0} className="admin-btn-ghost disabled:opacity-30" title="Subir">↑</button>
                    </form>
                    <form action={moveSection}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="dir" value="down" />
                      <button disabled={i === section.children.length - 1} className="admin-btn-ghost disabled:opacity-30" title="Bajar">↓</button>
                    </form>
                    <Link href={`/admin/secciones/${c.id}`} className="admin-btn-ghost">
                      Fotos
                    </Link>
                  </div>
                </li>
              );
            })}
            {section.children.length === 0 && <li className="text-sm text-muted">Aún no hay historias. Crea la primera arriba.</li>}
          </ul>
        </>
      )}

      <h2 className="mt-10 text-lg font-medium">{isStoriesParent ? "Fotos propias de la sección (opcional)" : "Fotos"}</h2>
      {isStoriesParent && (
        <p className="mt-1 text-sm text-muted">Se muestran en la página de la sección debajo de las historias. Normalmente no hace falta.</p>
      )}
      <div className="mt-3">
        <Uploader sectionId={section.id} />
      </div>
      <div className="mt-6">
        <PhotoManager sectionId={section.id} photos={section.photos} coverUrl={section.coverUrl} />
      </div>

      <div className="mt-14 rounded-lg border border-red-200 bg-white p-5">
        <p className="text-sm font-medium text-red-700">Zona de peligro</p>
        <p className="mt-1 text-xs text-muted">
          Borra {isStory ? "esta historia" : "la sección"} y todas sus fotos{isStoriesParent ? " e historias" : ""}. Esta acción no se puede deshacer.
        </p>
        <form action={deleteSection} className="mt-3">
          <input type="hidden" name="id" value={section.id} />
          <button className="admin-btn-ghost admin-btn-danger">Borrar {isStory ? "historia" : "sección"}</button>
        </form>
      </div>
    </div>
  );
}
