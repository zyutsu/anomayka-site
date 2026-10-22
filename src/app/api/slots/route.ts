import { NextResponse } from 'next/server';
import { getAvailableSlotsAsync } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const durationStr = searchParams.get('duration');
  const duration = durationStr ? parseInt(durationStr, 10) : 30;

  if (!date) {
    return NextResponse.json({ error: 'Параметр date обязателен' }, { status: 400 });
  }

  try {
    const slots = await getAvailableSlotsAsync(date, duration);
    return NextResponse.json({ date, duration, slots });
  } catch (error) {
    console.error('Ошибка расчета свободных слотов:', error);
    return NextResponse.json({ error: 'Ошибка расчета слотов' }, { status: 500 });
  }
}
