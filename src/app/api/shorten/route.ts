import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase, saveDatabaseAsync } from '@/lib/db';
import { ShortDemoLink } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { slug, url, name } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'Не указан целевой URL' }, { status: 400 });
    }

    const cleanSlug = (slug || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `demo-${Math.random().toString(36).substring(2, 8)}`;

    const db = getDatabase();
    if (!db.shortLinks) {
      db.shortLinks = [];
    }

    const existingIndex = db.shortLinks.findIndex((l) => l.slug.toLowerCase() === cleanSlug);
    const linkItem: ShortDemoLink = {
      slug: cleanSlug,
      url,
      name: name || 'Демо-презентация',
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      db.shortLinks[existingIndex] = linkItem;
    } else {
      db.shortLinks.unshift(linkItem);
      if (db.shortLinks.length > 150) {
        db.shortLinks = db.shortLinks.slice(0, 150);
      }
    }

    // Мгновенное сохранение в локальную память и /tmp
    saveDatabase(db);

    // Асинхронная выгрузка в облачный Blob без задержки ответа клиенту
    saveDatabaseAsync(db).catch((err) => console.error('Background blob save error:', err));

    return NextResponse.json({
      success: true,
      slug: cleanSlug,
      shortUrl: `/d/${cleanSlug}`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Ошибка сохранения короткой ссылки' }, { status: 500 });
  }
}
