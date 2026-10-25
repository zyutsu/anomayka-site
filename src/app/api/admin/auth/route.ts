import { NextResponse } from "next/server";
import { getDatabaseAsync, saveDatabaseAsync } from "@/lib/db";
import {
  createStaffToken,
  hashPassword,
  isDemoRequest,
  readSessionToken,
  verifyPassword,
  verifyStaffToken,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

const DEMO_PASSWORD = "AutoPro#2026";
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function clientKey(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

export async function GET(req: Request) {
  const session = verifyStaffToken(readSessionToken(req));
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.adminId,
      email: session.email,
      name: session.name,
      role: session.role,
    },
  });
}

export async function POST(req: Request) {
  try {
    const key = clientKey(req);
    const attempt = loginAttempts.get(key);
    if (attempt && attempt.lockedUntil > Date.now()) {
      const minutes = Math.ceil((attempt.lockedUntil - Date.now()) / 60000);
      return NextResponse.json(
        { error: "Слишком много попыток. Повторите через " + minutes + " мин." },
        { status: 429 }
      );
    }

    const demo = isDemoRequest(req);
    const { email, password } = await req.json();
    const login = String(email || "").toLowerCase().trim();

    const db = await getDatabaseAsync();
    const admin =
      db.admins.find((a) => a.email.toLowerCase() === login) ||
      (login === "anomayka" || login === "admin@anomayka.ru" ? db.admins[0] : undefined);

    const valid = demo
      ? verifyPassword(password || "", DEMO_PASSWORD)
      : Boolean(admin && verifyPassword(password || "", admin.passwordHash));

    if (!admin || !valid) {
      const current = attempt || { count: 0, lockedUntil: 0 };
      current.count += 1;
      if (current.count >= 5) current.lockedUntil = Date.now() + 5 * 60 * 1000;
      loginAttempts.set(key, current);
      return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
    }

    loginAttempts.delete(key);

    const token = createStaffToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      demo,
    });

    const res = NextResponse.json({
      success: true,
      user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    });

    res.cookies.set("staff_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 3600,
    });

    return res;
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return NextResponse.json({ error: "Ошибка авторизации" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const demo = isDemoRequest(req);
    const session = verifyStaffToken(readSessionToken(req));
    if (!demo && !session) {
      return NextResponse.json({ error: "Требуется вход в панель" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!newPassword || String(newPassword).length < 8) {
      return NextResponse.json(
        { error: "Новый пароль должен содержать не менее 8 символов" },
        { status: 400 }
      );
    }

    if (demo) {
      return NextResponse.json({
        success: true,
        demo: true,
        message: "В демо-режиме пароль не изменяется",
      });
    }

    const db = await getDatabaseAsync();
    const index = db.admins.findIndex((a) => a.id === session!.adminId);
    if (index === -1) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const admin = db.admins[index];
    if (!verifyPassword(currentPassword || "", admin.passwordHash)) {
      return NextResponse.json({ error: "Текущий пароль указан неверно" }, { status: 403 });
    }

    admin.passwordHash = hashPassword(newPassword);
    db.admins[index] = admin;
    await saveDatabaseAsync(db);

    return NextResponse.json({ success: true, message: "Пароль обновлён" });
  } catch (error) {
    console.error("PASSWORD CHANGE ERROR:", error);
    return NextResponse.json({ error: "Ошибка обновления пароля" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("staff_session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}

