import fs from 'fs';
import path from 'path';
import { DatabaseSchema, BrandSettings, Category, Service, Booking, BlockedSlot, FAQItem, ReviewItem } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Начальные данные по умолчанию (бренд ANOMAYKA)
const DEFAULT_BRAND: BrandSettings = {
  name: 'ANOMAYKA',
  slogan: 'Премиальный автотехцентр, детейлинг и сервисное обслуживание',
  city: 'Москва',
  phone: '+7 (999) 000-24-24',
  phoneRaw: '79990002424',
  address: 'г. Москва, Ленинградский пр-т, д. 39, стр. 1',
  workHours: 'Ежедневно с 09:00 до 21:00',
  openTime: '09:00',
  closeTime: '21:00',
  slotDurationMinutes: 30,
  workDays: [1, 2, 3, 4, 5, 6, 0],
  logoUrl: '/logo.jpg',
  primaryColor: '#090a0f',
  accentColor: '#e11d48',
  secondaryColor: '#171a24',
  telegramUrl: 'https://t.me/anomayka_auto',
  whatsappUrl: 'https://wa.me/79990002424',
  vkUrl: 'https://vk.com/anomayka',
  heroHeadline: 'Онлайн-запись в автоцентр без звонков и ожидания',
  heroSubheadline: 'Выберите услугу, удобное время за 2 минуты — гарантированная бронь без очередей и накладок.',
  features: [
    { title: 'Запись 24/7', desc: 'Никаких гудков и автоответчиков — бронируйте в любое время суток', icon: 'Clock' },
    { title: 'Без накладок', desc: 'Автоматический учет занятости слотов и длительности каждой процедуры', icon: 'ShieldCheck' },
    { title: 'Мгновенное подтверждение', desc: 'СМС/Telegram уведомления и напоминание за 2 часа до визита', icon: 'Zap' },
    { title: 'Гарантия и сервис', desc: 'Сертифицированные мастера, оригинальные расходные материалы', icon: 'Award' }
  ]
};

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    title: 'ТО и технические жидкости',
    slug: 'maintenance',
    description: 'Регламентное обслуживание, замена моторного масла, тормозной жидкости и фильтров',
    icon: 'Wrench',
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    order: 1,
    isActive: true,
  },
  {
    id: 'cat-2',
    title: 'Премиум Детейлинг & Мойка',
    slug: 'detailing',
    description: 'Детейлинг-мойка в 3 фазы, полировка кузова, керамические составы и химчистка',
    icon: 'Sparkles',
    imageUrl: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80',
    order: 2,
    isActive: true,
  },
  {
    id: 'cat-3',
    title: 'Компьютерная диагностика',
    slug: 'diagnostics',
    description: 'Полное сканирование электронных блоков, подвески, тормозной системы и двигателя',
    icon: 'Cpu',
    imageUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
    order: 3,
    isActive: true,
  },
  {
    id: 'cat-4',
    title: 'Шиномонтаж и балансировка',
    slug: 'tires',
    description: 'Сезонная замена резины, высокоточная балансировка, правка дисков и хранение',
    icon: 'Disc',
    imageUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80',
    order: 4,
    isActive: true,
  },
  {
    id: 'cat-5',
    title: 'Кузовной ремонт & Пленка PPF',
    slug: 'bodywork',
    description: 'Бронирование зон риска полиуретановой пленкой, беспокрасочное удаление вмятин PDR',
    icon: 'Shield',
    imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
    order: 5,
    isActive: true,
  },
  {
    id: 'cat-6',
    title: 'Тюнинг & Дооснащение',
    slug: 'tuning',
    description: 'Чип-тюнинг Stage 1/2, модернизация выхлопной системы, полная шумоизоляция',
    icon: 'Gauge',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    order: 6,
    isActive: true,
  }
];

