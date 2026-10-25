"use client";

import React, { useState } from "react";
import { AlertCircle, ArrowLeft, CalendarDays, Check, Clock3 } from "lucide-react";
import { Service } from "@/lib/types";
import { formatPrice, formatDuration, formatDateRu } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StepClientInfoProps {
  service: Service;
  date: string;
  time: string;
  onSubmit: (clientData: {
    clientName: string;
    clientPhone: string;
    carModel: string;
    comment: string;
  }) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
  errorMessage?: string;
}

export function StepClientInfo({
  service,
  date,
  time,
  onSubmit,
  onBack,
  isSubmitting,
  errorMessage,
}: StepClientInfoProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [carModel, setCarModel] = useState("");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(true);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!name.trim()) {
      setValidationError("Укажите, пожалуйста, ваше имя");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      setValidationError("Укажите корректный номер телефона — не менее 10 цифр");
      return;
    }
    if (!consent) {
      setValidationError("Нужно согласие на обработку персональных данных");
      return;
    }

    await onSubmit({
      clientName: name.trim(),
      clientPhone: phone.trim(),
      carModel: carModel.trim(),
      comment: comment.trim(),
    });
  };

  return (
    <div className="space-y-7">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-theme-muted transition-colors hover:text-theme-title"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Назад к выбору времени
        </button>
        <p className="eyebrow mb-3">Шаг 4 из 5</p>
        <h2 className="heading text-[clamp(1.5rem,3vw,2rem)] text-theme-title">
          Осталось оставить контакты
        </h2>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-theme-muted">
          Имя и телефон — этого достаточно. Номер нужен, чтобы мастер мог уточнить
          детали и напомнить о визите.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <form onSubmit={handleSubmit} className="space-y-4">
          {(validationError || errorMessage) && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12px] text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{validationError || errorMessage}</span>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Ваше имя"
              placeholder="Например, Константин"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
            <Input
              label="Телефон"
              type="tel"
              placeholder="+7 (999) 000-00-00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              required
            />
          </div>

          <Input
            label="Марка и модель автомобиля (необязательно)"
            placeholder="BMW 530d, Audi A6…"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
          />

          <div className="space-y-1.5">
            <label htmlFor="booking-comment" className="block text-xs font-medium text-theme-muted">
              Комментарий мастеру (необязательно)
            </label>
            <textarea
              id="booking-comment"
              rows={3}
              placeholder="Свои расходники, жалобы на автомобиль, пожелания по времени…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full resize-none rounded-xl border border-brand-border bg-[var(--brand-secondary)] px-4 py-3 text-sm text-theme-title transition-colors placeholder:text-theme-muted/60 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/15"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 pt-1">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-brand-border bg-[var(--brand-secondary)] text-brand-accent focus:ring-brand-accent"
            />
            <span className="text-[11.5px] leading-relaxed text-theme-muted">
              Согласен на обработку персональных данных для оформления записи
              и уведомлений о статусе визита.
            </span>
          </label>

          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            className="mt-2 h-12 w-full text-[13px] sm:w-auto sm:px-8"
          >
            Подтвердить запись
            <Check className="h-4 w-4" />
          </Button>
        </form>

        <aside className="h-fit rounded-2xl border border-brand-border bg-brand-surface p-5 lg:sticky lg:top-24">
          <p className="mono-label mb-4">Ваш визит</p>

          <p className="text-[14px] font-semibold leading-snug text-theme-title">
            {service.title}
          </p>

          <dl className="mt-4 space-y-2.5 border-y border-brand-border py-4 text-[12px]">
            <div className="flex items-center justify-between gap-3">
              <dt className="inline-flex items-center gap-1.5 text-theme-muted">
                <CalendarDays className="h-3.5 w-3.5" />
                Дата
              </dt>
              <dd className="font-medium text-theme-title">{formatDateRu(date)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="inline-flex items-center gap-1.5 text-theme-muted">
                <Clock3 className="h-3.5 w-3.5" />
                Время
              </dt>
              <dd className="font-semibold text-brand-accent">{time}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-theme-muted">Длительность</dt>
              <dd className="font-medium text-theme-title">{formatDuration(service.durationMinutes)}</dd>
            </div>
          </dl>

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-[12px] text-theme-muted">Итого</span>
            <span className="text-[20px] font-bold text-theme-title">{formatPrice(service.price)}</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-theme-muted">
            Оплата — после выполнения работ. Предоплата не требуется.
          </p>
        </aside>
      </div>
    </div>
  );
}

