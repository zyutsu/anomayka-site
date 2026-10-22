import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDatabaseAsync, saveDatabaseAsync } from '@/lib/db';

export const dynamic = 'force-dynamic';

// В памяти храним сессии и счетчик неудачных попыток входа (защита от брутфорса)
interface SessionData {
  adminId: string;
  email: string;
  name: string;
  role: string;
  expiresAt: number;
}

const activeSessions = new Map<string, SessionData>();
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function hashPassword(pass: string): string {
  return crypto.createHash('sha256').update(pass).digest('hex');
}

function verifyPassword(inputPass: string, storedHashOrPass: string): boolean {
  if (storedHashOrPass === inputPass) return true;
  return storedHashOrPass === hashPassword(inputPass);
}

// Проверка активной сессии
export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/staff_session=([^;]+)/);
    const tokenFromCookie = match ? match[1] : null;

    const authHeader = req.headers.get('authorization') || '';
    const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = activeSessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      if (session) activeSessions.delete(token);
      return NextResponse.json({ authenticated: false, error: 'Сессия истекла' }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.adminId,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

// Вход в систему с защитой от перебора (Brute Force Protection)
export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local';
    const attempt = loginAttempts.get(ip);

    if (attempt && attempt.lockedUntil > Date.now()) {
      const waitMinutes = Math.ceil((attempt.lockedUntil - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Слишком много неверных попыток входа. Доступ заблокирован на ${waitMinutes} мин.` },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();
    const cleanEmail = (email || '').toLowerCase().trim();

    const db = await getDatabaseAsync();
    const admin = db.admins.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      const current = attempt || { count: 0, lockedUntil: 0 };
      current.count += 1;
      if (current.count >= 5) {
        current.lockedUntil = Date.now() + 5 * 60 * 1000; // блокировка на 5 минут
      }
      loginAttempts.set(ip, current);

      return NextResponse.json(
        { error: 'Неверный email или пароль персонала' },
        { status: 401 }
      );
    }

    // Успешный вход — сбрасываем счетчик ошибок
    loginAttempts.delete(ip);

    // Создаем криптографически стойкий токен сессии
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 3600 * 1000; // 7 дней

    activeSessions.set(sessionToken, {
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      expiresAt,
    });

    const res = NextResponse.json({
      success: true,
      token: sessionToken,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    // Устанавливаем безопасный HttpOnly cookie
    res.cookies.set('staff_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    return res;
  } catch (error: any) {
    console.error('AUTH ROUTE ERROR:', error?.message || error);
    return NextResponse.json({ error: 'Ошибка авторизации' }, { status: 500 });
  }
}

// Смена пароля администратора / персонала
export async function PATCH(req: Request) {
  try {
    const { email, currentPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Новый пароль должен содержать не менее 6 символов' },
        { status: 400 }
      );
    }

    const db = await getDatabaseAsync();
    const cleanEmail = (email || 'admin@anomayka.ru').toLowerCase().trim();
    const adminIndex = db.admins.findIndex((a) => a.email.toLowerCase() === cleanEmail);

    if (adminIndex === -1) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const admin = db.admins[adminIndex];
    if (!verifyPassword(currentPassword, admin.passwordHash)) {
      return NextResponse.json({ error: 'Текущий пароль указан неверно' }, { status: 403 });
    }

    // Сохраняем надежный хэш нового пароля
    admin.passwordHash = hashPassword(newPassword);
    db.admins[adminIndex] = admin;
    await saveDatabaseAsync(db);

    return NextResponse.json({
      success: true,
      message: 'Пароль успешно обновлен и защищен SHA-256',
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Ошибка обновления пароля' }, { status: 500 });
  }
}

// Выход из системы
export async function DELETE(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/staff_session=([^;]+)/);
  if (match) {
    activeSessions.delete(match[1]);
  }

  const res = NextResponse.json({ success: true, message: 'Выход выполнен' });
  res.cookies.set('staff_session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return res;
}
