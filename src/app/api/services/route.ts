import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { Service } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId');
  const all = searchParams.get('all') === 'true';

  const db = getDatabase();
  let services = db.services;

  if (!all) {
    services = services.filter((s) => s.isActive);
  }

  if (categoryId) {
    services = services.filter((s) => s.categoryId === categoryId);
  }

  return NextResponse.json(services);
}

export async function POST(req: Request) {
  try {
    const serviceData: Service = await req.json();
    const db = getDatabase();

    const existingIndex = db.services.findIndex((s) => s.id === serviceData.id);
    if (existingIndex >= 0) {
      db.services[existingIndex] = {
        ...db.services[existingIndex],
        ...serviceData,
      };
    } else {
      const newService: Service = {
        ...serviceData,
        id: serviceData.id || `srv-${Date.now()}`,
        isActive: serviceData.isActive ?? true,
      };
      db.services.push(newService);
    }

    saveDatabase(db);
    return NextResponse.json({ success: true, service: serviceData });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сохранения услуги' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
    }

    const db = getDatabase();
    db.services = db.services.filter((s) => s.id !== id);
    saveDatabase(db);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления услуги' }, { status: 500 });
  }
}
