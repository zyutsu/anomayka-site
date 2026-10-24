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

    let db = getDatabase();
    let found = db.shortLinks?.find((l) => l.slug.toLowerCase() === cleanSlug);

    if (!found) {
      try {
        const asyncDb = await Promise.race([
          getDatabaseAsync(),
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1200)),
        ]);
        found = asyncDb?.shortLinks?.find((l: any) => l.slug.toLowerCase() === cleanSlug);
      } catch (e) {}
    }

    let phone = '';
    let name = 'Автосервис';
    let city = '';

    if (found?.url) {
      try {
        const urlObj = new URL(found.url, 'http://localhost:3000');
        phone = urlObj.searchParams.get('phone') || '';
        name = urlObj.searchParams.get('name') || name;
        city = urlObj.searchParams.get('city') || '';
      } catch (e) {}
    }

    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('8') && cleanPhone.length === 11) {
      cleanPhone = '7' + cleanPhone.slice(1);
    }

    const shortUrl = `https://vibe-rho-bay.vercel.app/d/${cleanSlug}`;
    const targetName = name.toLowerCase() !== 'автосервис' && name.toLowerCase() !== 'сто' ? `«${name}»` : (city ? `в г. ${city}` : '');
    const pitchText = `Здравствуйте! Увидел ваш автосервис ${targetName}. Собрал для вас готовый сайт с онлайн-записью и каталогом услуг:\n\n👉 ${shortUrl}\n\nПосмотрите с телефона, как вам? Мы можем внести любые правки под вас (ваши точные цены, услуги, фото и дизайн).`;

    const waWebUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(pitchText)}`;

    // Моментальный редирект в WhatsApp Web
    return NextResponse.redirect(waWebUrl, 307);
  } catch (err) {
    return NextResponse.redirect(new URL('/', req.url), 307);
  }
}
