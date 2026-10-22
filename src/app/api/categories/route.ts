import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/db';
import { Category } from '@/lib/types';

export async function GET() {
  const db = getDatabase();
  return NextResponse.json(db.categories.sort((a, b) => a.order - b.order));
}

export async function POST(req: Request) {
  try {
    const categoryData: Category = await req.json();
    const db = getDatabase();

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

    saveDatabase(db);
    return NextResponse.json({ success: true, categories: db.categories });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сохранения категории' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: 'ID категории обязателен' }, { status: 400 });
    }

    const db = getDatabase();
    db.categories = db.categories.filter((c) => c.id !== id);
    // Также удаляем связанные услуги, относящиеся к этой категории
    db.services = db.services.filter((s) => s.categoryId !== id);

    saveDatabase(db);
    return NextResponse.json({
      success: true,
      categories: db.categories,
      services: db.services,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления категории' }, { status: 500 });
  }
}

