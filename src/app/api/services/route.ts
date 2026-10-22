import { NextResponse } from 'next/server';
import { getDatabaseAsync, saveDatabaseAsync } from '@/lib/db';
import { Service } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId');
  const all = searchParams.get('all') === 'true';

  const db = await getDatabaseAsync();
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
    const isDemo = req.headers.get('x-demo-mode') === '1' || new URL(req.url).searchParams.get('demo') === '1';
    const serviceData: Service = await req.json();

    if (isDemo) {
      return NextResponse.json({
        success: true,
        demo: true,
        service: serviceData,
        message: 'Демо-режим: услуга сохранена в песочнице и не влияет на основной сайт'
      });
    }

    const db = await getDatabaseAsync();

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

    await saveDatabaseAsync(db);
    return NextResponse.json({ success: true, service: serviceData, services: db.services });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сохранения услуги' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const isDemo = req.headers.get('x-demo-mode') === '1' || new URL(req.url).searchParams.get('demo') === '1';
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
    }

    if (isDemo) {
      return NextResponse.json({
        success: true,
        demo: true,
        id,
        message: 'Демо-режим: услуга удалена только в вашей сессии'
      });
    }

    const db = await getDatabaseAsync();
    db.services = db.services.filter((s) => s.id !== id);
    await saveDatabaseAsync(db);
    return NextResponse.json({ success: true, services: db.services });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления услуги' }, { status: 500 });
  }
}
