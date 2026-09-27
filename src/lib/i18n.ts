/**
 * Textos fijos del sitio público en los dos idiomas.
 * El contenido editable (ajustes, secciones, fotos) se escribe en español en el panel
 * y se traduce automáticamente: ver src/lib/translate.ts.
 */

export const LANGS = ["es", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "es";
export const LANG_COOKIE = "lang";

export function normalizeLang(value: string | null | undefined): Lang {
  return value === "en" ? "en" : DEFAULT_LANG;
}

/** Tipos de evento del formulario. `value` se guarda en español porque el panel es solo en español. */
const EVENT_TYPES: { value: string; en: string }[] = [
  { value: "Boda", en: "Wedding" },
  { value: "Fiesta de 15 / Quinceañera", en: "Quinceañera / Sweet 15" },
  { value: "Preboda / Compromiso", en: "Engagement session" },
  { value: "Sesión de embarazo", en: "Maternity session" },
  { value: "Recién nacido / Newborn", en: "Newborn" },
  { value: "Bautizo / Primera comunión", en: "Baptism / First communion" },
  { value: "Cumpleaños", en: "Birthday" },
  { value: "Graduación", en: "Graduation" },
  { value: "Sesión familiar", en: "Family session" },
  { value: "Retrato / Sesión personal", en: "Portrait session" },
  { value: "Evento social", en: "Social event" },
  { value: "Evento corporativo", en: "Corporate event" },
  { value: "Otro", en: "Other" },
];

const es = {
  menu: "MENU",
  close: "CERRAR",
  closeLabel: "Cerrar",
  languageLabel: "Idioma",
  about: "Nosotros",
  contact: "Contacto",
  gallery: "Galería",
  galleries: "Galerías",
  moreGalleries: "Más galerías",
  stories: "Historias",
  viewAll: "Ver todas",
  viewFullGallery: "Ver galería completa",
  photos: "fotos",
  videos: "Videos",
  playVideo: "Reproducir video",
  noPhotos: "Aún no hay fotos en esta galería.",
  whatsapp: "Escríbenos por WhatsApp",
  contactTitle: "Consulta tu fecha",
  thanks: "Gracias",
  form: {
    name: "Nombre *",
    email: "Email *",
    eventType: "Tipo de evento",
    location: "Lugar",
    date: "Fecha",
    phone: "Teléfono",
    instagram: "Instagram",
    message: "Cuéntanos sobre tu evento",
    sending: "Enviando…",
    submit: "Consultar disponibilidad",
    ok: "Gracias. Hemos recibido tu mensaje y te responderemos muy pronto.",
    invalid: "Por favor indica tu nombre y un email válido.",
  },
  eventTypes: EVENT_TYPES.map((e) => ({ value: e.value, label: e.value })),
};

export type Dict = typeof es;

const en: Dict = {
  menu: "MENU",
  close: "CLOSE",
  closeLabel: "Close",
  languageLabel: "Language",
  about: "About",
  contact: "Contact",
  gallery: "Gallery",
  galleries: "Galleries",
  moreGalleries: "More galleries",
  stories: "Stories",
  viewAll: "View all",
  viewFullGallery: "View full gallery",
  photos: "photos",
  videos: "Videos",
  playVideo: "Play video",
  noPhotos: "There are no photos in this gallery yet.",
  whatsapp: "Message us on WhatsApp",
  contactTitle: "Check your date",
  thanks: "Thank you",
  form: {
    name: "Name *",
    email: "Email *",
    eventType: "Type of event",
    location: "Location",
    date: "Date",
    phone: "Phone",
    instagram: "Instagram",
    message: "Tell us about your event",
    sending: "Sending…",
    submit: "Check availability",
    ok: "Thank you. We have received your message and will get back to you very soon.",
    invalid: "Please enter your name and a valid email.",
  },
  eventTypes: EVENT_TYPES.map((e) => ({ value: e.value, label: e.en })),
};

const DICTS: Record<Lang, Dict> = { es, en };

export function getDict(lang: Lang): Dict {
  return DICTS[lang];
}
