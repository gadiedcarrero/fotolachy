import Image from "next/image";
import { getSettings } from "@/lib/data";
import SettingsForm from "./SettingsForm";
import { clearSettingsImage, uploadSettingsImage } from "../actions";

export const dynamic = "force-dynamic";

function ImageSlot({ label, field, url, hint }: { label: string; field: "heroPhotoUrl" | "aboutPhotoUrl"; url: string | null; hint: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <p className="font-medium text-sm">{label}</p>
      <p className="text-xs text-muted mt-1">{hint}</p>
      <div className="mt-4 flex gap-4 items-start">
        <div className="relative w-28 aspect-[3/4] bg-[#e6e4dd] overflow-hidden rounded">
          {url && <Image src={url} alt="" fill sizes="112px" className="object-cover" />}
        </div>
        <div className="flex flex-col gap-2">
          <form action={uploadSettingsImage} className="flex flex-col gap-2">
            <input type="hidden" name="field" value={field} />
            <input type="file" name="file" accept="image/*" required className="text-sm" />
            <button className="admin-btn w-fit">Subir y reemplazar</button>
          </form>
          {url && (
            <form action={clearSettingsImage}>
              <input type="hidden" name="field" value={field} />
              <button className="admin-btn-ghost admin-btn-danger">Quitar</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <div>
      <h1 className="display-serif text-4xl">Ajustes y textos</h1>
      <p className="mt-2 text-muted">Todos los textos del sitio y las fotos fijas (hero y sobre nosotros).</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <ImageSlot label="Foto del hero" field="heroPhotoUrl" url={s.heroPhotoUrl} hint="Foto grande de portada. Ideal vertical, mínimo 1400px de alto." />
        <ImageSlot label="Foto de “sobre nosotros”" field="aboutPhotoUrl" url={s.aboutPhotoUrl} hint="Retrato del fotógrafo o del equipo. Formato vertical." />
      </div>

      <div className="mt-8">
        <SettingsForm s={s} />
      </div>
    </div>
  );
}
