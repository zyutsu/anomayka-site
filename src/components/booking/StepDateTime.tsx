"use client";

import React, { useState, useEffect } from "react";
import { Service } from "@/lib/types";
import { Calendar as CalendarIcon, Clock, ArrowLeft, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StepDateTimeProps {
  service: Service;
  selectedDate: string;
  selectedTime: string;
  onSelectDateTime: (date: string, time: string) => void;
  onBack: () => void;
}

interface SlotItem {
  time: string;
  available: boolean;
  reason?: string;
}

export function StepDateTime({
  service,
  selectedDate,
  selectedTime,
  onSelectDateTime,
  onBack,
}: StepDateTimeProps) {
  // Генерация ближайших 14 дней
  const generateDates = () => {
    const dates = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      const dayOfWeek = d.toLocaleDateString("ru-RU", { weekday: "short" });
      const dayNum = d.getDate();
      const month = d.toLocaleDateString("ru-RU", { month: "short" });
      dates.push({ iso, dayOfWeek, dayNum, month, isToday: i === 0 });
    }
    return dates;
  };

  const datesList = generateDates();
  const [currentDate, setCurrentDate] = useState<string>(
    selectedDate || datesList[0].iso
  );
  const [currentTime, setCurrentTime] = useState<string>(selectedTime || "");
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(true);

  // Загрузка слотов при смене даты или услуги
  useEffect(() => {
    let isCancelled = false;

    async function fetchSlots() {
      setIsLoadingSlots(true);
      try {
        const res = await fetch(
          `/api/slots?date=${currentDate}&duration=${service.durationMinutes}`
        );
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            setSlots(data.slots || []);
          }
        }
      } catch (err) {
        console.error("Ошибка получения слотов:", err);
      } finally {
        if (!isCancelled) {
          setIsLoadingSlots(false);
        }
      }
    }

    fetchSlots();

    return () => {
      isCancelled = true;
    };
  }, [currentDate, service.durationMinutes]);

  const handleDateClick = (iso: string) => {
    setCurrentDate(iso);
    setCurrentTime(""); // сбрасываем время при смене даты
  };

  const handleTimeClick = (timeStr: string) => {
    setCurrentTime(timeStr);
  };

  const handleProceed = () => {
    if (currentDate && currentTime) {
      onSelectDateTime(currentDate, currentTime);
    }
  };

  // Группировка слотов: утро (до 13:00), день (13:00-17:00), вечер (после 17:00)
  const morningSlots = slots.filter((s) => parseInt(s.time.split(":")[0], 10) < 13);
  const afternoonSlots = slots.filter((s) => {
    const h = parseInt(s.time.split(":")[0], 10);
    return h >= 13 && h < 17;
  });
  const eveningSlots = slots.filter((s) => parseInt(s.time.split(":")[0], 10) >= 17);

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Назад к услугам
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Шаг 3. Выберите дату и время визита
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
          <span>Услуга: <strong className="text-white">{service.title}</strong></span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="text-brand-accent font-medium">
            Длительность: {formatDuration(service.durationMinutes)}
          </span>
        </div>
      </div>

      {/* Горизонтальный скроллер дней */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Дата записи
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          {datesList.map((item) => {
            const isSelected = item.iso === currentDate;
            return (
              <button
                key={item.iso}
                onClick={() => handleDateClick(item.iso)}
                className={`flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer snap-start shrink-0 ${
                  isSelected
                    ? "bg-brand-accent border-brand-accent text-white shadow-lg shadow-brand-accent/30 font-bold scale-[1.03]"
                    : "bg-brand-surface border-white/10 hover:border-white/20 text-slate-300 hover:text-white"
                }`}
              >
                <span className="text-[11px] uppercase tracking-wider opacity-80">
                  {item.isToday ? "Сегодня" : item.dayOfWeek}
                </span>
                <span className="text-lg font-black my-0.5">{item.dayNum}</span>
                <span className="text-[10px] opacity-75">{item.month}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Сетка времени */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Доступное время начала
          </label>
          <span className="text-xs text-slate-400">
            Окна с учетом длительности {formatDuration(service.durationMinutes)}
          </span>
        </div>

        {isLoadingSlots ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Рассчитываем свободные интервалы...</span>
          </div>
        ) : slots.length === 0 ? (
          <div className="py-10 text-center bg-white/5 rounded-2xl border border-white/10 text-slate-400 text-sm">
            На выбранную дату нет свободных слотов. Пожалуйста, выберите другой день.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Утро */}
            {morningSlots.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Утро
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {morningSlots.map((s) => renderSlotButton(s))}
                </div>
              </div>
            )}

            {/* День */}
            {afternoonSlots.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  День
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {afternoonSlots.map((s) => renderSlotButton(s))}
                </div>
              </div>
            )}

            {/* Вечер */}
            {eveningSlots.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Вечер
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {eveningSlots.map((s) => renderSlotButton(s))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Кнопка перехода к следующему шагу */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          {currentTime ? (
            <span className="text-white font-medium">
              Выбрано: <strong>{currentDate}</strong> в <strong>{currentTime}</strong>
            </span>
          ) : (
            <span>Выберите удобное свободное время</span>
          )}
        </div>

        <Button
          onClick={handleProceed}
          disabled={!currentTime}
          size="lg"
          className="gap-2.5 h-14 px-8 text-base font-bold rounded-2xl shadow-xl shadow-brand-accent/25 hover:scale-[1.02] transition-all"
        >
          <span>Далее: Контакты</span>
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );

  function renderSlotButton(slot: SlotItem) {
    const isSelected = currentTime === slot.time;
    const isAvailable = slot.available;

    return (
      <button
        key={slot.time}
        type="button"
        disabled={!isAvailable}
        onClick={() => handleTimeClick(slot.time)}
        className={`h-11 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer border ${
          isSelected
            ? "bg-brand-accent border-brand-accent text-white shadow-md shadow-brand-accent/30 scale-105"
            : isAvailable
            ? "bg-brand-surface border-white/10 hover:border-brand-accent text-white hover:bg-brand-surface/90"
            : "bg-black/30 border-white/5 text-slate-600 line-through cursor-not-allowed"
        }`}
        title={!isAvailable ? slot.reason || "Занято" : undefined}
      >
        {slot.time}
      </button>
    );
  }
}
