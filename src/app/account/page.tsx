"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Booking, BookingStatus } from "@/lib/types";
import { User, Phone, Calendar, Clock, Car, Check, X, RefreshCw, AlertCircle, ArrowRight, Ban, CheckCircle2, Star } from "lucide-react";
import { formatPrice, formatDuration, formatDateRu } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function AccountContent() {
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get("phone") || "";

  const [phone, setPhone] = useState(initialPhone);
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialPhone);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Модалка переноса записи
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Модалка отзыва о выполненной работе
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking || !reviewText.trim()) return;

    setIsSubmittingReview(true);
    setReviewError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: reviewBooking.clientName,
          car: reviewBooking.carModel,
          service: reviewBooking.serviceTitle,
          rating,
          text: reviewText.trim(),
          bookingId: reviewBooking.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Ошибка сохранения отзыва");
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === reviewBooking.id ? { ...b, hasReview: true } : b))
      );
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewSuccess(false);
        setReviewBooking(null);
        setReviewText("");
      }, 2500);
    } catch (err: any) {
      setReviewError(err.message || "Ошибка отправки отзыва");
    } finally {
      setIsSubmittingReview(false);
    }
  };


  const fetchClientBookings = async (targetPhone: string) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/bookings?phone=${encodeURIComponent(targetPhone)}`);
      if (res.ok) {
        const data: Booking[] = await res.json();
        setBookings(data);
        setIsAuthenticated(true);
      } else {
        setErrorMsg("Не удалось найти записи по указанному номеру");
      }
    } catch (err) {
      setErrorMsg("Ошибка связи с сервером");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialPhone) {
      fetchClientBookings(initialPhone);
    }
  }, [initialPhone]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    fetchClientBookings(phone.trim());
  };

  // Отмена записи
  const handleCancelBooking = async (id: string) => {
    if (!confirm("Вы уверены, что хотите отменить эту запись? Слот освободится для других автовладельцев.")) {
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
        );
      }
    } catch (e) {
      alert("Ошибка при отмене записи");
    }
  };

  // Перенос записи
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleBooking || !newDate || !newTime) return;

    setIsRescheduling(true);
    try {
      const res = await fetch(`/api/bookings/${rescheduleBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newDate, time: newTime }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Выбранное время уже занято");
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.id === rescheduleBooking.id ? { ...b, date: newDate, time: newTime } : b
        )
      );
      setRescheduleBooking(null);
      alert("Запись успешно перенесена на новое время!");
    } catch (err: any) {
      alert(err.message || "Ошибка при переносе");
    } finally {
      setIsRescheduling(false);
    }
  };

  // Разделение на активные и архивные
  const activeBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "new"
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled" || b.status === "noshow"
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <span className="text-xs font-bold text-brand-accent uppercase tracking-wider block">
          Личный кабинет
        </span>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Мои записи и управление визитами
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Просматривайте статус, переносите дату визита или повторяйте запись в 2 клика без звонков
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-brand-surface border border-white/10 shadow-2xl space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-brand-accent/15 border border-brand-accent/30 mx-auto flex items-center justify-center text-brand-accent">
            <User className="w-6 h-6" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-white">Вход по номеру телефона</h2>
            <p className="text-xs text-slate-400">
              Введите телефон, указанный при оформлении любой записи
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Номер телефона"
              type="tel"
              placeholder="+7 (999) 000-00-00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
              Найти мои записи
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Инфо профиля */}
          <div className="p-5 rounded-2xl bg-brand-surface border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center text-brand-accent">
                <User className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-white block text-sm">{phone}</strong>
                <span className="text-xs text-slate-400">
                  Всего записей в сервисе: {bookings.length}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchClientBookings(phone)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
                title="Обновить список"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setPhone("");
                  setBookings([]);
                }}
                className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
              >
                Сменить номер
              </button>
            </div>
          </div>

          {/* Активные записи */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-accent" />
              Предстоящие записи ({activeBookings.length})
            </h2>

            {activeBookings.length === 0 ? (
              <div className="p-8 rounded-2xl bg-brand-surface border border-white/5 text-center space-y-3">
                <p className="text-xs text-slate-400">
                  У вас пока нет активных предстоящих записей.
                </p>
                <Link href="/booking">
                  <Button size="sm">Записаться на обслуживание</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl bg-brand-surface border border-white/10 space-y-4 shadow-lg hover:border-brand-accent/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-2.5 py-1 rounded-lg">
                          {b.code}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-white font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-brand-accent" />
                          <span>{formatDateRu(b.date)}</span>
                          <span className="text-brand-accent font-bold ml-1">{b.time}</span>
                          <span className="text-slate-400 text-[11px]">({formatDuration(b.durationMinutes)})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-black text-white text-base">
                          {formatPrice(b.price)}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Подтверждено
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Услуга:</span>
                        <strong className="text-white text-sm block">{b.serviceTitle}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Автомобиль:</span>
                        <span className="text-slate-200">{b.carModel || "Не указан"}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500">
                        Оплата в кассе автоцентра после завершения работ
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setRescheduleBooking(b);
                            setNewDate(b.date);
                            setNewTime(b.time);
                          }}
                          className="h-8 px-3 text-xs"
                        >
                          Перенести время
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelBooking(b.id)}
                          className="h-8 px-2 text-xs text-slate-400 hover:text-red-400"
                        >
                          <Ban className="w-3.5 h-3.5 mr-1" /> Отменить
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* История завершенных записей */}
          {pastBookings.length > 0 && (
            <div className="space-y-4 pt-6">
              <h2 className="text-lg font-bold text-slate-300">
                История визитов ({pastBookings.length})
              </h2>

              <div className="space-y-2">
                {pastBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs opacity-75"
                  >
                    <div>
                      <span className="font-mono text-slate-400 mr-2">{b.code}</span>
                      <strong className="text-white">{b.serviceTitle}</strong>
                      <span className="text-slate-400 block sm:inline sm:ml-2">
                        {formatDateRu(b.date)} в {b.time}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-semibold text-white">{formatPrice(b.price)}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-white/5 text-slate-400">
                        {b.status === "completed" ? "Выполнено" : b.status === "cancelled" ? "Отменено" : "Неявка"}
                      </span>

                      {/* Кнопка оставить отзыв для выполненных работ */}
                      {b.status === "completed" && (
                        b.hasReview ? (
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Отзыв сохранен
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              setReviewBooking(b);
                              setRating(5);
                              setReviewText("");
                              setReviewError("");
                              setReviewSuccess(false);
                            }}
                            className="h-8 px-3 text-xs font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>Оставить отзыв</span>
                          </Button>
                        )
                      )}

                      <Link href={`/booking?serviceId=${b.serviceId}`}>
                        <Button variant="secondary" size="sm" className="h-8 px-3 text-xs rounded-xl">
                          Записаться снова
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Модальное окно переноса записи */}
      {rescheduleBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-brand-surface border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Перенос записи {rescheduleBooking.code}</h3>
            <p className="text-xs text-slate-400">
              Услуга: <strong>{rescheduleBooking.serviceTitle}</strong> ({rescheduleBooking.durationMinutes} мин)
            </p>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3 text-xs">
              <Input
                label="Новая дата"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />

              <Input
                label="Новое время начала"
                type="text"
                placeholder="15:00"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
              />

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRescheduleBooking(null)}
                >
                  Отмена
                </Button>
                <Button type="submit" size="sm" isLoading={isRescheduling}>
                  Подтвердить перенос
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно отзыва о визите */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-brand-surface border border-white/15 rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setReviewBooking(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {reviewSuccess ? (
              <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Спасибо за ваш отзыв!</h3>
                <p className="text-xs text-slate-300">
                  Ваш отзыв успешно сохранен и опубликован на сайте автоцентра.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Оставить отзыв о визите</h3>
                  <p className="text-xs text-slate-400">
                    Услуга: <strong className="text-white">{reviewBooking.serviceTitle}</strong>
                  </p>
                </div>

                {reviewError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                {/* Выбор рейтинга звездами */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Ваша оценка:</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-600 hover:text-slate-400"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-400 ml-2">
                      {rating === 5 ? "Отлично" : rating === 4 ? "Хорошо" : rating === 3 ? "Нормально" : "Есть замечания"}
                    </span>
                  </div>
                </div>

                {/* Поле отзыва */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">
                    Поделитесь впечатлениями о сервисе и мастере:
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Например: быстро приняли авто, сделали ТО за 40 минут, чистая зона ожидания..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                    className="w-full rounded-2xl bg-black/40 border border-white/10 p-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-accent resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReviewBooking(null)}
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    isLoading={isSubmittingReview}
                    className="font-bold rounded-2xl px-6 shadow-xl shadow-brand-accent/25"
                  >
                    Опубликовать отзыв
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
          Загрузка личного кабинета...
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
