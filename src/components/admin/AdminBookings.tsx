"use client";

import React, { useState } from "react";
import { Booking, BookingStatus, Service } from "@/lib/types";
import { Search, Download, Plus, Phone, Calendar, Clock, Car, Edit3, Check, PhoneCall, Ban } from "lucide-react";
import { formatPrice, formatDuration, formatDateRu } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminBookingsProps {
  bookings: Booking[];
  services: Service[];
  onUpdateStatus: (id: string, status: BookingStatus, notes?: string) => Promise<void>;
  onReschedule: (id: string, date: string, time: string) => Promise<void>;
  onAddManualBooking: (data: any) => Promise<void>;
  onRefresh: () => void;
  onOpenManualBooking?: () => void;
}

export function AdminBookings({
  bookings,
  services,
  onUpdateStatus,
  onReschedule,
  onAddManualBooking,
  onRefresh,
  onOpenManualBooking,
}: AdminBookingsProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  const [periodPreset, setPeriodPreset] = useState<"week" | "today" | "all">("week");

  // Расчет дат для фильтрации по умолчанию (последние 7 дней)
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

  // Модалка ручной записи (локальный fallback)
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    serviceId: services[0]?.id || "",
    date: new Date().toISOString().split("T")[0],
    time: "12:00",
    clientName: "",
    clientPhone: "+7 ",
    carModel: "",
    comment: "Запись по звонку клиента",
  });
  const [manualError, setManualError] = useState("");

  // Модалка заметок
  const [noteModalBooking, setNoteModalBooking] = useState<Booking | null>(null);
  const [noteText, setNoteText] = useState("");

  // Фильтрация и сортировка
  const filteredBookings = bookings
    .filter((b) => {
      const matchesSearch =
        !search ||
        b.clientName.toLowerCase().includes(search.toLowerCase()) ||
        b.clientPhone.includes(search) ||
        b.code.toLowerCase().includes(search.toLowerCase()) ||
        (b.carModel && b.carModel.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === "all" || b.status === statusFilter;

      // Фильтрация по периоду (по умолчанию за последнюю неделю)
      let matchesPeriod = true;
      if (dateFilter) {
        matchesPeriod = b.date === dateFilter;
      } else if (periodPreset === "today") {
        matchesPeriod = b.date === todayStr;
      } else if (periodPreset === "week") {
        matchesPeriod = b.date >= sevenDaysAgoStr;
      }

      return matchesSearch && matchesStatus && matchesPeriod;
    })
    .sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return a.time.localeCompare(b.time);
    });

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError("");
    try {
      await onAddManualBooking(manualForm);
      setShowManualModal(false);
      setManualForm({
        serviceId: services[0]?.id || "",
        date: new Date().toISOString().split("T")[0],
        time: "12:00",
        clientName: "",
        clientPhone: "",
        carModel: "",
        comment: "Запись по звонку клиента",
      });
    } catch (err: any) {
      setManualError(err.message || "Ошибка бронирования слота");
    }
  };

  const handleSaveNotes = async () => {
    if (!noteModalBooking) return;
    await onUpdateStatus(noteModalBooking.id, noteModalBooking.status, noteText);
    setNoteModalBooking(null);
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "call_requested":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
            <PhoneCall className="w-3.5 h-3.5" /> Требуется звонок
          </span>
        );
      case "new":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">Новая</span>;
      case "confirmed":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Подтверждена</span>;
      case "completed":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">Выполнена</span>;
      case "cancelled":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30">Отменена</span>;
      case "noshow":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">Неявка</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Верхняя панель: поиск, фильтры периода и статуса, кнопки действий */}
      <div className="flex flex-col gap-3">
        {/* Быстрые переключатели периода */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-brand-surface p-3 rounded-2xl border border-brand-border">
          <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-brand-border">
            <button
              type="button"
              onClick={() => { setPeriodPreset("week"); setDateFilter(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                periodPreset === "week" && !dateFilter
                  ? "bg-brand-accent text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              За последние 7 дней (по умолчанию)
            </button>
            <button
              type="button"
              onClick={() => { setPeriodPreset("today"); setDateFilter(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                periodPreset === "today" && !dateFilter
                  ? "bg-brand-accent text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Сегодня
            </button>
            <button
              type="button"
              onClick={() => { setPeriodPreset("all"); setDateFilter(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                periodPreset === "all" && !dateFilter
                  ? "bg-brand-accent text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Все даты ({bookings.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a href="/api/export" download className="inline-block">
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs rounded-xl">
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </Button>
            </a>

            {/* Большая заметная кнопка записи клиента по телефону */}
            <Button
              size="sm"
              onClick={() => onOpenManualBooking ? onOpenManualBooking() : setShowManualModal(true)}
              className="gap-2 text-xs rounded-xl font-bold bg-brand-accent hover:bg-brand-accent/90 text-white shadow-lg shadow-brand-accent/25 hover:scale-105 transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>+ Записать по звонку</span>
            </Button>
          </div>
        </div>

        {/* Поисковая строка и точные фильтры */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-theme-muted absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Поиск по имени, тел, авто, коду..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-black/40 border border-brand-border text-xs text-theme-title placeholder:text-slate-500 focus:outline-none focus:border-brand-accent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-2xl bg-black/40 border border-brand-border text-xs text-theme-title focus:outline-none focus:border-brand-accent"
          >
            <option value="all">Все статусы</option>
            <option value="call_requested">⚠️ Требуют звонка мастера</option>
            <option value="confirmed">Подтвержденные</option>
            <option value="completed">Выполненные</option>
            <option value="cancelled">Отмененные</option>
            <option value="noshow">Неявка</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-2xl bg-black/40 border border-brand-border text-xs text-theme-title focus:outline-none focus:border-brand-accent"
            title="Выбрать конкретную дату"
          />

          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="text-xs text-brand-accent hover:underline cursor-pointer whitespace-nowrap"
            >
              Сбросить дату
            </button>
          )}
        </div>
      </div>

      {/* Список заявок */}
      <div className="space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-brand-surface border border-brand-border text-theme-muted text-sm">
            Заявок по заданным критериям не найдено
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className={`p-5 rounded-3xl bg-brand-surface border transition-all space-y-4 shadow-sm ${
                b.status === "call_requested"
                  ? "border-amber-500/50 ring-1 ring-amber-500/20"
                  : "border-brand-border hover:border-brand-accent/40"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/60 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-2.5 py-1 rounded-lg">
                    {b.code}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-theme-muted">
                    <Calendar className="w-3.5 h-3.5 text-brand-accent" />
                    <span className="text-theme-title font-medium">{formatDateRu(b.date)}</span>
                    {b.date === todayStr && (
                      <span className="px-1.5 py-0.5 rounded-md bg-brand-accent/20 text-brand-accent font-bold text-[10px]">
                        Сегодня
                      </span>
                    )}
                    {b.date === tomorrowStr && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        Завтра
                      </span>
                    )}
                    {b.date === yesterdayStr && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-500/20 text-slate-400 font-bold text-[10px]">
                        Вчера
                      </span>
                    )}
                    <Clock className="w-3.5 h-3.5 text-brand-accent ml-2" />
                    <span className="text-theme-title font-bold">{b.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {b.price > 0 && (
                    <span className="font-black text-theme-title text-sm">{formatPrice(b.price)}</span>
                  )}
                  {getStatusBadge(b.status)}
                </div>
              </div>

              {/* Детали клиента и услуги */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-theme-muted block text-[11px]">Клиент:</span>
                  <strong className="text-theme-title text-sm block">{b.clientName}</strong>
                  <a
                    href={`tel:${b.clientPhone}`}
                    className="text-brand-accent hover:underline font-bold flex items-center gap-1.5 mt-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {b.clientPhone}
                  </a>
                </div>

                <div>
                  <span className="text-theme-muted block text-[11px]">Услуга:</span>
                  <span className="text-theme-title font-medium block">{b.serviceTitle}</span>
                  <span className="text-theme-muted text-[11px] flex items-center gap-1 mt-0.5">
                    <Car className="w-3 h-3" />
                    Авто: {b.carModel || "Не указан"}
                  </span>
                </div>

                <div>
                  <span className="text-theme-muted block text-[11px]">Комментарий клиента:</span>
                  <p className="text-theme-title italic text-[11px] line-clamp-2">
                    {b.comment ? `«${b.comment}»` : "Без комментария"}
                  </p>
                  {b.notes && (
                    <p className="text-amber-400 text-[11px] mt-1 font-mono">
                      Заметка: {b.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Кнопки действий над записью */}
              <div className="pt-3 border-t border-brand-border/60 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setNoteModalBooking(b);
                    setNoteText(b.notes || "");
                  }}
                  className="text-xs text-theme-muted hover:text-theme-title flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <Edit3 className="w-3.5 h-3.5 text-brand-accent" />
                  <span>{b.notes ? "Изменить заметку" : "+ Служебная заметка"}</span>
                </button>

                <div className="flex items-center gap-2">
                  {/* Кнопка быстрого звонка */}
                  <a href={`tel:${b.clientPhone}`}>
                    <Button size="sm" variant="secondary" className="h-8 px-3 text-xs gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>Позвонить</span>
                    </Button>
                  </a>

                  {b.status === "call_requested" && (
                    <Button
                      size="sm"
                      onClick={() => onUpdateStatus(b.id, "confirmed")}
                      className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" /> Звонок совершен
                    </Button>
                  )}

                  {b.status !== "completed" && b.status !== "call_requested" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onUpdateStatus(b.id, "completed")}
                      className="h-8 px-2.5 text-xs text-sky-400"
                    >
                      <Check className="w-3.5 h-3.5" /> Выполнена
                    </Button>
                  )}

                  {b.status !== "cancelled" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onUpdateStatus(b.id, "cancelled")}
                      className="h-8 px-2 text-xs text-theme-muted hover:text-red-400"
                    >
                      <Ban className="w-3.5 h-3.5 mr-1" /> Отменить
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Модальное окно ручной записи */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-theme-title">Новая запись по телефону</h3>

            {manualError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                {manualError}
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Услуга</label>
                <select
                  value={manualForm.serviceId}
                  onChange={(e) => setManualForm({ ...manualForm, serviceId: e.target.value })}
                  className="w-full h-10 px-3 rounded-2xl bg-black/40 border border-brand-border text-theme-title focus:outline-none focus:border-brand-accent"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({formatPrice(s.price)}, {s.durationMinutes} мин)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Дата"
                  type="date"
                  value={manualForm.date}
                  onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                  required
                />
                <Input
                  label="Время начала"
                  type="text"
                  placeholder="14:00"
                  value={manualForm.time}
                  onChange={(e) => setManualForm({ ...manualForm, time: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Имя клиента *"
                placeholder="Иван"
                value={manualForm.clientName}
                onChange={(e) => setManualForm({ ...manualForm, clientName: e.target.value })}
                required
              />

              <Input
                label="Телефон *"
                placeholder="+7 (999) 000-00-00"
                value={manualForm.clientPhone}
                onChange={(e) => setManualForm({ ...manualForm, clientPhone: e.target.value })}
                required
              />

              <Input
                label="Автомобиль"
                placeholder="BMW X5"
                value={manualForm.carModel}
                onChange={(e) => setManualForm({ ...manualForm, carModel: e.target.value })}
              />

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowManualModal(false)}>
                  Отмена
                </Button>
                <Button type="submit" size="sm">
                  Записать в график
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модалка заметки */}
      {noteModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-brand-surface border border-brand-border rounded-3xl p-5 space-y-3 shadow-2xl">
            <h4 className="font-bold text-theme-title text-sm">Служебная заметка к записи {noteModalBooking.code}</h4>
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Например: Пост №1, мастер Сергей, клиент просил проверить колодки"
              className="w-full rounded-2xl bg-black/40 border border-brand-border p-3 text-xs text-theme-title focus:outline-none focus:border-brand-accent resize-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button size="sm" variant="ghost" onClick={() => setNoteModalBooking(null)}>
                Отмена
              </Button>
              <Button size="sm" onClick={handleSaveNotes}>
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
