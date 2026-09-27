"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef } from "react";
import type { Video } from "@prisma/client";
import { addVideo, deleteVideo, moveVideo, type ActionState } from "@/app/admin/actions";

/** Videos de YouTube de una sección: se pega el enlace y se muestran en la galería. No se sube ningún archivo. */
export default function VideoManager({ sectionId, videos }: { sectionId: string; videos: Video[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addVideo, null);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) form.current?.reset();
  }, [state]);

  return (
    <div>
      <form ref={form} action={action} className="flex flex-wrap items-end gap-3 rounded-lg border border-line bg-white p-4">
        <input type="hidden" name="sectionId" value={sectionId} />
        <label className="flex flex-col gap-1 text-sm flex-2 min-w-60">
          <span className="font-medium">Enlace de YouTube</span>
          <input name="url" required placeholder="Ej: https://youtu.be/…" className="admin-input" />
        </label>
        <label className="flex flex-col gap-1 text-sm flex-1 min-w-45">
          <span className="font-medium">Título (opcional)</span>
          <input name="title" placeholder="Ej: Quinceañera de Daniela" className="admin-input" />
        </label>
        <button disabled={pending} className="admin-btn">
          {pending ? "Añadiendo…" : "Añadir video"}
        </button>
        {state && <p className={`w-full text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}>{state.message}</p>}
      </form>

      <ul className="mt-4 flex flex-col gap-2">
        {videos.map((v, i) => (
          <li key={v.id} className="flex items-center gap-4 rounded-lg border border-line bg-white p-3">
            <div className="relative w-28 aspect-video shrink-0 overflow-hidden rounded bg-[#e6e4dd]">
              <Image src={`https://i.ytimg.com/vi/${v.youtubeId}/mqdefault.jpg`} alt="" fill sizes="112px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{v.title || "Sin título"}</p>
              <a href={`https://youtu.be/${v.youtubeId}`} target="_blank" rel="noreferrer" className="text-xs text-muted hover:underline">
                Ver en YouTube ↗
              </a>
            </div>
            <div className="flex items-center gap-1">
              <form action={moveVideo}>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="dir" value="up" />
                <button disabled={i === 0} className="admin-btn-ghost disabled:opacity-30" title="Subir">↑</button>
              </form>
              <form action={moveVideo}>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="dir" value="down" />
                <button disabled={i === videos.length - 1} className="admin-btn-ghost disabled:opacity-30" title="Bajar">↓</button>
              </form>
              <form
                action={deleteVideo}
                onSubmit={(e) => {
                  if (!confirm("¿Quitar este video de la galería? (No se borra de YouTube)")) e.preventDefault();
                }}
              >
                <input type="hidden" name="id" value={v.id} />
                <button className="admin-btn-ghost admin-btn-danger">Quitar</button>
              </form>
            </div>
          </li>
        ))}
        {videos.length === 0 && <li className="text-sm text-muted">Aún no hay videos en esta sección.</li>}
      </ul>
    </div>
  );
}
