import { NextResponse } from "next/server";
import { getDatabaseAsync, saveDatabaseAsync } from "@/lib/db";
import { ReviewItem } from "@/lib/types";
import { isDemoRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDatabaseAsync();
  return NextResponse.json(db.reviews || []);
}

export async function POST(req: Request) {
  try {
    const { author, car, service, rating, text, bookingId } = await req.json();

    if (!text || !String(text).trim()) {
      return NextResponse.json({ error: "Текст отзыва обязателен" }, { status: 400 });
    }

    const demo = isDemoRequest(req);

    const db = await getDatabaseAsync();
    const review: ReviewItem = {
      id: "rev-" + Date.now(),
      author: String(author || "Клиент").trim(),
      car: String(car || "").trim(),
      service: String(service || "Обслуживание").trim(),
      rating: Math.max(1, Math.min(5, Number(rating) || 5)),
      text: String(text).trim().slice(0, 1200),
      date: new Date().toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    };

    if (demo) {
      return NextResponse.json({ success: true, demo: true, review });
    }

    if (!Array.isArray(db.reviews)) db.reviews = [];
    db.reviews = [review, ...db.reviews].slice(0, 60);

    if (bookingId) {
      const index = db.bookings.findIndex((b) => b.id === bookingId || b.code === bookingId);
      if (index !== -1) db.bookings[index].hasReview = true;
    }

    await saveDatabaseAsync(db);
    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("REVIEW ERROR:", error);
    return NextResponse.json({ error: "Не удалось сохранить отзыв" }, { status: 500 });
  }
}

