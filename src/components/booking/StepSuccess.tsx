"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, Clock3, Download, MapPin } from "lucide-react";
import { Booking, BrandSettings } from "@/lib/types";
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

  const downloadICS = () => {
    const [h, m] = booking.time.split(":").map(Number);
    const endMinutes = h * 60 + m + booking.durationMinutes;
    const pad = (n: number) => String(n).padStart(2, "0");
    const start = booking.date.replace(/-/g, "") + "T" + pad(h) + pad(m) + "00";
    const end =
      booking.date.replace(/-/g, "") + "T" + pad(Math.floor(endMinutes / 60)) + pad(endMinutes % 60) + "00";

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AutoBooking//RU",
      "BEGIN:VEVENT",
      "SUMMARY:" + booking.serviceTitle + " — " + brand.name,
      "DESCRIPTION:Бронь " + booking.code + "\\nАвтомобиль: " + (booking.carModel || "не указан"),
      "LOCATION:" + brand.address,
      "DTSTART:" + start,
      "DTEND:" + end,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "booking-" + booking.code + ".ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
          <Check className="h-6 w-6" />
        </div>
        <h2 className="heading mt-5 text-[clamp(1.6rem,3.4vw,2.2rem)] text-theme-title">
          Запись подтверждена
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-theme-muted">
          Место закреплено за вашим автомобилем. Сохраните номер брони — по нему
          можно найти запись в личном кабинете.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface">
        <div className="flex items-center justify-between gap-4 border-b border-brand-border px-5 py-4">
          <div>
            <p className="mono-label">Номер брони</p>
            <p className="mt-1 font-mono text-[19px] font-bold tracking-wide text-brand-accent">
              {booking.code}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Подтверждено
          </span>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-[14px] font-semibold leading-snug text-theme-title">
            {booking.serviceTitle}
          </p>

          <dl className="grid gap-3 text-[12px] sm:grid-cols-2">
            <div>
              <dt className="inline-flex items-center gap-1.5 text-theme-muted">
                <CalendarDays className="h-3.5 w-3.5" />
                Дата
              </dt>
              <dd className="mt-0.5 font-medium text-theme-title">{formatDateRu(booking.date)}</dd>
            </div>
            <div>
              <dt className="inline-flex items-center gap-1.5 text-theme-muted">
                <Clock3 className="h-3.5 w-3.5" />
                Время
              </dt>
              <dd className="mt-0.5 font-semibold text-brand-accent">
                {booking.time} · {formatDuration(booking.durationMinutes)}
              </dd>
            </div>
            <div>
              <dt className="text-theme-muted">Клиент</dt>
              <dd className="mt-0.5 font-medium text-theme-title">
                {booking.clientName}, {booking.clientPhone}
              </dd>
            </div>
            <div>
              <dt className="text-theme-muted">Стоимость</dt>
              <dd className="mt-0.5 font-medium text-theme-title">{formatPrice(booking.price)}</dd>
            </div>
          </dl>

          <div className="flex items-start gap-2.5 border-t border-brand-border pt-4 text-[12px] text-theme-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
            <span>
              Ждём вас: <span className="font-medium text-theme-title">{brand.address}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" onClick={downloadICS} variant="secondary" className="h-11 flex-1 text-[12px]">
          <Download className="h-4 w-4" />
          В календарь
        </Button>
        <Link
          href={getDemoHref("/account?phone=" + encodeURIComponent(booking.clientPhone))}
          className="flex-1"
        >
          <Button variant="outline" className="h-11 w-full text-[12px]">
            Мои записи
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onReset}
          className="text-[12px] text-theme-muted underline underline-offset-4 transition-colors hover:text-theme-title"
        >
          Записать ещё один автомобиль
        </button>
      </div>
    </div>
  );
}

