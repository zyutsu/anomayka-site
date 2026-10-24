// Типы данных для системы онлайн-записи автоцентра / автосервиса ANOMAYKA

export interface BrandSettings {
  name: string;
  slogan: string;
  city: string;
  phone: string;
  phoneRaw: string;
  address: string;
  mapUrl?: string; // Прямая ссылка на организацию в Яндекс.Картах (yandex.ru/maps/org/...)
  workHours: string;
  openTime: string; // "09:00"
  closeTime: string; // "21:00"
  slotDurationMinutes: number; // 30 или 60
  workDays: number[]; // [1, 2, 3, 4, 5, 6, 0] (0 = вс)
  logoUrl: string;
  primaryColor: string; // "#090A0F"
  accentColor: string; // "#E11D48"
  secondaryColor: string; // "#171A24"
  telegramUrl: string;
  whatsappUrl: string;
  vkUrl: string;
  heroHeadline: string;
  heroSubheadline: string;
  features: { title: string; desc: string; icon: string }[];
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

export interface Service {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  durationMinutes: number; // Длительность в минутах: 30, 60, 90, 120 и т.д.
  imageUrl: string;
  isActive: boolean;
  isPopular?: boolean;
  requiresCall?: boolean; // Сложный случай: запись по предварительному звонку мастера
}

export type BookingStatus = 'new' | 'confirmed' | 'completed' | 'cancelled' | 'noshow' | 'call_requested';

export interface Booking {
  id: string;
  code: string; // Уникальный короткий номер: "AN-7842"
  serviceId: string;
  serviceTitle: string;
  categoryTitle?: string;
  price: number;
  durationMinutes: number;
  date: string; // "YYYY-MM-DD"
  time: string; // "14:00"
  clientName: string;
  clientPhone: string;
  carModel?: string;
  comment?: string;
  status: BookingStatus;
  notes?: string; // Служебные заметки администратора
  hasReview?: boolean; // Клиент оставил отзыв после выполнения
  createdAt: string;
  updatedAt: string;
}


export interface BlockedSlot {
  id: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "13:00"
  endTime: string; // "14:00"
  reason: string; // "Обед", "Тех. перерыв", "Выходной"
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'owner' | 'admin';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface ReviewItem {
  id: string;
  author: string;
  car: string;
  service: string;
  rating: number;
  text: string;
  date: string;
}

export interface ShortDemoLink {
  slug: string;
  url: string;
  name: string;
  createdAt: string;
}

export interface DatabaseSchema {
  brand: BrandSettings;
  categories: Category[];
  services: Service[];
  bookings: Booking[];
  blockedSlots: BlockedSlot[];
  admins: AdminUser[];
  faqs: FAQItem[];
  reviews: ReviewItem[];
  shortLinks?: ShortDemoLink[];
}
