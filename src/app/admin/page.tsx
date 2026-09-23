import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [sections, photos, unread] = await Promise.all([
    prisma.section.count(),
    prisma.photo.count(),
    prisma.inquiry.count({ where: { read: false } }),
  ]);

  const cards = [
    { href: "/admin/ajustes", title: "Ajustes y textos", desc: "Nombre del sitio, textos del hero, popup de reservas, sobre nosotros y contacto." },
    { href: "/admin/secciones", title: "Secciones y fotos", desc: `${sections} secciones · ${photos} fotos. Crea galerías, sube fotos y ordénalas.` },
    { href: "/admin/mensajes", title: "Mensajes", desc: unread > 0 ? `${unread} mensajes sin leer.` : "Consultas recibidas desde el formulario." },
  ];

  return (
    <div>
      <h1 className="display-serif text-4xl">Hola</h1>
      <p className="mt-2 text-muted">Desde aquí gestionas todo el contenido de tu sitio.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="rounded-lg border border-line bg-white p-5 hover:border-ink transition-colors">
            <h2 className="font-medium">{c.title}</h2>
            <p className="mt-2 text-sm text-muted">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
