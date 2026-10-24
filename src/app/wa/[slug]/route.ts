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

    const reqUrl = new URL(req.url);
    const isApp = reqUrl.searchParams.get('app') === '1';

    const shortUrl = `https://vibe-rho-bay.vercel.app/d/${cleanSlug}`;
    const targetName = name.toLowerCase() !== 'автосервис' && name.toLowerCase() !== 'сто' ? `«${name}»` : (city ? `в г. ${city}` : '');
    
    // Полный подробный текст со всеми правками и примечанием про VPN
    const pitchText = `Здравствуйте!\n\nОбратил внимание на ваш автосервис ${targetName}. Решил не писать длинных предложений, а сразу показать на деле — собрал для вас готовый рабочий сайт с онлайн-записью клиентов, каталогом услуг и точкой на Яндекс.Картах:\n\n👉 ${shortUrl}\n\nСайт полностью адаптирован под смартфоны: клиенты могут в пару кликов выбрать услугу, узнать стоимость и записаться на конкретное время без лишних звонков мастеру.\n\nЕстественно, это демонстрационный образец — мы можем внести абсолютно любые правки под вас: скорректировать цены и список услуг, поменять дизайн, цвета, поставить ваш реальный логотип и добавить фото боксов.\n\nВзгляните с телефона пару минут. Если идея понравится — всё доработаем и запустим буквально за 1 день. Как вам такой концепт?\n\n(P.S. Если ссылка сразу не откроется — включите, пожалуйста, VPN, тестовый сервер пока зарубежный 🤝)`;

    const targetUrl = isApp
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(pitchText)}`
      : `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(pitchText)}`;

    // Моментальный редирект в WhatsApp с полным сообщением
    return NextResponse.redirect(targetUrl, 307);
  } catch (err) {
    return NextResponse.redirect(new URL('/', req.url), 307);
  }
}
