"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { Service } from "@/lib/types";
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

/** Локальная дата в формате YYYY-MM-DD (без сдвига часового пояса). */
function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

function buildDates() {
  const today = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    return {
      iso: toIsoDate(d),
      weekday: d.toLocaleDateString("ru-RU", { weekday: "short" }).replace(".", ""),
      day: d.getDate(),
      month: d.toLocaleDateString("ru-RU", { month: "short" }).replace(".", ""),
      isToday: i === 0,
    };
  });
}

export function StepDateTime({
  service,
  selectedDate,
  selectedTime,
  onSelectDateTime,
  onBack,
}: StepDateTimeProps) {
  const dates = React.useMemo(buildDates, []);
  const [currentDate, setCurrentDate] = useState(selectedDate || dates[0].iso);
  const [currentTime, setCurrentTime] = useState(selectedTime || "");
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch("/api/slots?date=" + currentDate + "&duration=" + service.durationMinutes)
      .then((res) => (res.ok ? res.json() : { slots: [] }))
      .then((data) => {
        if (!cancelled) setSlots(data.slots || []);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentDate, service.durationMinutes]);

  const groups = [
    { label: "Утро", items: slots.filter((s) => Number(s.time.slice(0, 2)) < 12) },
    { label: "День", items: slots.filter((s) => Number(s.time.slice(0, 2)) >= 12 && Number(s.time.slice(0, 2)) < 17) },
    { label: "Вечер", items: slots.filter((s) => Number(s.time.slice(0, 2)) >= 17) },
  ].filter((g) => g.items.length > 0);

  const freeCount = slots.filter((s) => s.available).length;

  return (
    <div className="space-y-7">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-theme-muted transition-colors hover:text-theme-title"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Назад к услугам
        </button>
        <p className="eyebrow mb-3">Шаг 3 из 5</p>
        <h2 className="heading text-[clamp(1.5rem,3vw,2rem)] text-theme-title">
          Когда вам удобно?
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-theme-muted">
          {service.title} · {formatDuration(service.durationMinutes)}
        </p>
      </div>

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-[12px] font-medium text-theme-title">Дата</p>
          <p className="text-[11px] text-theme-muted">Ближайшие 14 дней</p>
        </div>
        <div className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 scrollbar-none sm:mx-0 sm:px-0">
          {dates.map((item) => {
            const active = item.iso === currentDate;
            return (
              <button
                key={item.iso}
                type="button"
                onClick={() => {
                  setCurrentDate(item.iso);
                  setCurrentTime("");
                }}
                className={
                  "flex w-[62px] shrink-0 flex-col items-center rounded-xl border py-2.5 transition-colors " +
                  (active
                    ? "border-transparent bg-theme-title text-brand-primary"
                    : "border-brand-border bg-brand-surface text-theme-title hover:border-brand-accent/50")
                }
              >
                <span className={"text-[10px] uppercase " + (active ? "opacity-70" : "text-theme-muted")}>
                  {item.isToday ? "сегодня" : item.weekday}
                </span>
                <span className="my-0.5 text-[17px] font-bold leading-none">{item.day}</span>
                <span className={"text-[10px] " + (active ? "opacity-70" : "text-theme-muted")}>
                  {item.month}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-[12px] font-medium text-theme-title">Время начала</p>
          {!loading && (
            <p className="text-[11px] text-theme-muted">
              {freeCount > 0 ? "свободно окон: " + freeCount : "нет свободных окон"}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-brand-border bg-brand-surface py-10 text-[12px] text-theme-muted">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
            Проверяем расписание…
          </div>
        ) : slots.length === 0 ? (
          <div className="rounded-2xl border border-brand-border bg-brand-surface px-5 py-8 text-center">
            <CalendarDays className="mx-auto h-6 w-6 text-theme-muted" />
            <p className="mt-3 text-[13px] font-medium text-theme-title">На этот день записи нет</p>
            <p className="mt-1 text-[12px] text-theme-muted">Выберите другую дату или позвоните мастеру.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="mono-label mb-2">{group.label}</p>
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-8">
                  {group.items.map((slot) => {
                    const active = slot.time === currentTime;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setCurrentTime(slot.time)}
                        title={!slot.available ? slot.reason || "Занято" : undefined}
                        className={
                          "h-10 rounded-xl border text-[12px] font-semibold transition-colors " +
                          (active
                            ? "border-transparent bg-brand-accent text-white"
                            : slot.available
                            ? "border-brand-border bg-brand-surface text-theme-title hover:border-brand-accent/60"
                            : "cursor-not-allowed border-transparent bg-[var(--brand-secondary)] text-theme-muted/40 line-through")
                        }
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-brand-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-2 text-[12px] text-theme-muted">
          <Clock3 className="h-4 w-4 text-brand-accent" />
          {currentTime ? (
            <span>
              Выбрано: <strong className="font-semibold text-theme-title">{currentTime}</strong>
            </span>
          ) : (
            "Выберите удобное время"
          )}
        </p>

        <Button
          type="button"
          onClick={() => currentTime && onSelectDateTime(currentDate, currentTime)}
          disabled={!currentTime}
          size="lg"
          className="h-12 w-full text-[13px] sm:w-auto"
        >
          Продолжить
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

