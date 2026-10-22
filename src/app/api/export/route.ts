import { NextResponse } from 'next/server';
import { exportBookingsToCSV } from '@/lib/db';

export async function GET() {
  try {
    const csvData = exportBookingsToCSV();
    const filename = `anomayka-bookings-${new Date().toISOString().split('T')[0]}.csv`;

    return new Response(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка экспорта CSV' }, { status: 500 });
  }
}
