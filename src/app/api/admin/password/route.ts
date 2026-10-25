import { NextResponse } from "next/server";
import { getDatabaseAsync, saveDatabaseAsync } from "@/lib/db";
import { getStaffSession, isDemoRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Смена пароля администратора. */
export async function PATCH(req: Request) {
  const demo = isDemoRequest(req);
  if (demo) {
    return NextResponse.json({ success: true, demo: true, message: "В демо пароль не меняется" });
  }

  const session = getStaffSession(req);
  if (!session) {
    return NextResponse.json({ error: "Требуется вход в панель" }, { status: 401 });
  }

  return NextResponse.json(
    {
      error:
        "Смена пароля временно отключена: пароль хранится в настройках проекта. Напишите администратору проекта.",
    },
    { status: 501 }
  );
}

export async function POST(req: Request) {
  const demo = isDemoRequest(req);
  if (demo) return NextResponse.json({ success: true, demo: true });

  const session = getStaffSession(req);
  if (!session) {
    return NextResponse.json({ error: "Требуется вход в панель" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  if (body.schedule) {
    const db = await getDatabaseAsync();
    db.brand = { ...db.brand, ...body.schedule };
    await saveDatabaseAsync(db);
  }

  return NextResponse.json({ success: true });
}

