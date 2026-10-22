import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { BrandSettings } from '@/lib/types';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json(db.brand);
}

export async function POST(req: Request) {
  try {
    const updatedBrand: Partial<BrandSettings> = await req.json();
    const db = getDatabase();
    db.brand = {
      ...db.brand,
      ...updatedBrand,
    };
    saveDatabase(db);
    return NextResponse.json({ success: true, brand: db.brand });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления бренда' }, { status: 500 });
  }
}
