"use client";

import React, { useState } from "react";
import { Booking, Service } from "@/lib/types";
import { Calendar, CheckCircle2, XCircle, AlertCircle, TrendingUp, Clock, Users, ArrowUpRight, PhoneCall } from "lucide-react";
import { formatPrice, formatDateRu } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminDashboardProps {
  bookings: Booking[];
  services: Service[];
  onNavigateToBookings: () => void;
  onOpenManualBooking?: () => void;
}

export function AdminDashboard({ bookings, services, onNavigateToBookings, onOpenManualBooking }: AdminDashboardProps) {
  const [periodView, setPeriodView] = useState<"week" | "today">("week");

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();
  const yesterdayStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  })();

  const d = new Date();
  d.setDate(d.getDate() - 7);
  const sevenDaysAgoStr = d.toISOString().split("T")[0];

  const todayBookings = bookings.filter((b) => b.date === todayStr);
  const weekBookings = bookings.filter((b) => b.date >= sevenDaysAgoStr);

  // Сортировка: сначала свежие даты, внутри дня — по времени
  const displayBookings = [...(periodView === "week" ? weekBookings : todayBookings)].sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return a.time.localeCompare(b.time);
  });

  const getDateBadge = (dateStr: string) => {
    if (dateStr === todayStr) {
      return <span className="px-1.5 py-0.5 rounded-md bg-brand-accent/20 text-brand-accent font-bold text-[10px]">Сегодня</span>;
    }
    if (dateStr === tomorrowStr) {
      return <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">Завтра</span>;
    }
    if (dateStr === yesterdayStr) {
      return <span className="px-1.5 py-0.5 rounded-md bg-slate-500/20 text-slate-400 font-bold text-[10px]">Вчера</span>;
    }
    return <span className="text-[10px] text-theme-muted font-medium">{formatDateRu(dateStr)}</span>;
  };

  const activeTodayBookings = todayBookings.filter(
    (b) => b.status !== "cancelled" && b.status !== "noshow" && b.status !== "call_requested"
  );
  const totalCompleted = bookings.filter((b) => b.status === "completed").length;
  const totalCancelled = bookings.filter((b) => b.status === "cancelled").length;
  const totalNoShow = bookings.filter((b) => b.status === "noshow").length;

  const todayRevenue = todayBookings
    .filter((b) => b.status !== "cancelled" && b.status !== "noshow")
    .reduce((sum, b) => sum + (b.price || 0), 0);

  const totalRevenue = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (b.price || 0), 0);

  // Расчет загрузки по часам на сегодня (с 09:00 до 21:00)
  const hours = Array.from({ length: 12 }, (_, i) => `${(i + 9).toString().padStart(2, "0")}:00`);

  return (
    <div className="space-y-6">
      {/* Верхний быстрый блок действий */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-brand-surface border border-brand-border">
        <div>
          <h2 className="text-base font-bold text-theme-title">Оперативный дашборд автоцентра</h2>
          <p className="text-xs text-theme-muted">
            Текущая загрузка, записи за последнюю неделю и быстрый прием телефонных звонков
          </p>
        </div>

        {onOpenManualBooking && (
          <Button
            size="sm"
            onClick={onOpenManualBooking}
            className="gap-2 text-xs rounded-xl font-bold bg-brand-accent hover:bg-brand-accent/90 text-white shadow-lg shadow-brand-accent/30 hover:scale-105 transition-all py-2.5 px-4 h-auto"
          >
            <PhoneCall className="w-4 h-4" />
            <span>+ Записать по звонку</span>
          </Button>
        )}
      </div>

      {/* 4 ключевых метрики */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-2">
          <div className="flex items-center justify-between text-theme-muted text-xs">
            <span>Активных записей на сегодня</span>
            <Calendar className="w-4 h-4 text-brand-accent" />
          </div>
          <div className="text-3xl font-black text-theme-title">{activeTodayBookings.length}</div>
          <p className="text-[11px] text-theme-muted">
            Подтверждено: {activeTodayBookings.filter((b) => b.status === "confirmed").length}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-2">
          <div className="flex items-center justify-between text-theme-muted text-xs">
            <span>Ожидаемая выручка сегодня</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-theme-title">{formatPrice(todayRevenue)}</div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Без учета отмененных
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-2">
          <div className="flex items-center justify-between text-theme-muted text-xs">
            <span>Всего выполнено</span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black text-theme-title">{totalCompleted}</div>
          <p className="text-[11px] text-theme-muted">
            Оборот: {formatPrice(totalRevenue)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-2">
          <div className="flex items-center justify-between text-theme-muted text-xs">
            <span>Отмены / Неявки</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-black text-theme-title">
            {totalCancelled + totalNoShow}
          </div>
          <p className="text-[11px] text-theme-muted">
            Отмен: {totalCancelled} | Неявок: {totalNoShow}
          </p>
        </div>
      </div>

      {/* График загрузки по часам сегодня */}
      <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-theme-title text-base">Загрузка постов на сегодня</h3>
            <p className="text-xs text-theme-muted">
              Распределение активных записей по часам (отмененные слоты свободны)
            </p>
          </div>
          <span className="text-xs font-mono text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-2.5 py-1 rounded-lg">
            {todayStr}
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 pt-2">
          {hours.map((hr) => {
            const hasBooking = activeTodayBookings.some((b) => b.time && b.time.startsWith(hr.slice(0, 2)));
            return (
              <div
                key={hr}
                className={`min-h-[68px] p-2 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                  hasBooking
                    ? "bg-brand-accent/20 border-brand-accent text-brand-accent font-bold shadow-sm shadow-brand-accent/20"
                    : "bg-black/30 border-brand-border/40 text-slate-400 hover:border-brand-border"
                }`}
              >
                <span className="text-[10px] font-mono font-medium opacity-75 leading-none">
                  {hr}
                </span>
                <span className={`text-[11px] sm:text-xs font-semibold leading-none mt-1.5 ${
                  hasBooking ? "text-brand-accent" : "text-slate-400"
                }`}>
                  {hasBooking ? "Занято" : "Свободно"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ближайшие записи (неделя / сегодня) */}
      <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-bold text-theme-title text-base">
              {periodView === "week" ? "Записи за последнюю неделю" : "Записи на сегодня"} ({displayBookings.length})
            </h3>

            {/* Переключатели периода */}
            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-brand-border text-xs">
              <button
                type="button"
                onClick={() => setPeriodView("week")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  periodView === "week" ? "bg-brand-accent text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                За последние 7 дней (по умолчанию)
              </button>
              <button
                type="button"
                onClick={() => setPeriodView("today")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  periodView === "today" ? "bg-brand-accent text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                Сегодня
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenManualBooking && (
              <Button
                size="sm"
                onClick={onOpenManualBooking}
                className="gap-1.5 text-xs rounded-xl font-bold bg-brand-accent hover:bg-brand-accent/90 text-white shadow-md shadow-brand-accent/20"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>+ Записать по звонку</span>
              </Button>
            )}
            <button
              onClick={onNavigateToBookings}
              className="text-xs text-brand-accent hover:underline cursor-pointer ml-1"
            >
              Все заявки →
            </button>
          </div>
        </div>

        {displayBookings.length === 0 ? (
          <p className="text-xs text-theme-muted py-6 text-center">
            {periodView === "week"
              ? "За последние 7 дней записей не найдено."
              : "На сегодня записей пока нет. Все посты сервиса свободны."}
          </p>
        ) : (
          <div className="divide-y divide-white/5">
            {displayBookings.map((b) => {
              const isCancelled = b.status === "cancelled";
              return (
                <div
                  key={b.id}
                  className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-opacity ${
                    isCancelled ? "opacity-45" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center min-w-[70px]">
                      <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg ${
                        isCancelled
                          ? "bg-red-500/10 text-red-400 line-through"
                          : "bg-brand-accent/10 text-brand-accent border border-brand-accent/20"
                      }`}>
                        {b.time}
                      </span>
                      {periodView === "week" && (
                        <div className="mt-1">
                          {getDateBadge(b.date)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className={`text-theme-title text-sm ${isCancelled ? "line-through text-slate-400" : ""}`}>
                          {b.clientName}
                        </strong>
                        <span className="font-mono text-[10px] text-brand-accent bg-brand-accent/10 px-1.5 py-0.5 rounded border border-brand-accent/20">
                          {b.code}
                        </span>
                      </div>
                      <span className="text-theme-muted block mt-0.5">
                        {b.serviceTitle} • <span className="text-theme-title font-medium">{b.carModel || "Авто не указано"}</span> • <a href={`tel:${b.clientPhone}`} className="text-brand-accent hover:underline">{b.clientPhone}</a>
                      </span>
                      {b.comment && (
                        <p className="text-[11px] text-slate-400 italic mt-0.5">
                          "{b.comment}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <span className="font-bold text-theme-title text-sm">{formatPrice(b.price)}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${
                      b.status === "confirmed"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : b.status === "completed"
                        ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
                        : b.status === "cancelled"
                        ? "bg-red-500/15 text-red-400 border-red-500/30"
                        : b.status === "call_requested"
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        : "bg-white/10 text-slate-300 border-white/10"
                    }`}>
                      {b.status === "confirmed" ? "Подтверждена" :
                       b.status === "completed" ? "Выполнена" :
                       b.status === "cancelled" ? "Отменена (слот свободен)" :
                       b.status === "call_requested" ? "Запрос звонка" :
                       b.status === "noshow" ? "Неявка" : "Новая"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
