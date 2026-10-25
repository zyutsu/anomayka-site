import { NextResponse } from "next/server";
import { getDatabaseAsync, saveDatabaseAsync } from "@/lib/db";
import { BrandSettings } from "@/lib/types";
import { canManage, isDemoRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDatabaseAsync();
  return NextResponse.json(db.brand);
}

export async function POST(req: Request) {
  try {
    if (!canManage(req)) {
      return NextResponse.json({ error: "Требуется вход в панель" }, { status: 401 });
    }
    if (isDemoRequest(req)) {
      return NextResponse.json({ success: true, demo: true, message: "Демо: изменения не сохраняются" });
    }

    const updated: Partial<BrandSettings> = await req.json();
    const db = await getDatabaseAsync();
    db.brand = { ...db.brand, ...updated };
    await saveDatabaseAsync(db);

    return NextResponse.json({ success: true, brand: db.brand });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка обновления настроек" }, { status: 500 });
  }
}

