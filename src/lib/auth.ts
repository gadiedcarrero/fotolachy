/**
 * Autenticación mínima para el panel de administración.
 * Un solo usuario (el fotógrafo) con contraseña definida en ADMIN_PASSWORD.
 * La sesión es una cookie httpOnly con un HMAC firmado con AUTH_SECRET.
 * Usa Web Crypto para que funcione tanto en Node como en el proxy (edge).
 */

export const SESSION_COOKIE = "wf_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

function getSecret(): string {
  return process.env.AUTH_SECRET || "dev-secret-cambiame";
}

async function hmac(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Token esperado en la cookie de sesión. */
export async function sessionToken(): Promise<string> {
  return hmac("admin-session:v1");
}

export async function isValidSession(token?: string | null): Promise<boolean> {
  if (!token) return false;
  const expected = await sessionToken();
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  return expected.length > 0 && password === expected;
}
