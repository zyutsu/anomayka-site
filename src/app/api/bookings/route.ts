import { NextResponse } from "next/server";
import { getDatabaseAsync, saveDatabaseAsync, calculateAvailableSlots } from "@/lib/db";
import { Booking } from "@/lib/types";
import { shopNow } from "@/lib/time";
import { getStaffSession, isDemoRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

function bookingCode(prefix = "AN"): string {
  return prefix + "-" + Math.floor(1000 + Math.random() * 9000);
}

function isDemo(req: Request, body?: any): boolean {
  return (
    req.headers.get("x-demo-mode") === "1" ||
    new URL(req.url).searchParams.get("demo") === "1" ||
    Boolean(body?.isDemo)
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");
  const date = searchParams.get("date");
  const status = searchParams.get("status");

  // В демо-песочнице журнал реальных клиентов не отдаём никогда.
  if (isDemoRequest(req)) {
    return NextResponse.json([]);
  }

  // Полный журнал записей доступен только после входа в панель.
  // Демо-заголовок не считается авторизацией — иначе журнал клиентов
  // мог бы прочитать любой посетитель.
  const session = getStaffSession(req);
  if (!phone && (!session || session.demo)) {
    return NextResponse.json({ error: "Требуется вход в панель" }, { status: 401 });
  }

  const db = await getDatabaseAsync();
  let bookings = [...db.bookings];

  // Клиент видит только свои записи по полному совпадению номера.
  if (phone) {
    const clean = phone.replace(/\D/g, "");
    if (clean.length < 10) {
      return NextResponse.json({ error: "Укажите полный номер телефона" }, { status: 400 });
    }
    bookings = bookings.filter((b) => b.clientPhone.replace(/\D/g, "") === clean);
  }

  if (date) bookings = bookings.filter((b) => b.date === date);
  if (status && status !== "all") bookings = bookings.filter((b) => b.status === status);

  bookings.sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));

  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const demo = isDemo(req, body) && isDemoRequest(req);
    const db = await getDatabaseAsync();

    if (body.isCallRequest) {
      const { clientName, clientPhone, carModel, comment, serviceTitle } = body;
      if (!String(clientName || "").trim() || String(clientPhone || "").replace(/\D/g, "").length < 10) {
        return NextResponse.json({ error: "Укажите имя и корректный телефон" }, { status: 400 });
      }

      const now = shopNow();
      const request: Booking = {
        id: "call-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
        code: bookingCode("CALL"),
        serviceId: body.serviceId || "srv-call",
        serviceTitle: serviceTitle || "Консультация мастера",
        categoryTitle: "Обратный звонок",
        price: 0,
        durationMinutes: 15,
        date: now.date,
        time: now.time,
        clientName: String(clientName).trim().slice(0, 80),
        clientPhone: String(clientPhone).trim().slice(0, 30),
        carModel: String(carModel || "").trim().slice(0, 120),
        comment: comment ? String(comment).trim().slice(0, 800) : "Запрос звонка мастера",
        status: "call_requested",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!demo) {
        db.bookings.push(request);
        await saveDatabaseAsync(db);
      }

      return NextResponse.json({
        success: true,
        demo,
        booking: request,
        message: "Заявка принята. Мастер свяжется с вами в рабочее время.",
      });
    }

    const { serviceId, date, time, clientName, clientPhone, carModel, comment } = body;

    if (!serviceId || !date || !time) {
      return NextResponse.json({ error: "Выберите услугу, дату и время" }, { status: 400 });
    }
    if (!String(clientName || "").trim()) {
      return NextResponse.json({ error: "Укажите имя" }, { status: 400 });
    }
    if (String(clientPhone || "").replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Укажите корректный номер телефона" }, { status: 400 });
    }

    const service = db.services.find((s) => s.id === serviceId && s.isActive);
    if (!service) {
      return NextResponse.json({ error: "Услуга недоступна" }, { status: 404 });
    }

    const slots = calculateAvailableSlots(db, date, service.durationMinutes);
    const slot = slots.find((s) => s.time === time);
    if (!slot || !slot.available) {
      return NextResponse.json(
        { error: "Это время уже занято. Выберите другой слот." },
        { status: 409 }
      );
    }

    const category = db.categories.find((c) => c.id === service.categoryId);
    const booking: Booking = {
      id: (demo ? "demo-" : "book-") + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      code: bookingCode("AN"),
      serviceId: service.id,
      serviceTitle: service.title,
      categoryTitle: category?.title || "Услуги",
      price: service.price,
      durationMinutes: service.durationMinutes,
      date,
      time,
      clientName: String(clientName).trim().slice(0, 80),
      clientPhone: String(clientPhone).trim().slice(0, 30),
      carModel: String(carModel || "").trim().slice(0, 120),
      comment: String(comment || "").trim().slice(0, 800),
      status: "confirmed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!demo) {
      db.bookings.push(booking);
      await saveDatabaseAsync(db);
    }

    return NextResponse.json({
      success: true,
      demo,
      booking,
      message: "Запись подтверждена",
    });
  } catch (error) {
    console.error("BOOKING ERROR:", error);
    return NextResponse.json({ error: "Не удалось создать запись" }, { status: 500 });
  }
}

