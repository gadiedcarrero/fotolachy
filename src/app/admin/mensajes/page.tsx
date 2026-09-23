import { prisma } from "@/lib/prisma";
import { deleteInquiry, toggleInquiryRead } from "../actions";

export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="display-serif text-4xl">Mensajes</h1>
      <p className="mt-2 text-muted">Consultas recibidas desde el formulario de contacto del sitio.</p>

      <ul className="mt-8 flex flex-col gap-3">
        {inquiries.map((q) => (
          <li key={q.id} className={`rounded-lg border bg-white p-5 ${q.read ? "border-line" : "border-ink"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {q.name} {!q.read && <span className="ml-2 rounded bg-ink px-1.5 py-0.5 text-[10px] text-white align-middle">Nuevo</span>}
                </p>
                <a href={`mailto:${q.email}`} className="text-sm text-muted hover:underline">
                  {q.email}
                </a>
              </div>
              <p className="text-xs text-muted">{q.createdAt.toLocaleString("es-CO")}</p>
            </div>
            <dl className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-sm">
              {q.eventType && (<><dt className="text-muted">Evento</dt><dd>{q.eventType}</dd></>)}
              {q.location && (<><dt className="text-muted">Lugar</dt><dd>{q.location}</dd></>)}
              {q.date && (<><dt className="text-muted">Fecha</dt><dd>{q.date}</dd></>)}
              {q.planner && (<><dt className="text-muted">Planner</dt><dd>{q.planner}</dd></>)}
              {q.instagram && (<><dt className="text-muted">Instagram</dt><dd>{q.instagram}</dd></>)}
            </dl>
            {q.message && <p className="mt-3 text-sm whitespace-pre-line">{q.message}</p>}
            <div className="mt-4 flex gap-2">
              <form action={toggleInquiryRead}>
                <input type="hidden" name="id" value={q.id} />
                <button className="admin-btn-ghost">{q.read ? "Marcar como no leído" : "Marcar como leído"}</button>
              </form>
              <form action={deleteInquiry}>
                <input type="hidden" name="id" value={q.id} />
                <button className="admin-btn-ghost admin-btn-danger">Borrar</button>
              </form>
            </div>
          </li>
        ))}
        {inquiries.length === 0 && <li className="text-sm text-muted">Aún no hay mensajes.</li>}
      </ul>
    </div>
  );
}
