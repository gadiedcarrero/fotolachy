"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import type { Photo } from "@prisma/client";
import { deletePhoto, reorderPhotos, setSectionCover, updatePhotoAlt } from "@/app/admin/actions";

type Props = { sectionId: string; photos: Photo[]; coverUrl: string | null };

/**
 * Cuadrícula de fotos de una sección: reordenar (arrastrar o flechas),
 * marcar como portada, editar texto alternativo y borrar.
 */
export default function PhotoManager({ sectionId, photos, coverUrl }: Props) {
  const [items, setItems] = useState(photos);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();

  // Cuando el servidor envía una nueva lista (tras subir/borrar), sincronizamos el estado local.
  const [prevPhotos, setPrevPhotos] = useState(photos);
  if (prevPhotos !== photos) {
    setPrevPhotos(photos);
    setItems(photos);
    setDirty(false);
  }

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    setDirty(true);
  }

  function saveOrder() {
    start(async () => {
      await reorderPhotos(sectionId, items.map((p) => p.id));
      setDirty(false);
    });
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted">Esta sección aún no tiene fotos. Sube algunas arriba.</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <p className="text-sm text-muted">{items.length} fotos · arrastra para reordenar. La primera foto es la que abre la galería.</p>
        {dirty && (
          <button onClick={saveOrder} disabled={pending} className="admin-btn">
            {pending ? "Guardando…" : "Guardar orden"}
          </button>
        )}
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((p, i) => {
          const isCover = coverUrl === p.url;
          return (
            <li
              key={p.id}
              draggable
              onDragStart={() => setDragId(p.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (!dragId) return;
                const from = items.findIndex((x) => x.id === dragId);
                move(from, i);
                setDragId(null);
              }}
              className={`rounded-lg border bg-white p-2 flex flex-col gap-2 ${isCover ? "border-ink" : "border-line"} ${dragId === p.id ? "opacity-50" : ""}`}
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded bg-[#e6e4dd] cursor-grab">
                <Image src={p.url} alt={p.alt} fill sizes="200px" className="object-cover" />
                <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 text-[10px] text-white">{i + 1}</span>
                {isCover && <span className="absolute right-1 top-1 rounded bg-white px-1.5 text-[10px]">Portada</span>}
              </div>

              <form action={updatePhotoAlt} className="flex gap-1">
                <input type="hidden" name="id" value={p.id} />
                <input name="alt" defaultValue={p.alt} placeholder="Descripción" className="admin-input py-1! px-2! text-xs" />
                <button className="admin-btn-ghost px-2! text-xs" title="Guardar descripción">✓</button>
              </form>

              <div className="flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="admin-btn-ghost px-2! text-xs disabled:opacity-30">←</button>
                  <button type="button" onClick={() => move(i, i + 1)} disabled={i === items.length - 1} className="admin-btn-ghost px-2! text-xs disabled:opacity-30">→</button>
                </div>
                <div className="flex gap-1">
                  {!isCover && (
                    <form action={setSectionCover}>
                      <input type="hidden" name="id" value={sectionId} />
                      <input type="hidden" name="url" value={p.url} />
                      <button className="admin-btn-ghost px-2! text-xs" title="Usar como portada (menú)">★</button>
                    </form>
                  )}
                  <form
                    action={deletePhoto}
                    onSubmit={(e) => {
                      if (!confirm("¿Borrar esta foto?")) e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="id" value={p.id} />
                    <button className="admin-btn-ghost admin-btn-danger px-2! text-xs" title="Borrar">✕</button>
                  </form>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
