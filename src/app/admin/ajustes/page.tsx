import { getSettings } from "@/lib/data";
import SettingsForm from "./SettingsForm";
import SettingsImageUpload from "@/components/admin/SettingsImageUpload";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <div>
      <h1 className="display-serif text-4xl">Ajustes y textos</h1>
      <p className="mt-2 text-muted">Todos los textos del sitio y las fotos fijas (hero y sobre nosotros).</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <SettingsImageUpload label="Foto del hero" field="heroPhotoUrl" url={s.heroPhotoUrl} hint="Foto grande de portada. Ideal vertical, mínimo 1400px de alto." />
        <SettingsImageUpload label="Foto de “sobre nosotros”" field="aboutPhotoUrl" url={s.aboutPhotoUrl} hint="Retrato del fotógrafo o del equipo. Formato vertical." />
      </div>

      <div className="mt-8">
        <SettingsForm s={s} />
      </div>
    </div>
  );
}
