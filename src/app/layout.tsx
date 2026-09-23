import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/data";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
});

/** Título y descripción de la pestaña, tomados de los ajustes del panel. */
export async function generateMetadata(): Promise<Metadata> {
  let siteName = "Foto Lachy";
  let description = "Fotografía editorial de bodas";
  try {
    const s = await getSettings();
    siteName = s.siteName;
    description = s.tagline;
  } catch {
    // Sin base de datos (por ejemplo al prerenderizar la 404 en el build) se usan los valores por defecto
  }
  return {
    title: { default: siteName, template: `%s · ${siteName}` },
    description,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  // suppressHydrationWarning: extensiones del navegador (LanguageTool, etc.) añaden atributos
  // a <html> antes de que React hidrate y provocan un falso aviso de hydration mismatch.
  return (
    <html lang="es" className={`${cormorant.variable} ${jost.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
