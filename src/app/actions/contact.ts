"use server";

import { prisma } from "@/lib/prisma";
import { getDict, normalizeLang } from "@/lib/i18n";

export type ContactState = { ok: boolean; message: string } | null;

/** Guarda un mensaje del formulario de contacto para verlo en el panel de administración. */
export async function sendInquiry(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const name = get("name");
  const email = get("email");
  const t = getDict(normalizeLang(get("lang"))).form;

  // Honeypot anti-spam
  if (get("website")) return { ok: true, message: t.ok };

  if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, message: t.invalid };
  }

  await prisma.inquiry.create({
    data: {
      name,
      email,
      eventType: get("eventType") || null,
      location: get("location") || null,
      date: get("date") || null,
      phone: get("phone") || null,
      instagram: get("instagram") || null,
      message: get("message") || null,
    },
  });

  return { ok: true, message: t.ok };
}
