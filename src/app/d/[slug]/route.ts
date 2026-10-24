import { NextResponse } from 'next/server';
import { getDatabaseAsync } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  props: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(props.params);
    const rawSlug = resolvedParams?.slug || '';
    const cleanSlug = decodeURIComponent(rawSlug).toLowerCase().trim();

    const db = await getDatabaseAsync();
    const found = db.shortLinks?.find((l) => l.slug.toLowerCase() === cleanSlug);

    if (found && found.url) {
      const targetUrl = found.url.startsWith('http')
        ? found.url
        : new URL(found.url, req.url).toString();
      return NextResponse.redirect(targetUrl, 307);
    }

    // Если slug — это base64url закодированный JSON полезной нагрузки (stateless сжатая ссылка)
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

    // Если ссылка не найдена — перенаправляем на главную
    return NextResponse.redirect(new URL('/', req.url), 307);
  } catch (err) {
    console.error('Short link redirect error:', err);
    return NextResponse.redirect(new URL('/', req.url), 307);
  }
}
