import { NextResponse } from 'next/server';
import { exportBookingsToCSV, getDatabaseAsync } from '@/lib/db';
import { getStaffSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Журнал заявок содержит телефоны клиентов — только для сотрудников.
    const session = getStaffSession(req);
    if (!session || session.demo) {
      return NextResponse.json({ error: 'Требуется вход в панель' }, { status: 401 });
    }

    const db = await getDatabaseAsync();
    const csvData = exportBookingsToCSV(db);
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
