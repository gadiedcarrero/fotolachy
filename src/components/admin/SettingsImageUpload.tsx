"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/client-image";
import { clearSettingsImage, setSettingsImage, type ImageField } from "@/app/admin/actions";

type Props = { label: string; field: ImageField; url: string | null; hint: string };

/** Foto fija del sitio (hero, sobre nosotros): se reduce en el navegador, se sube y se guarda en ajustes. */
export default function SettingsImageUpload({ label, field, url, hint }: Props) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function onFile(file: File) {
    setBusy(true);
    setMsg("Subiendo…");
    try {
      const img = await uploadImage(file);
      await setSettingsImage(field, img.url);
      setMsg("Foto actualizada.");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <p className="font-medium text-sm">{label}</p>
      <p className="text-xs text-muted mt-1">{hint}</p>
      <div className="mt-4 flex gap-4 items-start">
        <div className="relative w-28 aspect-3/4 bg-[#e6e4dd] overflow-hidden rounded">
          {url && <Image src={url} alt="" fill sizes="112px" className="object-cover" />}
        </div>
        <div className="flex flex-col gap-2">
          <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className="admin-btn w-fit">
            {busy ? "Subiendo…" : url ? "Subir y reemplazar" : "Subir foto"}
          </button>
          {url && (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await clearSettingsImage(field);
                  router.refresh();
                })
              }
              className="admin-btn-ghost admin-btn-danger w-fit"
            >
              Quitar
            </button>
          )}
          {msg && <p className="text-xs text-muted">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
