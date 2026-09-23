import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE, isValidSession } from "@/lib/auth";
import { logout } from "./actions";

export const metadata = { title: "Panel de administración" };

const NAV = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/ajustes", label: "Ajustes y textos" },
  { href: "/admin/secciones", label: "Secciones y fotos" },
  { href: "/admin/mensajes", label: "Mensajes" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const logged = await isValidSession((await cookies()).get(SESSION_COOKIE)?.value);

  if (!logged) {
    return <div className="min-h-screen bg-[#f2f1ed] text-ink font-sans font-normal">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f2f1ed] text-ink font-sans font-normal">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-line bg-white px-5 py-6">
          <p className="text-[0.7rem] font-medium tracking-[0.3em] uppercase text-muted">Panel</p>
          <nav className="mt-6 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded px-3 py-2 text-sm hover:bg-[#f2f1ed]">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-2">
            <Link href="/" target="_blank" className="admin-btn-ghost justify-center">
              Ver sitio ↗
            </Link>
            <form action={logout}>
              <button className="admin-btn-ghost w-full justify-center">Cerrar sesión</button>
            </form>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="md:hidden flex items-center justify-between border-b border-line bg-white px-4 py-3">
            <nav className="flex gap-3 text-sm overflow-x-auto">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="whitespace-nowrap">
                  {n.label}
                </Link>
              ))}
            </nav>
            <form action={logout}>
              <button className="text-sm text-muted">Salir</button>
            </form>
          </header>
          <main className="px-4 py-6 md:px-10 md:py-10 max-w-5xl">{children}</main>
        </div>
      </div>
    </div>
  );
}
