"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Car, Check, RefreshCw, Star, X } from "lucide-react";
import { Booking } from "@/lib/types";
import { formatDateRu, formatDuration, formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBrand } from "@/context/BrandContext";

function AccountContent() {
  const { isDemo, getDemoHref } = useBrand();
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get("phone") || "";

  const [phone, setPhone] = useState(initialPhone);
  const [authPhone, setAuthPhone] = useState(initialPhone);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const [reschedule, setReschedule] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const load = async (target: string) => {
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const res = await fetch("/api/bookings?phone=" + encodeURIComponent(target), {
        headers: isDemo ? { "x-demo-mode": "1" } : {},
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Не удалось загрузить записи");
      }
      let data: Booking[] = await res.json();

      if (isDemo && typeof window !== "undefined") {
        try {
          const stored = sessionStorage.getItem("anomayka_demo_bookings");
          if (stored) {
            const clean = target.replace(/\D/g, "");
            const demoList: Booking[] = JSON.parse(stored);
            data = [...demoList.filter((b) => b.clientPhone.replace(/\D/g, "") === clean), ...data];
          }
        } catch (e) {}
      }

      setBookings(data);
      setAuthPhone(target);
    } catch (err: any) {
      setError(err?.message || "Ошибка связи");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPhone) load(initialPhone);
  }, [initialPhone]);

  const cancel = async (booking: Booking) => {
    if (!window.confirm("Отменить эту запись? Слот освободится для других клиентов.")) return;

    const res = await fetch("/api/bookings/" + booking.id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(isDemo ? { "x-demo-mode": "1" } : {}),
      },
      body: JSON.stringify({ status: "cancelled", isDemo, phone: booking.clientPhone }),
    });

    if (res.ok) {
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: "cancelled" } : b)));
      setNotice("Запись отменена");
    } else {
      const data = await res.json().catch(() => ({}));
      setNotice(data.error || "Не удалось отменить запись");
    }
  };

  const submitReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedule || !newDate || !newTime) return;

    setSaving(true);
    setNotice("");
    try {
      const res = await fetch("/api/bookings/" + reschedule.id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(isDemo ? { "x-demo-mode": "1" } : {}),
        },
        body: JSON.stringify({ date: newDate, time: newTime, isDemo, phone: reschedule.clientPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Это время уже занято");

      setBookings((prev) =>
        prev.map((b) => (b.id === reschedule.id ? { ...b, date: newDate, time: newTime } : b))
      );
      setReschedule(null);
      setNotice("Запись перенесена");
    } catch (err: any) {
      setNotice(err?.message || "Не удалось перенести запись");
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const active = bookings.filter((b) => b.status === "confirmed" || b.status === "new");
  const past = bookings.filter((b) => b.status !== "confirmed" && b.status !== "new");
  const isAuthed = Boolean(authPhone) && searched;

  return (
    <div className="page-shell pb-16 pt-10 sm:pt-14">
      <div className="max-w-2xl">
        <p className="eyebrow mb-3">Личный кабинет</p>
        <h1 className="heading text-[clamp(2rem,4.4vw,3rem)] text-theme-title">
          Мои записи
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-theme-muted">
          Посмотрите статус визита, перенесите время или отмените запись. Нужен
          только номер телефона, указанный при оформлении.
        </p>
      </div>

      {!isAuthed ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (phone.replace(/\D/g, "").length >= 10) load(phone);
            else setError("Укажите полный номер телефона");
          }}
          className="mt-8 max-w-md rounded-2xl border border-brand-border bg-brand-surface p-6"
        >
          <p className="text-[14px] font-semibold text-theme-title">Вход по номеру телефона</p>
          <p className="mt-1 text-[12px] text-theme-muted">
            Найдём все записи, оформленные на этот номер.
          </p>

          <div className="mt-5 space-y-3">
            <Input
              label="Телефон"
              type="tel"
              placeholder="+7 (999) 000-00-00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
            {error && <p className="text-[12px] text-red-400">{error}</p>}
            <Button type="submit" isLoading={loading} className="h-11 w-full text-[13px]">
              Найти записи
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-brand-border py-4">
            <p className="text-[13px] text-theme-muted">
              Номер: <span className="font-medium text-theme-title">{authPhone}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => load(authPhone)}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-brand-border px-3 text-[12px] text-theme-muted transition-colors hover:text-theme-title"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Обновить
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthPhone("");
                  setBookings([]);
                  setPhone("");
                  setSearched(false);
                }}
                className="inline-flex h-9 items-center rounded-full border border-brand-border px-3 text-[12px] text-theme-muted transition-colors hover:text-theme-title"
              >
                Сменить номер
              </button>
            </div>
          </div>

          {notice && (
            <div className="rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-[12px] text-theme-title">
              {notice}
            </div>
          )}

          <section className="space-y-3">
            <h2 className="text-[15px] font-semibold text-theme-title">
              Предстоящие визиты
              <span className="ml-2 text-theme-muted">({active.length})</span>
            </h2>

            {active.length === 0 ? (
              <div className="rounded-2xl border border-brand-border bg-brand-surface px-6 py-8 text-center">
                <Car className="mx-auto h-6 w-6 text-theme-muted" />
                <p className="mt-3 text-[13px] text-theme-title">Активных записей нет</p>
                <p className="mt-1 text-[12px] text-theme-muted">
                  Выберите услугу и удобное время — это займёт пару минут.
                </p>
                <Link
                  href={getDemoHref("/booking")}
                  className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-brand-accent px-4 text-[12px] font-semibold text-white"
                >
                  Записаться
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              active.map((b) => (
                <article key={b.id} className="rounded-2xl border border-brand-border bg-brand-surface p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-semibold text-theme-title">{b.serviceTitle}</p>
                      <p className="mt-1 text-[12px] text-theme-muted">
                        {formatDateRu(b.date)} · {b.time} · {formatDuration(b.durationMinutes)}
                      </p>
                    </div>
                    <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                      Подтверждено
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-brand-border pt-4 text-[12px]">
                    <span className="font-mono text-brand-accent">{b.code}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-theme-muted">{formatPrice(b.price)}</span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setReschedule(b);
                          setNewDate(b.date);
                          setNewTime(b.time);
                          setNotice("");
                        }}
                        className="h-8 text-[11px]"
                      >
                        Перенести
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => cancel(b)}
                        className="h-8 text-[11px] text-theme-muted hover:text-red-400"
                      >
                        Отменить
                      </Button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>

          {past.length > 0 && (
            <section className="space-y-3 border-t border-brand-border pt-6">
              <h2 className="text-[15px] font-semibold text-theme-title">История</h2>
              <div className="divide-y divide-brand-border rounded-2xl border border-brand-border bg-brand-surface">
                {past.map((b) => (
                  <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                    <div>
                      <p className="text-[13px] font-medium text-theme-title">{b.serviceTitle}</p>
                      <p className="mt-0.5 text-[11px] text-theme-muted">
                        {formatDateRu(b.date)} · {b.time} · {b.code}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-theme-muted">
                        {b.status === "completed" ? "Выполнено" : b.status === "cancelled" ? "Отменено" : "Неявка"}
                      </span>
                      <Link
                        href={getDemoHref("/booking?serviceId=" + b.serviceId)}
                        className="inline-flex h-8 items-center rounded-full border border-brand-border px-3 text-[11px] text-theme-title"
                      >
                        Повторить
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3 border-t border-brand-border pt-6">
            <h2 className="text-[15px] font-semibold text-theme-title">Оставить отзыв</h2>
            <ReviewForm phone={authPhone} isDemo={isDemo} />
          </section>
        </div>
      )}

      {reschedule && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setReschedule(null)}
        >
          <form
            onSubmit={submitReschedule}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-brand-border bg-brand-surface p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[15px] font-semibold text-theme-title">Перенос записи</p>
                <p className="mt-1 text-[12px] text-theme-muted">{reschedule.serviceTitle}</p>
              </div>
              <button type="button" onClick={() => setReschedule(null)} aria-label="Закрыть">
                <X className="h-4 w-4 text-theme-muted" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <Input
                label="Новая дата"
                type="date"
                min={today}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
              <Input
                label="Новое время"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>

            <Button type="submit" isLoading={saving} className="mt-4 h-11 w-full text-[12px]">
              Подтвердить перенос
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

function ReviewForm({ phone, isDemo }: { phone: string; isDemo: boolean }) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(isDemo ? { "x-demo-mode": "1" } : {}) },
        body: JSON.stringify({ author: "Клиент", car: "", service: "Визит в сервис", rating, text, isDemo }),
      });
      if (res.ok) {
        setSent(true);
        setText("");
      }
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] px-5 py-4 text-[12px] text-theme-title">
        Спасибо! Отзыв опубликован.
      </div>
    );
  }

  return (
    <form onSubmit={send} className="rounded-2xl border border-brand-border bg-brand-surface p-5">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="p-0.5"
            aria-label={"Оценка " + star}
          >
            <Star
              className={
                "h-4 w-4 " + (star <= rating ? "fill-amber-400 text-amber-600" : "text-theme-muted")
              }
            />
          </button>
        ))}
      </div>
      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Как прошёл визит?"
        className="mt-3 w-full resize-none rounded-xl border border-brand-border bg-[var(--brand-secondary)] px-4 py-3 text-[13px] text-theme-title placeholder:text-theme-muted/60 focus:border-brand-accent focus:outline-none"
      />
      <Button type="submit" isLoading={busy} disabled={!text.trim()} className="mt-3 h-9 px-4 text-[12px]">
        <Check className="h-3.5 w-3.5" />
        Оставить отзыв
      </Button>
      <p className="mt-2 text-[10px] text-theme-muted">Отзыв от клиента с номером {phone}</p>
    </form>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="page-shell py-20 text-[13px] text-theme-muted">Загрузка…</div>}>
      <AccountContent />
    </Suspense>
  );
}

