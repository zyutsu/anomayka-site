import { NextResponse } from "next/server";
import { getDatabaseAsync, saveDatabaseAsync } from "@/lib/db";
import { Category } from "@/lib/types";
import { canManage, isDemoRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDatabaseAsync();
  return NextResponse.json([...db.categories].sort((a, b) => a.order - b.order));
}

export async function POST(req: Request) {
  try {
    if (!canManage(req)) {
      return NextResponse.json({ error: "Требуется вход в панель" }, { status: 401 });
    }
    if (isDemoRequest(req)) {
      return NextResponse.json({ success: true, demo: true, message: "Демо: изменения не сохраняются" });
    }

    const data: Category = await req.json();
    const db = await getDatabaseAsync();

    const index = db.categories.findIndex((c) => c.id === data.id);
    if (index >= 0) {
      db.categories[index] = { ...db.categories[index], ...data };
    } else {
      db.categories.push({
        ...data,
        id: data.id || "cat-" + Date.now(),
        order: db.categories.length + 1,
        isActive: data.isActive ?? true,
      });
    }

    await saveDatabaseAsync(db);
    return NextResponse.json({ success: true, categories: db.categories });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сохранения категории" }, { status: 500 });
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
    let id = searchParams.get("id");
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }
    if (!id) {
      return NextResponse.json({ error: "Не указан ID категории" }, { status: 400 });
    }

    const db = await getDatabaseAsync();
    db.categories = db.categories.filter((c) => c.id !== id);
    db.services = db.services.filter((s) => s.categoryId !== id);
    await saveDatabaseAsync(db);

    return NextResponse.json({ success: true, categories: db.categories, services: db.services });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка удаления категории" }, { status: 500 });
  }
}

