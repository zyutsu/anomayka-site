import { NextResponse } from 'next/server';
import { getDatabaseAsync, saveDatabaseAsync, getAvailableSlots } from '@/lib/db';
import { Booking } from '@/lib/types';

export const dynamic = 'force-dynamic';

function generateBookingCode(prefix: string = 'AN'): string {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randNum}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get('phone');
  const date = searchParams.get('date');
  const status = searchParams.get('status');

  const db = await getDatabaseAsync();
  let bookings = db.bookings;

  // Фильтрация для клиента по номеру телефона
  if (phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    bookings = bookings.filter((b) => b.clientPhone.replace(/\D/g, '').includes(cleanPhone));
  }

  // Фильтры для админки
  if (date) {
    bookings = bookings.filter((b) => b.date === date);
  }

  if (status && status !== 'all') {
    bookings = bookings.filter((b) => b.status === status);
  }

  // Сортировка по дате и времени
  bookings.sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.time || '00:00'}:00`).getTime();
    const timeB = new Date(`${b.date}T${b.time || '00:00'}:00`).getTime();
    return timeB - timeA;
  });

  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  try {
    const isDemo = req.headers.get('x-demo-mode') === '1' || new URL(req.url).searchParams.get('demo') === '1';
    const body = await req.json();
    const effectiveIsDemo = isDemo || Boolean(body.isDemo);
    const db = await getDatabaseAsync();

    // Сценарий 1: Заказ обратного звонка / Сложный случай
    if (body.isCallRequest) {
      const { clientName, clientPhone, carModel, comment, serviceTitle } = body;

      if (!clientName || !clientPhone) {
        return NextResponse.json(
          { error: 'Укажите ваше имя и номер телефона' },
          { status: 400 }
        );
      }

      const today = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

      const newCallBooking: Booking = {
        id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        code: generateBookingCode('CALL'),
        serviceId: body.serviceId || 'srv-call',
        serviceTitle: serviceTitle || 'Консультация мастера (Сложный случай)',
        categoryTitle: 'Обратный звонок',
        price: 0,
        durationMinutes: 15,
        date: today,
        time: nowTime,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        carModel: carModel ? carModel.trim() : '',
        comment: comment ? `Сложный случай / запрос звонка: ${comment.trim()}` : 'Запрос звонка мастера с сайта',
        status: 'call_requested',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (effectiveIsDemo) {
        return NextResponse.json({
          success: true,
          demo: true,
          booking: newCallBooking,
          message: 'Заявка на звонок принята (в демо-режиме)! Мастер свяжется с вами в течение 5 минут.',
        });
      }

      db.bookings.push(newCallBooking);
      await saveDatabaseAsync(db);

      return NextResponse.json({
        success: true,
        booking: newCallBooking,
        message: 'Заявка на звонок принята! Мастер свяжется с вами в течение 5 минут.',
      });
    }

    // Сценарий 2: Обычная онлайн-запись на фиксированный слот
    const { serviceId, date, time, clientName, clientPhone, carModel, comment } = body;

    if (!serviceId || !date || !time || !clientName || !clientPhone) {
      return NextResponse.json(
        { error: 'Пожалуйста, заполните все обязательные поля' },
        { status: 400 }
      );
    }

    const service = db.services.find((s) => s.id === serviceId);
    if (!service) {
      return NextResponse.json({ error: 'Услуга не найдена' }, { status: 404 });
    }

    const category = db.categories.find((c) => c.id === service.categoryId);

    // Проверка накладок слотов
    const availableSlots = getAvailableSlots(date, service.durationMinutes);
    const targetSlot = availableSlots.find((s) => s.time === time);

    if (!targetSlot || !targetSlot.available) {
      return NextResponse.json(
        {
          error: 'К сожалению, выбранное время уже занято или недоступно. Пожалуйста, выберите другой слот.',
        },
        { status: 409 }
      );
    }

    const newBooking: Booking = {
      id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      code: generateBookingCode('AN'),
      serviceId: service.id,
      serviceTitle: service.title,
      categoryTitle: category?.title || 'Общие услуги',
      price: service.price,
      durationMinutes: service.durationMinutes,
      date,
      time,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      carModel: carModel ? carModel.trim() : '',
      comment: comment ? comment.trim() : '',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (effectiveIsDemo) {
      return NextResponse.json({
        success: true,
        demo: true,
        booking: newBooking,
        message: 'Запись успешно создана и подтверждена (в демо-режиме)!',
      });
    }

    db.bookings.push(newBooking);
    await saveDatabaseAsync(db);

    return NextResponse.json({
      success: true,
      booking: newBooking,
      message: 'Запись успешно создана и подтверждена!',
    });
  } catch (error) {
    console.error('Ошибка создания бронирования:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка при создании записи' },
      { status: 500 }
    );
  }
}
