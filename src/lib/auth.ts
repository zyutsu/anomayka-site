import crypto from "crypto";

export interface StaffSession {
  adminId: string;
  email: string;
  name: string;
  role: string;
  /** Демо-сессия не даёт прав на реальные данные и публикацию. */
  demo?: boolean;
  exp: number;
}

const FALLBACK_SECRET =
  "anomayka-staff-session-v1-8f3c1d9b6a2e4f70b5c8d1e2a3f4b6c9";

function secret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.VERCEL_OIDC_TOKEN ||
    FALLBACK_SECRET
  );
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(payload: string): string {
  return b64url(crypto.createHmac("sha256", secret()).update(payload).digest());
}

/** Подписанный stateless-токен сессии: работает между serverless-инстансами. */
export function createStaffToken(session: Omit<StaffSession, "exp">, days = 7): string {
  const payload = b64url(
    JSON.stringify({ ...session, exp: Date.now() + days * 24 * 3600 * 1000 })
  );
  return payload + "." + sign(payload);
}

export function verifyStaffToken(token?: string | null): StaffSession | null {
  if (!token || token.indexOf(".") === -1) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const json = Buffer.from(
      payload.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf-8");
    const session = JSON.parse(json) as StaffSession;
    if (!session?.exp || session.exp < Date.now()) return null;
    return session;
  } catch (e) {
    return null;
  }
}

export function readSessionToken(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)staff_session=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);

  const header = req.headers.get("authorization") || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return null;
}

export function getStaffSession(req: Request): StaffSession | null {
  return verifyStaffToken(readSessionToken(req));
}

export function isDemoRequest(req: Request): boolean {
  try {
    return (
      req.headers.get("x-demo-mode") === "1" ||
      new URL(req.url).searchParams.get("demo") === "1"
    );
  } catch (e) {
    return false;
  }
}

/**
 * Доступ для персонала: подписанная сессия либо явный демо-режим.
 * Демо-сессия работает только внутри демо-запроса.
 */
export function canManage(req: Request): boolean {
  const demo = isDemoRequest(req);
  if (demo) return true;
  const session = getStaffSession(req);
  return Boolean(session && !session.demo);
}

export function hashPassword(pass: string): string {
  return crypto.createHash("sha256").update(pass).digest("hex");
}

export function verifyPassword(input: string, storedHashOrPass: string): boolean {
  if (!storedHashOrPass) return false;
  if (storedHashOrPass === input) return true;
  return storedHashOrPass === hashPassword(input);
}

