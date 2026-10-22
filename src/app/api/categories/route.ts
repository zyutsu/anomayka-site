import { NextResponse } from 'next/server';
import { getDatabaseAsync, saveDatabaseAsync } from '@/lib/db';
import { Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await getDatabaseAsync();
  return NextResponse.json(db.categories.sort((a, b) => a.order - b.order));
}

export async function POST(req: Request) {
  try {
    const isDemo = req.headers.get('x-demo-mode') === '1' || new URL(req.url).searchParams.get('demo') === '1';
    const categoryData: Category = await req.json();

    if (isDemo) {
      return NextResponse.json({
        success: true,
        demo: true,
        category: categoryData,
        message: 'Демо-режим: изменения изолированы и не затрагивают основной сайт'
      });
    }

    const db = await getDatabaseAsync();

    const existingIndex = db.categories.findIndex((c) => c.id === categoryData.id);
    if (existingIndex >= 0) {
      db.categories[existingIndex] = {
        ...db.categories[existingIndex],
        ...categoryData,
      };
    } else {
      const newCat: Category = {
        ...categoryData,
        id: categoryData.id || `cat-${Date.now()}`,
        order: db.categories.length + 1,
        isActive: categoryData.isActive ?? true,
      };
      db.categories.push(newCat);
    }

    await saveDatabaseAsync(db);
    return NextResponse.json({ success: true, categories: db.categories });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сохранения категории' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const isDemo = req.headers.get('x-demo-mode') === '1' || new URL(req.url).searchParams.get('demo') === '1';
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: 'ID категории обязателен' }, { status: 400 });
    }

    if (isDemo) {
      return NextResponse.json({
        success: true,
        demo: true,
        id,
        message: 'Демо-режим: категория удалена в песочнице и не затрагивает основной сайт'
      });
    }

    const db = await getDatabaseAsync();
    db.categories = db.categories.filter((c) => c.id !== id);
    // Также удаляем связанные услуги, относящиеся к этой категории
    db.services = db.services.filter((s) => s.categoryId !== id);

    await saveDatabaseAsync(db);
    return NextResponse.json({
      success: true,
      categories: db.categories,
      services: db.services,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления категории' }, { status: 500 });
  }
}

