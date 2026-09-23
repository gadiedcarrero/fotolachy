"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/client-image";

type Props = { sectionId: string };

/**
 * Sube varias fotos a una sección (drag & drop o selector).
 * Cada foto se reduce en el navegador y se envía en una petición propia,
 * para no superar el límite de tamaño por petición de Vercel.
 */
export default function Uploader({ sectionId }: Props) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    setBusy(true);
    let done = 0;
    const errors: string[] = [];
    try {
      for (const file of list) {
        setProgress(`Subiendo ${done + 1} de ${list.length}…`);
        try {
          await uploadImage(file, sectionId);
          done++;
        } catch (e) {
          errors.push(`${file.name}: ${e instanceof Error ? e.message : "error"}`);
        }
      }
      setProgress(
        errors.length === 0
          ? `Listo: ${done} foto(s) subida(s).`
          : `${done} subida(s), ${errors.length} con error. ${errors[0]}`,
      );
      router.refresh();
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        upload(e.dataTransfer.files);
      }}
      className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${over ? "border-ink bg-white" : "border-line bg-white/60"}`}
    >
      <p className="text-sm">Arrastra tus fotos aquí o</p>
      <button type="button" onClick={() => input.current?.click()} disabled={busy} className="admin-btn mt-3">
        {busy ? "Subiendo…" : "Seleccionar fotos"}
      </button>
      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && upload(e.target.files)} />
      <p className="mt-3 text-xs text-muted">JPG, PNG o WebP. Se optimizan automáticamente (máx. 2400px, WebP).</p>
      {progress && <p className="mt-2 text-sm">{progress}</p>}
    </div>
  );
}
