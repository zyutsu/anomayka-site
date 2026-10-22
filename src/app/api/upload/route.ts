import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const oldUrl = formData.get('oldUrl') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Файл не передан' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';

    // 1. Формируем Data URL — универсальный формат, гарантированно работающий без файлового хранилища
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Безопасное имя файла
    const ext = path.extname(file.name) || (mimeType.includes('png') ? '.png' : '.jpg');
    const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

    // 2. Попытка сохранить в public/uploads (для локального сервера и хостингов с постоянным диском типа Render)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      if (oldUrl && oldUrl.startsWith('/uploads/')) {
        const oldFilename = path.basename(oldUrl);
        const oldFilePath = path.join(uploadsDir, oldFilename);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (e) {}
        }
      }

      const filePath = path.join(uploadsDir, cleanName);
      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({ success: true, url: `/uploads/${cleanName}` });
    } catch (fsErr) {
      // 3. Если корень read-only (Vercel Serverless) — сохраняем в /tmp/uploads
      try {
        const tmpUploadsDir = path.join('/tmp', 'uploads');
        if (!fs.existsSync(tmpUploadsDir)) {
          fs.mkdirSync(tmpUploadsDir, { recursive: true });
        }

        const tmpFilePath = path.join(tmpUploadsDir, cleanName);
        fs.writeFileSync(tmpFilePath, buffer);

        // Отдаем через наш API-роут отдачи файлов
        return NextResponse.json({ success: true, url: `/api/uploads/${cleanName}` });
      } catch (tmpErr) {
        // 4. Если даже в /tmp не удалось записать — возвращаем Data URL (отображается везде)
        return NextResponse.json({ success: true, url: dataUrl });
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки фото:', error);
    return NextResponse.json({ error: 'Не удалось обработать файл' }, { status: 500 });
  }
}
