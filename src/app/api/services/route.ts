import { NextResponse } from "next/server";
import { getDatabaseAsync, saveDatabaseAsync } from "@/lib/db";
import { Service } from "@/lib/types";
import { canManage, isDemoRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const all = searchParams.get("all") === "true";

  const db = await getDatabaseAsync();
  let services = db.services;

  if (!all) services = services.filter((s) => s.isActive);
  if (categoryId) services = services.filter((s) => s.categoryId === categoryId);

  return NextResponse.json(services);
}

export async function POST(req: Request) {
  try {
    if (!canManage(req)) {
      return NextResponse.json({ error: "Требуется вход в панель" }, { status: 401 });
    }
    if (isDemoRequest(req)) {
      return NextResponse.json({ success: true, demo: true, message: "Демо: изменения не сохраняются" });
    }

    const data: Service = await req.json();
    const db = await getDatabaseAsync();

    const index = db.services.findIndex((s) => s.id === data.id);
    if (index >= 0) {
      db.services[index] = { ...db.services[index], ...data };
    } else {
      db.services.push({
        ...data,
        id: data.id || "srv-" + Date.now(),
        isActive: data.isActive ?? true,
      });
    }

    await saveDatabaseAsync(db);
    return NextResponse.json({ success: true, services: db.services });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сохранения услуги" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!canManage(req)) {
      return NextResponse.json({ error: "Требуется вход в панель" }, { status: 401 });
    }
    if (isDemoRequest(req)) {
      return NextResponse.json({ success: true, demo: true, message: "Демо: изменения не сохраняются" });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Не указан ID услуги" }, { status: 400 });

    const db = await getDatabaseAsync();
    db.services = db.services.filter((s) => s.id !== id);
    await saveDatabaseAsync(db);

    return NextResponse.json({ success: true, services: db.services });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка удаления услуги" }, { status: 500 });
  }
}

