import { NextResponse } from 'next/server';
import { getDatabase, getDatabaseAsync } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: Request,
  props: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(props.params);
    const rawSlug = resolvedParams?.slug || '';
    const cleanSlug = decodeURIComponent(rawSlug).toLowerCase().trim();

    const reqUrl = new URL(req.url);
    const searchParams = reqUrl.searchParams;

    // 1. Если в самом запросе к /d/[slug] уже переданы query-параметры (например /d/slug?name=...)
    // Мгновенно отдаем редирект без ожидания баз данных
    if (searchParams.has('name') || searchParams.has('demo') || searchParams.has('d') || searchParams.has('n')) {
      const targetParams = new URLSearchParams(searchParams);
      targetParams.set('demo', '1');
      return NextResponse.redirect(new URL(`/?${targetParams.toString()}`, req.url), 307);
    }

    // 2. Проверяем, является ли slug base64url закодированным JSON (stateless компактная ссылка)
    // Работает МГНОВЕННО (0 мс) без единого запроса к сети
    try {
      let b64 = cleanSlug.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      const decoded = Buffer.from(b64, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      if (parsed && typeof parsed === 'object') {
        const urlParams = new URLSearchParams();
        urlParams.set('demo', '1');
        if (parsed.n) urlParams.set('name', parsed.n);
        if (parsed.p) urlParams.set('phone', parsed.p);
        if (parsed.c) urlParams.set('city', parsed.c);
        if (parsed.a) urlParams.set('address', parsed.a);
        if (parsed.clr) urlParams.set('color', parsed.clr);
        if (parsed.l) urlParams.set('logo', parsed.l);
        if (parsed.m) urlParams.set('map', parsed.m);
        if (parsed.s) urlParams.set('slogan', parsed.s);
        if (parsed.t) urlParams.set('type', parsed.t);
        if (parsed.cats) {
          urlParams.set('cats', Array.isArray(parsed.cats) ? parsed.cats.join(',') : parsed.cats);
        }
        return NextResponse.redirect(new URL(`/?${urlParams.toString()}`, req.url), 307);
      }
    } catch (e) {}

    // 3. Мгновенная проверка локального кэша базы данных (0 мс)
    const localDb = getDatabase();
    let found = localDb.shortLinks?.find((l) => l.slug.toLowerCase() === cleanSlug);

    // 4. Если в локальной памяти нет — быстрый поиск с жестким таймаутом 1.2 сек
    if (!found) {
      try {
        const asyncDb = await Promise.race([
          getDatabaseAsync(),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1200)),
        ]);
        found = asyncDb?.shortLinks?.find((l: any) => l.slug.toLowerCase() === cleanSlug);
      } catch (e) {}
    }

    if (found && found.url) {
      const targetUrl = found.url.startsWith('http')
        ? found.url
        : new URL(found.url, req.url).toString();
      return NextResponse.redirect(targetUrl, 307);
    }

    // 5. Умный fallback: если ссылки нет в базе — восстанавливаем название из слага
    // и открываем полноценный демо-режим, а не пустую главную страницу!
    const fallbackName = cleanSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return NextResponse.redirect(
      new URL(`/?demo=1&name=${encodeURIComponent(fallbackName || 'Автосервис')}`, req.url),
      307
    );
  } catch (err) {
    console.error('Short link redirect error:', err);
    return NextResponse.redirect(new URL('/?demo=1', req.url), 307);
  }
}