const DEFAULT_SERVICES: Service[] = [
  {
    id: 'srv-1',
    categoryId: 'cat-1',
    title: 'Замена моторного масла и масляного фильтра',
    description: 'Включает снятие/установку защиты картера, слив отработанного масла, замену фильтра и заливку свежего масла по допускам производителя.',
    price: 2500,
    durationMinutes: 45,
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
    isActive: true,
    isPopular: true,
  },
  {
    id: 'srv-2',
    categoryId: 'cat-1',
    title: 'Комплексное ТО (Масло + 4 фильтра + диагностика подвески)',
    description: 'Замена масла, масляного, воздушного, салонного и топливного фильтров, плюс 40 пунктов проверки автомобиля.',
    price: 6900,
    durationMinutes: 90,
    imageUrl: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=600&q=80',
    isActive: true,
    isPopular: true,
  },
  {
    id: 'srv-3',
    categoryId: 'cat-1',
    title: 'Аппаратная замена тормозной жидкости',
    description: 'Прокачка контуров под давлением с контролем точки кипения на стенде.',
    price: 2200,
    durationMinutes: 45,
    imageUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80',
    isActive: true,
  },
  {
    id: 'srv-4',
    categoryId: 'cat-2',
    title: 'Трехфазная премиум-детейлинг мойка ANOMAYKA',
    description: 'Бесконтактная фаза, ручная мойка нано-шампунем варежкой из шерсти мериноса, очистка дисков от металлического налета и консервация воском.',
    price: 3500,
    durationMinutes: 60,
    imageUrl: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=600&q=80',
    isActive: true,
    isPopular: true,
  },
  {
    id: 'srv-5',
    categoryId: 'cat-2',
    title: 'Мягкая восстановительная полировка кузова',
    description: 'Удаление до 85% паутинки и мелких царапин, восстановление сочного зеркального блеска ЛКП.',
    price: 18000,
    durationMinutes: 180,
    imageUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80',
    isActive: true,
  },
  {
    id: 'srv-6',
    categoryId: 'cat-2',
    title: 'Глубокая химчистка салона с разбором',
    description: 'Очистка кожи, текстиля, потолка, багажника торнадором и экстрактором с последующей озонацией салона.',
    price: 14500,
    durationMinutes: 240,
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
    isActive: true,
  },
  {
    id: 'srv-7',
    categoryId: 'cat-3',
    title: 'Компьютерная диагностика всех электронных систем',
    description: 'Чтение, расшифровка параметров в реальном времени (live data), сброс адаптаций и отчет клиенту.',
    price: 1900,
    durationMinutes: 30,
    imageUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80',
    isActive: true,
    isPopular: true,
  },
  {
    id: 'srv-8',
    categoryId: 'cat-4',
    title: 'Комплексный шиномонтаж (4 колеса до R19 включительно)',
    description: 'Снятие/установка, мойка колес, разбортовка, сборка, герметизация бортов и лазерная балансировка.',
    price: 3600,
    durationMinutes: 60,
    imageUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80',
    isActive: true,
    isPopular: true,
  },
  {
    id: 'srv-9',
    categoryId: 'cat-5',
    title: 'Бронирование «Зоны риска» антигравийной пленкой PPF',
    description: 'Капот целиком, передний бампер, крылья, оптика, корпуса зеркал и полоса на крышу премиальным полиуретаном 200 микрон.',
    price: 65000,
    durationMinutes: 300,
    imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
    isActive: true,
  }
];

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Нужно ли дополнительно звонить после записи на сайте?',
    answer: 'Нет, звонить не требуется! После отправки формы слот мгновенно бронируется за вашим автомобилем в базе данных. Вы получите SMS/уведомление с номером брони.',
    order: 1
  },
  {
    id: 'faq-2',
    question: 'Как перенести или отменить запись?',
    answer: 'Вы можете сделать это в личном кабинете по номеру телефона либо по персональной ссылке из SMS за пару кликов без звонков оператору.',
    order: 2
  },
  {
    id: 'faq-3',
    question: 'Можно ли приехать со своими расходными материалами?',
    answer: 'Да, конечно. Мы с радостью примем ваши оригинальные расходники или подберем сертифицированные аналоги с нашего склада по дилерской цене.',
    order: 3
  },
  {
    id: 'faq-4',
    question: 'Где я могу подождать окончания работ?',
    answer: 'В нашем автоцентре оборудована комфортная клиентская лаунж-зона с панорамным видом на сервисную зону, зерновым кофе, скоростным Wi-Fi и PlayStation 5.',
    order: 4
  }
];

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Александр В.',
    car: 'Porsche Cayenne Coupe',
    service: 'Оклейка PPF + Детейлинг',
    rating: 5,
    text: 'Записался через сайт ночью за 2 минуты без всяких операторов. Приехал к 10:00 — пост был свободен, мастер сразу принял авто. Качество идеальное!',
    date: '18.10.2026'
  },
  {
    id: 'rev-2',
    author: 'Михаил К.',
    car: 'BMW M340i',
    service: 'Комплексное ТО и тормоза',
    rating: 5,
    text: 'Очень удобно сделана онлайн-запись. Видно реальные свободные окна, сразу рассчитана стоимость. Никаких скрытых доплат. Спасибо ANOMAYKA!',
    date: '14.10.2026'
  },
  {
    id: 'rev-3',
    author: 'Елена С.',
    car: 'Audi Q8',
    service: 'Детейлинг-мойка 3 фазы',
    rating: 5,
    text: 'Лучший сервис в Москве! Никаких задержек по времени, всё четко по таймингу слота. Салон блестит как с конвейера.',
    date: '11.10.2026'
  }
];

