"use client";

import { useActionState } from "react";
import type { SiteSettings } from "@prisma/client";
import { updateSettings, type ActionState } from "../actions";

function Field({ label, name, value, textarea, hint }: { label: string; name: string; value: string; textarea?: boolean; hint?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {textarea ? (
        <textarea name={name} defaultValue={value} rows={3} className="admin-input" />
      ) : (
        <input name={name} defaultValue={value} className="admin-input" />
      )}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-lg border border-line bg-white p-5">
      <legend className="px-2 text-[0.7rem] font-medium tracking-[0.25em] uppercase text-muted">{title}</legend>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export default function SettingsForm({ s }: { s: SiteSettings }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateSettings, null);

  return (
    <form action={action} className="flex flex-col gap-6">
      <Group title="General">
        <Field label="Nombre del sitio (logo)" name="siteName" value={s.siteName} />
        <Field label="Tagline" name="tagline" value={s.tagline} />
        <Field label="Email de contacto" name="contactEmail" value={s.contactEmail} />
        <Field label="Instagram (URL)" name="instagramUrl" value={s.instagramUrl} />
      </Group>

      <Group title="Hero (portada)">
        <Field label="Línea 1 (cursiva)" name="heroLine1" value={s.heroLine1} />
        <Field label="Línea 2 (mayúsculas)" name="heroLine2" value={s.heroLine2} />
        <Field label="Línea 3 (cursiva)" name="heroLine3" value={s.heroLine3} />
        <Field label="Subtítulo pequeño" name="heroSubtitle" value={s.heroSubtitle} />
      </Group>

      <Group title="Introducción">
        <div className="md:col-span-2">
          <Field label="Cita destacada" name="introQuote" value={s.introQuote} textarea />
        </div>
        <div className="md:col-span-2">
          <Field label="Texto de introducción" name="introText" value={s.introText} textarea />
        </div>
        <Field label="Texto de prensa" name="pressText" value={s.pressText} hint="Ej: Publicados en Vogue, Elle…" />
      </Group>

      <Group title="Popup de reservas">
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" name="bookingEnabled" defaultChecked={s.bookingEnabled} />
          Mostrar el popup de reservas
        </label>
        <Field label="Título" name="bookingTitle" value={s.bookingTitle} />
        <Field label="Texto" name="bookingText" value={s.bookingText} />
        <Field label="Texto del botón" name="bookingCta" value={s.bookingCta} />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Aparece después de (milisegundos)</span>
          <input name="bookingDelayMs" type="number" min={0} step={500} defaultValue={s.bookingDelayMs} className="admin-input" />
        </label>
      </Group>

      <Group title="Sobre nosotros">
        <Field label="Título" name="aboutTitle" value={s.aboutTitle} />
        <div className="md:col-span-2">
          <Field label="Texto" name="aboutText" value={s.aboutText} textarea />
        </div>
      </Group>

      <Group title="Contacto y pie">
        <div className="md:col-span-2">
          <Field label="Texto de contacto" name="contactText" value={s.contactText} textarea />
        </div>
        <Field label="Texto del pie de página" name="footerText" value={s.footerText} />
      </Group>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="admin-btn">
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
        {state && <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}>{state.message}</p>}
      </div>
    </form>
  );
}
