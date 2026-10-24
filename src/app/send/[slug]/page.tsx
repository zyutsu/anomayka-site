import React from 'react';
import Link from 'next/link';
import { getDatabase, getDatabaseAsync } from '@/lib/db';
import SendHubClient from './SendHubClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default async function SendHubPage(props: PageProps) {
  const resolvedParams = await Promise.resolve(props.params);
  const rawSlug = resolvedParams?.slug || '';
  const cleanSlug = decodeURIComponent(rawSlug).toLowerCase().trim();

  // 1. Поиск в базе данных
  let db = getDatabase();
  let found = db.shortLinks?.find((l) => l.slug.toLowerCase() === cleanSlug);

  if (!found) {
    try {
      const asyncDb = await Promise.race([
        getDatabaseAsync(),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
      ]);
      found = asyncDb?.shortLinks?.find((l: any) => l.slug.toLowerCase() === cleanSlug);
    } catch (e) {}
  }

  // 2. Распаковка параметров из ссылки или stateless
  let name = 'Автосервис';
  let city = '';
  let phone = '';
  let address = '';
  let logo = '';

  if (found?.url) {
    try {
      const urlObj = new URL(found.url, 'http://localhost:3000');
      name = urlObj.searchParams.get('name') || name;
      city = urlObj.searchParams.get('city') || '';
      phone = urlObj.searchParams.get('phone') || '';
      address = urlObj.searchParams.get('address') || '';
      logo = urlObj.searchParams.get('logo') || '';
    } catch (e) {}
  } else {
    // Восстановление из слага
    name = cleanSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  // Очистка телефона
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('8') && cleanPhone.length === 11) {
    cleanPhone = '7' + cleanPhone.slice(1);
  }

  const shortUrl = `https://vibe-rho-bay.vercel.app/d/${cleanSlug}`;

  // Текст сообщения для рассылки (оптимизирован для WhatsApp и Telegram)
  const targetName = name.toLowerCase() !== 'автосервис' && name.toLowerCase() !== 'сто' ? `«${name}»` : (city ? `в г. ${city}` : '');
  
  const safePitch = `Здравствуйте! Увидел ваш автосервис ${targetName}. Собрал для вас готовый сайт с онлайн-записью клиентов и каталогом услуг:\n\n👉 ${shortUrl}\n\nПосмотрите с телефона, как вам такой формат? Мы можем внести любые правки под вас (ваши точные цены, услуги, фото и дизайн).`;

  const fullPitch = `Здравствуйте!\n\nОбратил внимание на ваш автосервис ${targetName}. Решил не писать длинных предложений, а сразу показать на деле — собрал для вас готовый рабочий сайт с онлайн-записью клиентов, каталогом услуг и точкой на Яндекс.Картах:\n\n👉 ${shortUrl}\n\nСайт полностью адаптирован под смартфоны: клиенты могут в пару кликов выбрать услугу, узнать стоимость и записаться на конкретное время без лишних звонков мастеру.\n\nЕстественно, это демонстрационный образец — мы можем внести абсолютно любые правки под вас: скорректировать цены и список услуг, поменять дизайн, цвета, поставить ваш реальный логотип и добавить фото боксов.\n\nВзгляните с телефона пару минут. Если идея понравится — всё доработаем и запустим под ваш автосервис буквально за 1 день. Как вам такой концепт?\n\n(P.S. Если ссылка сразу не откроется — включите, пожалуйста, VPN, тестовый сервер пока зарубежный 🤝)`;

  return (
    <SendHubClient
      slug={cleanSlug}
      name={name}
      city={city}
      phone={phone}
      cleanPhone={cleanPhone}
      address={address}
      logo={logo}
      shortUrl={shortUrl}
      safePitch={safePitch}
      fullPitch={fullPitch}
    />
  );
}
