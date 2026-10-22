import { NextResponse } from 'next/server';
import { getDatabaseAsync, saveDatabaseAsync } from '@/lib/db';
import { ReviewItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDatabaseAsync();
    return NextResponse.json(db.reviews || []);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения отзывов' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { author, car, service, rating, text, bookingId } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Текст отзыва обязателен' }, { status: 400 });
    }

    const isDemo = req.headers.get('x-demo-mode') === '1' || new URL(req.url).searchParams.get('demo') === '1';
    const db = await getDatabaseAsync();
    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: (author || 'Клиент').trim(),
      car: (car || '').trim(),
      service: (service || 'Обслуживание в автоцентре').trim(),
      rating: Math.max(1, Math.min(5, Number(rating) || 5)),
      text: text.trim(),
      date: new Date().toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    };

    if (isDemo) {
      return NextResponse.json({ success: true, demo: true, review: newReview });
    }

    if (!Array.isArray(db.reviews)) {
      db.reviews = [];
    }
    db.reviews = [newReview, ...db.reviews];

    // Если передан ID бронирования — помечаем, что отзыв оставлен
    if (bookingId) {
      const bIndex = db.bookings.findIndex((b) => b.id === bookingId || b.code === bookingId);
      if (bIndex !== -1) {
        db.bookings[bIndex].hasReview = true;
      }
    }

    await saveDatabaseAsync(db);

    return NextResponse.json({ success: true, review: newReview });
  } catch (error) {
    console.error('Ошибка сохранения отзыва:', error);
    return NextResponse.json({ error: 'Не удалось сохранить отзыв' }, { status: 500 });
  }
}
