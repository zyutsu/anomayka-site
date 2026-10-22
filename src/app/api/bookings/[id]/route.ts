import { NextResponse } from 'next/server';
import { getDatabaseAsync, saveDatabaseAsync, getAvailableSlots } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDatabaseAsync();
  const booking = db.bookings.find((b) => b.id === id || b.code === id);

  if (!booking) {
    return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 });
  }

  return NextResponse.json(booking);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isDemo = req.headers.get('x-demo-mode') === '1' || new URL(req.url).searchParams.get('demo') === '1';
    const { id } = await params;
    const body = await req.json();
    const effectiveIsDemo = isDemo || Boolean(body.isDemo);

    if (effectiveIsDemo) {
      const updatedBooking = {
        id,
        ...body,
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json({
        success: true,
        demo: true,
        booking: updatedBooking,
        message: 'Статус записи изменен (в демо-режиме)'
      });
    }

    const db = await getDatabaseAsync();

    const bookingIndex = db.bookings.findIndex((b) => b.id === id || b.code === id);
    if (bookingIndex === -1) {
      return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 });
    }

    const currentBooking = db.bookings[bookingIndex];

    // Если меняется дата или время (перенос записи) — проверяем свободен ли новый слот!
    if ((body.date && body.date !== currentBooking.date) || (body.time && body.time !== currentBooking.time)) {
      const targetDate = body.date || currentBooking.date;
      const targetTime = body.time || currentBooking.time;

      // Временно исключаем текущую запись при проверке слотов
      const tempBookings = db.bookings.filter((b) => b.id !== currentBooking.id);
      db.bookings = tempBookings;

      const availableSlots = getAvailableSlots(targetDate, currentBooking.durationMinutes);
      const isSlotFree = availableSlots.some((s) => s.time === targetTime && s.available);

      // Возвращаем базу обратно
      db.bookings.splice(bookingIndex, 0, currentBooking);

      if (!isSlotFree) {
        return NextResponse.json(
          { error: 'Выбранный слот для переноса уже занят' },
          { status: 409 }
        );
      }
    }

    const updatedBooking = {
      ...currentBooking,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    db.bookings[bookingIndex] = updatedBooking;
    await saveDatabaseAsync(db);

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error('Ошибка изменения записи:', error);
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
  }
}