function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// Загрузка базы данных
export function getDatabase(): DatabaseSchema {
  try {
    ensureDirectoryExists(DB_FILE);
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DatabaseSchema = {
        brand: DEFAULT_BRAND,
        categories: DEFAULT_CATEGORIES,
        services: DEFAULT_SERVICES,
        bookings: [
          {
            id: 'b-init-1',
            code: 'AN-1001',
            serviceId: 'srv-1',
            serviceTitle: 'Замена моторного масла и масляного фильтра',
            categoryTitle: 'ТО и технические жидкости',
            price: 2500,
            durationMinutes: 45,
            date: new Date().toISOString().split('T')[0],
            time: '11:00',
            clientName: 'Дмитрий Соколов',
            clientPhone: '+7 (916) 123-45-67',
            carModel: 'BMW 530d G30',
            comment: 'Масло свое в багажнике',
            status: 'confirmed',
            notes: 'Пост №2, мастер Алексей',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        blockedSlots: [],
        admins: [
          {
            id: 'adm-1',
            email: 'admin@anomayka.ru',
            passwordHash: 'admin123', // Демо-пароль для MVP
            name: 'Главный Администратор',
            role: 'owner'
          }
        ],
        faqs: DEFAULT_FAQS,
        reviews: DEFAULT_REVIEWS
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }

    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Ошибка чтения базы данных:', err);
    return {
      brand: DEFAULT_BRAND,
      categories: DEFAULT_CATEGORIES,
      services: DEFAULT_SERVICES,
      bookings: [],
      blockedSlots: [],
      admins: [],
      faqs: DEFAULT_FAQS,
      reviews: DEFAULT_REVIEWS
    };
  }
}

// Атомарное сохранение базы данных
export function saveDatabase(data: DatabaseSchema): void {
  ensureDirectoryExists(DB_FILE);
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// Вспомогательные функции для расписания и слотов
function timeToMinutes(t: string): number {
  if (!t || typeof t !== 'string' || !t.includes(':')) return 0;
  const [h, m] = t.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60).toString().padStart(2, '0');
  const min = (m % 60).toString().padStart(2, '0');
  return `${h}:${min}`;
}

// Генерация всех возможных слотов на день с учетом занятых бронирований
export function getAvailableSlots(date: string, serviceDurationMinutes: number = 30) {
  const db = getDatabase();
  const { openTime, closeTime, slotDurationMinutes } = db.brand;

  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);

  // Все активные бронирования на эту дату (отмененные, неявки и звонки не блокируют слоты)
  const dayBookings = db.bookings.filter(
    (b) => b.date === date && b.status !== 'cancelled' && b.status !== 'noshow' && b.status !== 'call_requested'
  );

  // Все заблокированные слоты на эту дату
  const dayBlocks = db.blockedSlots.filter((bs) => bs.date === date);

  const slots: { time: string; available: boolean; reason?: string }[] = [];

  // Перебираем временные точки с шагом slotDurationMinutes
  for (let current = openMinutes; current + serviceDurationMinutes <= closeMinutes; current += slotDurationMinutes) {
    const slotStart = current;
    const slotEnd = current + serviceDurationMinutes;
    const timeStr = minutesToTime(slotStart);

    // Проверяем, пересекается ли данный интервал с существующими записями
    let isOccupied = false;
    let conflictReason = '';

    for (const b of dayBookings) {
      const bStart = timeToMinutes(b.time);
      const bEnd = bStart + b.durationMinutes;

      // Пересечение интервалов: max(start1, start2) < min(end1, end2)
      if (Math.max(slotStart, bStart) < Math.min(slotEnd, bEnd)) {
        isOccupied = true;
        conflictReason = 'Занято записью';
        break;
      }
    }

    if (!isOccupied) {
      for (const bl of dayBlocks) {
        const blStart = timeToMinutes(bl.startTime);
        const blEnd = timeToMinutes(bl.endTime);
        if (Math.max(slotStart, blStart) < Math.min(slotEnd, blEnd)) {
          isOccupied = true;
          conflictReason = bl.reason || 'Заблокировано';
          break;
        }
      }
    }

    // Также проверяем, если дата — сегодняшняя, не прошло ли уже время
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (date === todayStr) {
      const currentNowMinutes = now.getHours() * 60 + now.getMinutes() + 15; // запас 15 минут
      if (slotStart <= currentNowMinutes) {
        isOccupied = true;
        conflictReason = 'Время прошло';
      }
    }

    slots.push({
      time: timeStr,
      available: !isOccupied,
      reason: conflictReason || undefined
    });
  }

  return slots;
}

// Экспорт записей в CSV c UTF-8 BOM для безупречного открытия в Excel
export function exportBookingsToCSV(): string {
  const db = getDatabase();
  const header = ['ID Заявки', 'Код', 'Дата', 'Время', 'Клиент', 'Телефон', 'Автомобиль', 'Услуга', 'Длительность (мин)', 'Цена (руб)', 'Статус', 'Комментарий', 'Заметки'];
  
  const statusLabels: Record<string, string> = {
    new: 'Новая',
    confirmed: 'Подтверждена',
    completed: 'Выполнена',
    cancelled: 'Отменена',
    noshow: 'Неявка'
  };

  const rows = db.bookings.map(b => [
    b.id,
    b.code,
    b.date,
    b.time,
    `"${(b.clientName || '').replace(/"/g, '""')}"`,
    `"${(b.clientPhone || '').replace(/"/g, '""')}"`,
    `"${(b.carModel || '').replace(/"/g, '""')}"`,
    `"${(b.serviceTitle || '').replace(/"/g, '""')}"`,
    b.durationMinutes,
    b.price,
    statusLabels[b.status] || b.status,
    `"${(b.comment || '').replace(/"/g, '""')}"`,
    `"${(b.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [header.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  return '\uFEFF' + csvContent; // Добавляем BOM для правильной кодировки в Microsoft Excel
}
