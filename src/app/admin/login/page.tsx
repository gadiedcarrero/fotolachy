import LoginForm from "./LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/admin";
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-white p-8 shadow-sm">
        <p className="text-[0.7rem] font-medium tracking-[0.3em] uppercase text-muted">Panel de administración</p>
        <h1 className="display-serif mt-2 text-3xl">Iniciar sesión</h1>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
