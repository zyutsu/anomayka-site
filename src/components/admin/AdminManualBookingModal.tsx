"use client";

import React, { useState, useMemo } from "react";
import { Service } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneCall, Calendar, Clock, User, Phone, Car, FileText, CheckCircle2, X } from "lucide-react";

interface AdminManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  onSubmit: (formData: any) => Promise<void>;
}

export function AdminManualBookingModal({
  isOpen,
  onClose,
  services,
  onSubmit,
}: AdminManualBookingModalProps) {
  const activeServices = useMemo(() => services.filter((s) => s.isActive), [services]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);
  const dayAfterStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  }, []);

  const [serviceId, setServiceId] = useState(activeServices[0]?.id || "");
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState("12:00");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("+7 ");
  const [carModel, setCarModel] = useState("");
  const [comment, setComment] = useState("Запись по звонку клиента");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const selectedService = useMemo(
    () => activeServices.find((s) => s.id === serviceId) || activeServices[0],
    [activeServices, serviceId]
  );

  // Расчет времени окончания визита
  const calculatedEndTime = useMemo(() => {
    if (!time || !selectedService) return "";
    const [hours, minutes] = time.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return "";
    const duration = selectedService.durationMinutes || 30;
    const totalMinutes = hours * 60 + minutes + duration;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
  }, [time, selectedService]);

  const quickTimes = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
    "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!clientName.trim()) {
      setError("Укажите имя клиента");
      return;
    }

    if (!clientPhone || clientPhone.trim().length < 6) {
      setError("Укажите контактный номер телефона");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        serviceId: selectedService?.id || activeServices[0]?.id,
        date,
        time,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        carModel: carModel.trim() || undefined,
        comment: comment.trim() || "Запись по звонку клиента",
        status: "confirmed",
      });

      setSuccessMsg("Запись успешно добавлена в график!");
      setTimeout(() => {
        onClose();
        setSuccessMsg("");
        setClientName("");
        setClientPhone("+7 ");
        setCarModel("");
        setComment("Запись по звонку клиента");
      }, 700);
    } catch (err: any) {
      setError(err.message || "Ошибка при создании записи");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-brand-surface border border-brand-border rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Кнопка закрытия крестик */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-white p-1 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          title="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Заголовок формы */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center text-brand-accent shadow-md shadow-brand-accent/20 shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-theme-title tracking-tight">
              Запись по звонку клиента
            </h3>
            <p className="text-xs text-theme-muted mt-0.5">
              Внесите данные звонка для мгновенного бронирования слота в графике
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Выбор услуги и расчет времени */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-black/40 border border-brand-border">
            <label className="block font-bold text-theme-title text-xs">
              1. Выберите услугу
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-brand-surface border border-brand-border text-theme-title font-medium text-xs focus:outline-none focus:border-brand-accent cursor-pointer"
            >
              {activeServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} — {formatPrice(s.price)} ({s.durationMinutes} мин)
                </option>
              ))}
            </select>

            {/* Автоматический расчет времени и стоимости */}
            {selectedService && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-theme-muted border-t border-white/5">
                <span className="font-semibold text-brand-accent">
                  Стоимость: {formatPrice(selectedService.price)}
                </span>
                <span>
                  Длительность: <strong>{selectedService.durationMinutes} мин</strong>
                </span>
                {calculatedEndTime && (
                  <span className="text-slate-300">
                    Окно визита: <strong className="text-white font-mono">{time} – {calculatedEndTime}</strong>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 2. Дата визита */}
          <div className="space-y-2">
            <label className="block font-bold text-theme-title text-xs">
              2. Дата визита
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDate(todayStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  date === todayStr
                    ? "bg-brand-accent border-brand-accent text-white shadow-sm"
                    : "bg-black/30 border-brand-border text-slate-300 hover:text-white"
                }`}
              >
                Сегодня
              </button>
              <button
                type="button"
                onClick={() => setDate(tomorrowStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  date === tomorrowStr
                    ? "bg-brand-accent border-brand-accent text-white shadow-sm"
                    : "bg-black/30 border-brand-border text-slate-300 hover:text-white"
                }`}
              >
                Завтра
              </button>
              <button
                type="button"
                onClick={() => setDate(dayAfterStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  date === dayAfterStr
                    ? "bg-brand-accent border-brand-accent text-white shadow-sm"
                    : "bg-black/30 border-brand-border text-slate-300 hover:text-white"
                }`}
              >
                Послезавтра
              </button>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-black/40 border border-brand-border text-xs text-theme-title focus:outline-none focus:border-brand-accent cursor-pointer"
                required
              />
            </div>
          </div>

          {/* 3. Время визита */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-theme-title text-xs">
                3. Время визита
              </label>
              <span className="text-[11px] text-theme-muted">
                Расчетное окончание: <strong className="text-brand-accent font-mono">{calculatedEndTime || time}</strong>
              </span>
            </div>

            {/* Быстрые чипы времени в 1 тап */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {quickTimes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTime(t)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer text-center ${
                    time === t
                      ? "bg-brand-accent border-brand-accent text-white shadow-sm"
                      : "bg-black/30 border-brand-border text-slate-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="pt-1 flex items-center gap-2">
              <span className="text-[11px] text-theme-muted">Другое точное время:</span>
              <input
                type="text"
                placeholder="14:30"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-24 px-2.5 py-1 rounded-lg bg-black/40 border border-brand-border text-xs font-mono text-theme-title text-center focus:outline-none focus:border-brand-accent"
                required
              />
            </div>
          </div>

          {/* 4. Данные клиента и авто */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Input
              label="Имя клиента *"
              placeholder="Например: Иван"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />

            <Input
              label="Телефон клиента *"
              placeholder="+7 (999) 000-00-00"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              required
            />
          </div>

          <Input
            label="Марка и модель авто"
            placeholder="Например: BMW X5, г/н А123ВС"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
          />

          {/* 5. Комментарий мастера */}
          <div className="space-y-1">
            <label className="block text-theme-muted font-medium text-[11px]">
              Комментарий мастера (автоматически подставляется):
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Примечание мастера..."
              className="w-full rounded-2xl bg-black/40 border border-brand-border p-3 text-xs text-theme-title focus:outline-none focus:border-brand-accent resize-none"
            />
          </div>

          {/* Кнопки действий */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-brand-border/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              className="font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-brand-accent/25 hover:scale-[1.02] transition-all gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Записать в график</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
