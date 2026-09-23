"use client";

import { useActionState } from "react";
import type { Section } from "@prisma/client";
import { LAYOUTS } from "@/lib/data";
import { updateSection, type ActionState } from "../../actions";

export default function SectionForm({ s, isStory }: { s: Section; isStory: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateSection, null);
  return (
    <form action={action} className="rounded-lg border border-line bg-white p-5 grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" value={s.id} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{isStory ? "Nombre de la historia (ej: la pareja)" : "Título"}</span>
        <input name="title" defaultValue={s.title} required className="admin-input" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">URL (slug)</span>
        <input name="slug" defaultValue={s.slug} className="admin-input" />
        <span className="text-xs text-muted">/galeria/{s.slug}</span>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{isStory ? "Lugar" : "Subtítulo"}</span>
        <input name="subtitle" defaultValue={s.subtitle ?? ""} className="admin-input" placeholder={isStory ? "Ej: Villa Pizzo, Lago de Como" : "Ej: Historias completas"} />
      </label>

      {isStory ? (
        <>
          {/* Las historias siempre viven dentro de su sección padre */}
          <input type="hidden" name="layout" value="card" />
          <div />
        </>
      ) : (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Presentación en la home</span>
          <select name="layout" defaultValue={s.layout} className="admin-input">
            {LAYOUTS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm md:col-span-2">
        <span className="font-medium">Descripción</span>
        <textarea name="description" defaultValue={s.description ?? ""} rows={3} className="admin-input" />
      </label>

      {isStory ? (
        <>
          <input type="hidden" name="showInMenu" value="" />
          <input type="hidden" name="showInHome" value="" />
        </>
      ) : (
        <>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="showInMenu" defaultChecked={s.showInMenu} /> Mostrar en el menú
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="showInHome" defaultChecked={s.showInHome} /> Mostrar en la home
          </label>
        </>
      )}

      <div className="md:col-span-2 flex items-center gap-4">
        <button type="submit" disabled={pending} className="admin-btn">
          {pending ? "Guardando…" : "Guardar"}
        </button>
        {state && <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}>{state.message}</p>}
      </div>
    </form>
  );
}
