import { cookies } from "next/headers";

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || "";

async function hashToken(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(
    password + (process.env.AUTH_SALT || "colin-atc-2026")
  );
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function isAuthenticated(): Promise<boolean> {
  if (!DASHBOARD_PASSWORD) return false;

  const cookieStore = await cookies();
  const session = cookieStore.get("atc-session");
  if (!session) return false;

  const expected = await hashToken(DASHBOARD_PASSWORD);
  return session.value === expected;
}
