import { NextResponse } from 'next/server';
import { getDatabaseAsync, saveDatabaseAsync } from '@/lib/db';
import { BrandSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await getDatabaseAsync();
  return NextResponse.json(db.brand);
}

export async function POST(req: Request) {
  try {
    const updatedBrand: Partial<BrandSettings> = await req.json();
    const db = await getDatabaseAsync();
    db.brand = {
      ...db.brand,
      ...updatedBrand,
    };
    await saveDatabaseAsync(db);
    return NextResponse.json({ success: true, brand: db.brand });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления бренда' }, { status: 500 });
  }
}
