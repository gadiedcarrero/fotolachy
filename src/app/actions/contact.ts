"use server";

import { prisma } from "@/lib/prisma";

export type ContactState = { ok: boolean; message: string } | null;

/** Guarda un mensaje del formulario de contacto para verlo en el panel de administración. */
export async function sendInquiry(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const name = get("name");
  const email = get("email");

  // Honeypot anti-spam
  if (get("website")) return { ok: true, message: "Gracias, te escribiremos pronto." };

  if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, message: "Por favor indica tu nombre y un email válido." };
  }

  await prisma.inquiry.create({
    data: {
      name,
      email,
      eventType: get("eventType") || null,
      location: get("location") || null,
      date: get("date") || null,
      planner: get("planner") || null,
      instagram: get("instagram") || null,
      message: get("message") || null,
    },
  });

  return { ok: true, message: "Gracias. Hemos recibido tu mensaje y te responderemos muy pronto." };
}
