"use client";

import { useActionState } from "react";
import { login, type ActionState } from "../actions";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, null);
  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-1 text-sm">
        Contraseña
        <input name="password" type="password" required autoFocus className="admin-input" />
      </label>
      {state && !state.ok && <p className="text-sm text-red-700">{state.message}</p>}
      <button type="submit" disabled={pending} className="admin-btn justify-center">
        {pending ? "Entrando…" : "Entrar"}
      </button>
      <p className="text-xs text-muted">La contraseña se define en la variable ADMIN_PASSWORD del archivo .env</p>
    </form>
  );
}
