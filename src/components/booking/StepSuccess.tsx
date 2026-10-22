"use client";

import React from "react";
import Link from "next/link";
import { Booking, BrandSettings } from "@/lib/types";
import { CheckCircle2, Calendar, Clock, MapPin, Download, ArrowRight, UserCheck, MessageSquare } from "lucide-react";
import { formatPrice, formatDuration, formatDateRu } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useBrand } from "@/context/BrandContext";

interface StepSuccessProps {
  booking: Booking;
  brand: BrandSettings;
  onReset: () => void;
}

export function StepSuccess({ booking, brand, onReset }: StepSuccessProps) {
  const brandCtx = useBrand();
  const getDemoHref = brandCtx?.getDemoHref || ((p: string) => p);
  // Генерация iCalendar файла (.ics) для добавления события в Apple/Google Calendar
  const downloadICS = () => {
    const startDateStr = `${booking.date.replace(/-/g, "")}T${booking.time.replace(":", "")}00`;
    // Расчет времени окончания
    const [h, m] = booking.time.split(":").map(Number);
    const endMinutes = h * 60 + m + booking.durationMinutes;
    const endH = Math.floor(endMinutes / 60).toString().padStart(2, "0");
    const endM = (endMinutes % 60).toString().padStart(2, "0");
    const endDateStr = `${booking.date.replace(/-/g, "")}T${endH}${endM}00`;

    const icsData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ANOMAYKA Auto Booking//RU",
      "BEGIN:VEVENT",
      `SUMMARY:${booking.serviceTitle} — ${brand.name}`,
      `DESCRIPTION:Бронь #${booking.code}\\nУслуга: ${booking.serviceTitle}\\nАвтомобиль: ${booking.carModel || "Не указан"}\\nСтоимость: ${booking.price} руб.`,
      `LOCATION:${brand.address}`,
      `DTSTART:${startDateStr}`,
      `DTEND:${endDateStr}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `anomayka-booking-${booking.code}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-xl mx-auto py-6 space-y-8 animate-in fade-in-50 zoom-in-95 duration-300">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-brand-accent/15 border border-brand-accent/30 mx-auto flex items-center justify-center text-brand-accent shadow-xl shadow-brand-accent/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Запись успешно подтверждена!
        </h2>
        <p className="text-sm text-slate-300">
          Мы забронировали пост сервиса за вашим автомобилем. Слот гарантированно закреплен.
        </p>
      </div>

      {/* Карточка талона записи */}
      <div className="rounded-2xl bg-brand-surface border border-brand-accent/30 p-6 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-brand-accent/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Номер бронирования
            </span>
            <span className="text-2xl font-black text-brand-accent tracking-widest font-mono">
              {booking.code}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Статус
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Подтверждено
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Услуга:</span>
            <strong className="text-white text-sm block">{booking.serviceTitle}</strong>
            <span className="text-slate-400 text-[11px]">
              {formatDuration(booking.durationMinutes)} • {formatPrice(booking.price)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Дата и время:</span>
            <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
              <Calendar className="w-4 h-4 text-brand-accent" />
              <span>{formatDateRu(booking.date)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-accent font-bold mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{booking.time}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Клиент:</span>
            <strong className="text-white block">{booking.clientName}</strong>
            <span className="text-slate-400">{booking.clientPhone}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Автомобиль:</span>
            <strong className="text-white block">
              {booking.carModel || "Уточняется при визите"}
            </strong>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-start gap-2.5 text-xs text-slate-400">
          <MapPin className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
          <span>
            Ждем вас по адресу: <strong className="text-white">{brand.address}</strong>
          </span>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={downloadICS}
          variant="secondary"
          className="flex-1 justify-center gap-2 text-xs"
        >
          <Download className="w-4 h-4 text-brand-accent" />
          <span>Добавить в календарь (.ics)</span>
        </Button>

        <Link
          href={getDemoHref(`/account?phone=${encodeURIComponent(booking.clientPhone)}`)}
          className="flex-1"
        >
          <Button variant="outline" className="w-full justify-center gap-2 text-xs">
            <UserCheck className="w-4 h-4 text-brand-accent" />
            <span>Личный кабинет</span>
          </Button>
        </Link>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-white underline underline-offset-4 cursor-pointer"
        >
          Оформить еще одну запись на другой автомобиль
        </button>
      </div>
    </div>
  );
}
