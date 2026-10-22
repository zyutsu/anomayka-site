import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const oldUrl = formData.get('oldUrl') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Файл не передан' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Если передан старый файл из /uploads/ — удаляем его
    if (oldUrl && oldUrl.startsWith('/uploads/')) {
      const oldFilename = path.basename(oldUrl);
      const oldFilePath = path.join(uploadsDir, oldFilename);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (e) {
          console.warn('Не удалось удалить старый файл:', e);
        }
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Безопасное уникальное имя файла
    const ext = path.extname(file.name) || '.jpg';
    const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, cleanName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${cleanName}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Ошибка загрузки фото:', error);
    return NextResponse.json({ error: 'Не удалось сохранить файл' }, { status: 500 });
  }
}
