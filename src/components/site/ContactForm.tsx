"use client";

import { useActionState } from "react";
import { sendInquiry, type ContactState } from "@/app/actions/contact";
import Reveal from "./Reveal";

type Props = { title: string; text: string; email: string; whatsappHref?: string | null };

export default function ContactForm({ title, text, email, whatsappHref }: Props) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendInquiry, null);

  return (
    <section id="contacto" className="px-6 md:px-16 py-24 md:py-32 border-t border-line">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
        <Reveal className="md:col-span-5">
          <p className="eyebrow text-muted">Contacto</p>
          <h2 className="display-serif mt-3 text-[clamp(2.6rem,6vw,5.5rem)]">{title}</h2>
          <p className="mt-6 max-w-md text-ink/80 leading-relaxed">{text}</p>
          <a href={`mailto:${email}`} className="mt-6 inline-block font-serif italic text-xl hover:opacity-60 transition-opacity">
            {email}
          </a>
          {whatsappHref && (
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-outline mt-6 block w-fit">
              Escríbenos por WhatsApp
            </a>
          )}
        </Reveal>

        <Reveal className="md:col-span-7" delay={0.1}>
          {state?.ok ? (
            <div className="border border-line p-10 text-center">
              <p className="display-serif text-3xl">Gracias</p>
              <p className="mt-3 text-ink/80">{state.message}</p>
            </div>
          ) : (
            <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <input name="name" placeholder="Nombre *" required className="field" />
              <input name="email" type="email" placeholder="Email *" required className="field" />
              <input name="eventType" placeholder="Tipo de evento" className="field" />
              <input name="location" placeholder="Lugar" className="field" />
              <input name="date" placeholder="Fecha" className="field" />
              <input name="planner" placeholder="Wedding planner" className="field" />
              <input name="instagram" placeholder="Instagram" className="field md:col-span-2" />
              <textarea name="message" placeholder="Cuéntanos sobre tu boda" rows={4} className="field md:col-span-2 resize-none" />
              {state && !state.ok && <p className="md:col-span-2 text-sm text-red-700">{state.message}</p>}
              <div className="md:col-span-2 mt-6">
                <button type="submit" disabled={pending} className="btn-outline w-full md:w-auto disabled:opacity-50">
                  {pending ? "Enviando…" : "Consultar disponibilidad"}
                </button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
