import { NextResponse } from "next/server";
import { getDatabaseAsync, saveDatabaseAsync, calculateAvailableSlots } from "@/lib/db";
import { getStaffSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function isDemo(req: Request, body?: any): boolean {
  return (
    req.headers.get("x-demo-mode") === "1" ||
    new URL(req.url).searchParams.get("demo") === "1" ||
    Boolean(body?.isDemo)
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDatabaseAsync();
  const booking = db.bookings.find((b) => b.id === id || b.code === id);

  if (!booking) return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });

  // Демо-заголовок не даёт доступа к реальным записям клиентов.
  const session = getStaffSession(req);
  const isStaff = Boolean(session && !session.demo);
  const isDemoRecord = String(booking.id).startsWith("demo-");
  if (!isStaff && !(isDemoRecord && isDemo(req)) && !matchesPhone(req, booking.clientPhone)) {
    return NextResponse.json({ error: "Нужен номер телефона записи" }, { status: 403 });
  }
  return NextResponse.json(booking);
}

function matchesPhone(req: Request, stored: string): boolean {
  const phone = new URL(req.url).searchParams.get("phone") || "";
  const clean = phone.replace(/\D/g, "");
  return clean.length >= 10 && clean === String(stored || "").replace(/\D/g, "");
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const demo = isDemo(req, body);

    const db = await getDatabaseAsync();
    const index = db.bookings.findIndex((b) => b.id === id || b.code === id);
    if (index === -1) {
      return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
    }

    const current = db.bookings[index];
    const clientPhone = String(body.phone || "").replace(/\D/g, "");
    // В демо-режиме разрешаем менять только тестовые записи, созданные в песочнице.
    const demoEdit = demo && String(current.id).startsWith("demo-");
    if (demo && !demoEdit) {
      return NextResponse.json({ error: "В демо доступны только тестовые записи" }, { status: 403 });
    }

    if (demoEdit) {
      return NextResponse.json({
        success: true,
        demo: true,
        booking: { ...current, ...body, updatedAt: new Date().toISOString() },
      });
    }

    const session = getStaffSession(req);
    const isStaff = Boolean(session && !session.demo);
    if (!isStaff && (clientPhone.length < 10 || clientPhone !== current.clientPhone.replace(/\D/g, ""))) {
      return NextResponse.json({ error: "Нет доступа к этой записи" }, { status: 403 });
    }
    const targetDate = body.date || current.date;
    const targetTime = body.time || current.time;
    const moving = targetDate !== current.date || targetTime !== current.time;

    if (moving) {
      const others = db.bookings.filter((b) => b.id !== current.id);
      const slots = calculateAvailableSlots({ ...db, bookings: others }, targetDate, current.durationMinutes);
      const slot = slots.find((s) => s.time === targetTime);
      if (!slot || !slot.available) {
        return NextResponse.json({ error: "Это время уже занято" }, { status: 409 });
      }
    }

    const allowed = ["status", "date", "time", "notes", "comment", "carModel", "clientName", "clientPhone"];
    const patch: Record<string, any> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) patch[key] = body[key];
    }

    db.bookings[index] = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    await saveDatabaseAsync(db);
    return NextResponse.json({ success: true, booking: db.bookings[index] });
  } catch (error) {
    console.error("BOOKING PATCH ERROR:", error);
    return NextResponse.json({ error: "Не удалось обновить запись" }, { status: 500 });
  }
}

