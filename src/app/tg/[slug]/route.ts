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

    const tgProtocolUrl = cleanPhone 
      ? `tg://resolve?phone=${cleanPhone}&text=${encodeURIComponent(pitchText)}`
      : `https://t.me/share/url?url=${encodeURIComponent(shortUrl)}&text=${encodeURIComponent(pitchText)}`;

    // Отдаем HTML-шлюз с моментальным переходом прямо в чат Telegram без пересыла
    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Открытие чата Telegram — ${name}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 24px; padding: 32px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    h1 { font-size: 20px; margin-bottom: 8px; color: #fff; }
    p { font-size: 14px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }
    .btn { display: block; width: 100%; padding: 14px; border-radius: 14px; font-weight: bold; text-decoration: none; margin-bottom: 12px; font-size: 15px; box-sizing: border-box; cursor: pointer; border: none; }
    .btn-tg { background: #0284c7; color: #fff; }
    .btn-tg:hover { background: #0369a1; }
    .badge { display: inline-block; padding: 6px 14px; background: rgba(16, 185, 129, 0.15); color: #34d399; border-radius: 999px; font-size: 12px; font-weight: bold; margin-bottom: 16px; border: 1px solid rgba(16, 185, 129, 0.3); }
    .msg-preview { background: #0b1120; border: 1px solid #1e293b; border-radius: 12px; padding: 12px; font-size: 12px; color: #cbd5e1; text-align: left; white-space: pre-wrap; margin-bottom: 20px; max-height: 140px; overflow-y: auto; }
  </style>
</head>
<body>
  <div class="card">
    <div id="copyBadge" class="badge">Текст сообщения готов</div>
    <h1>${name}</h1>
    <p>Открываем диалог в Telegram. Текст сообщения уже подставлен, а также скопирован в буфер (Ctrl+V) на случай блокировок браузера!</p>
    
    <div class="msg-preview">${pitchText}</div>

    <a href="${tgProtocolUrl}" class="btn btn-tg" id="tgBtn">👉 Открыть чат в Telegram</a>
  </div>

  <script>
    const textToCopy = ${JSON.stringify(pitchText)};
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }
    // Моментальный автопереход прямо в чат Telegram
    window.location.href = ${JSON.stringify(tgProtocolUrl)};
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err) {
    return NextResponse.redirect(new URL('/', req.url), 307);
  }
}
