"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = { sectionId: string };

/** Sube varias fotos a la vez (drag & drop o selector) a una sección. */
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
    try {
      // Subimos en lotes de 4 para no saturar la memoria del servidor
      for (let i = 0; i < list.length; i += 4) {
        const batch = list.slice(i, i + 4);
        setProgress(`Subiendo ${Math.min(i + batch.length, list.length)} de ${list.length}…`);
        const fd = new FormData();
        fd.append("sectionId", sectionId);
        batch.forEach((f) => fd.append("files", f));
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Error al subir");
      }
      setProgress(`Listo: ${list.length} foto(s) subida(s).`);
      router.refresh();
    } catch (e) {
      setProgress(e instanceof Error ? e.message : "Error al subir");
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
