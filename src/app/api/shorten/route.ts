import { NextResponse } from 'next/server';
import { getDatabase, getDatabaseAsync, saveDatabase, saveDatabaseAsync } from '@/lib/db';
import { ShortDemoLink } from '@/lib/types';
import { canManage, isDemoRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!canManage(req) || isDemoRequest(req)) {
      return NextResponse.json({ error: 'Требуется вход в панель' }, { status: 401 });
    }
    const body = await req.json();

    // Пакетное сохранение массива ссылок (batch)
    if (Array.isArray(body.links)) {
      const db = await getDatabaseAsync();
      if (!db.shortLinks) {
        db.shortLinks = [];
      }

      for (const item of body.links) {
        if (!item.slug || !item.url) continue;
        const cleanSlug = item.slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');
        const existingIndex = db.shortLinks.findIndex((l) => l.slug.toLowerCase() === cleanSlug);
        const linkItem: ShortDemoLink = {
          slug: cleanSlug,
          url: item.url,
          name: item.name || 'Демо-презентация',
          createdAt: new Date().toISOString(),
        };

        if (existingIndex >= 0) {
          db.shortLinks[existingIndex] = linkItem;
        } else {
          db.shortLinks.push(linkItem);
        }
      }

      saveDatabase(db);
      await saveDatabaseAsync(db);

      return NextResponse.json({
        success: true,
        count: body.links.length,
        total: db.shortLinks.length,
      });
    }

    // Одиночное сохранение
    const { slug, url, name } = body;

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
      if (db.shortLinks.length > 1000) {
        db.shortLinks = db.shortLinks.slice(0, 1000);
      }
    }

    saveDatabase(db);
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
