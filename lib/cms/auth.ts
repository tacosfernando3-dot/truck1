import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "lc_admin_session";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "compadres";
}

function getAdminSecret() {
  return process.env.ADMIN_SECRET || "los-compadres-admin-secret";
}

export function createAdminSessionToken() {
  return createHmac("sha256", getAdminSecret())
    .update(getAdminPassword())
    .digest("hex");
}

export function verifyAdminSessionToken(token: string | undefined | null) {
  if (!token) return false;
  const expected = createAdminSessionToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(ADMIN_COOKIE)?.value);
}
