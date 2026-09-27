"use client";

import { useActionState } from "react";
import { sendInquiry, type ContactState } from "@/app/actions/contact";
import Reveal from "./Reveal";
import type { Dict, Lang } from "@/lib/i18n";
import type { SocialLink } from "@/lib/menu";

type Props = {
  title: string;
  text: string;
  email: string;
  socials: SocialLink[];
  whatsappHref?: string | null;
  lang: Lang;
  t: Dict;
};

export default function ContactForm({ title, text, email, socials, whatsappHref, lang, t }: Props) {
  const f = t.form;
  const [state, action, pending] = useActionState<ContactState, FormData>(sendInquiry, null);

  return (
    <section id="contacto" className="px-6 md:px-16 py-24 md:py-32 border-t border-line">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
        <Reveal className="md:col-span-5">
          <p className="eyebrow text-muted">{t.contact}</p>
          <h2 className="display-serif mt-3 text-[clamp(2.6rem,6vw,5.5rem)]">{title}</h2>
          <p className="mt-6 max-w-md text-ink/80 leading-relaxed">{text}</p>
          <a href={`mailto:${email}`} className="mt-6 inline-block font-serif italic text-xl hover:opacity-60 transition-opacity">
            {email}
          </a>
          {socials.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="eyebrow text-muted hover:text-ink transition-colors">
                  {s.label}
                </a>
              ))}
            </div>
          )}
          {whatsappHref && (
            <div className="mt-10">
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-outline">
                {t.whatsapp}
              </a>
            </div>
          )}
        </Reveal>

        <Reveal className="md:col-span-7" delay={0.1}>
          {state?.ok ? (
            <div className="border border-line p-10 text-center">
              <p className="display-serif text-3xl">{t.thanks}</p>
              <p className="mt-3 text-ink/80">{state.message}</p>
            </div>
          ) : (
            <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <input type="hidden" name="lang" value={lang} />
              <input name="name" placeholder={f.name} required className="field" />
              <input name="email" type="email" placeholder={f.email} required className="field" />
              <select name="eventType" defaultValue="" className="field field-select">
                <option value="" disabled>
                  {f.eventType}
                </option>
                {t.eventTypes.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
              <input name="location" placeholder={f.location} className="field" />
              <input name="date" placeholder={f.date} className="field" />
              <input name="phone" type="tel" autoComplete="tel" placeholder={f.phone} className="field" />
              <input name="instagram" placeholder={f.instagram} className="field md:col-span-2" />
              <textarea name="message" placeholder={f.message} rows={4} className="field md:col-span-2 resize-none" />
              {state && !state.ok && <p className="md:col-span-2 text-sm text-red-700">{state.message}</p>}
              <div className="md:col-span-2 mt-6">
                <button type="submit" disabled={pending} className="btn-outline w-full md:w-auto disabled:opacity-50">
                  {pending ? f.sending : f.submit}
                </button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
