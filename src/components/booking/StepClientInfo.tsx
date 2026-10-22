"use client";

import React, { useState } from "react";
import { Service } from "@/lib/types";
import { ArrowLeft, ShieldCheck, Check, Clock, Calendar, AlertCircle } from "lucide-react";
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
      setValidationError("Пожалуйста, укажите ваше имя");
      return;
    }

    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setValidationError("Пожалуйста, укажите корректный номер телефона (не менее 10 цифр)");
      return;
    }

    if (!consent) {
      setValidationError("Необходимо согласие на обработку персональных данных");
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
    <div className="space-y-6">
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Назад к выбору времени
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Шаг 4. Контактные данные
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          На этот номер придет подтверждение бронирования и ссылка для управления записью
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Форма ввода */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
          {(validationError || errorMessage) && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{validationError || errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ваше имя *"
              placeholder="Константин"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Номер телефона *"
              type="tel"
              placeholder="+7 (999) 000-00-00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <Input
            label="Марка и модель автомобиля"
            placeholder="Например: BMW 530d или Audi A6 (желательно)"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Комментарий или пожелания мастеру
            </label>
            <textarea
              rows={3}
              placeholder="Дополнительные пожелания, свои расходники, жалобы на авто..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all resize-none"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 rounded border-white/20 text-brand-accent focus:ring-brand-accent h-4 w-4 bg-black/40"
            />
            <span className="text-xs text-slate-400 leading-relaxed select-none">
              Я даю согласие на обработку персональных данных и получение уведомлений о статусе бронирования в соответствии с законом №152-ФЗ.
            </span>
          </label>

          <div className="pt-4">
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              className="w-full sm:w-auto h-15 px-10 text-base sm:text-lg font-black rounded-2xl shadow-2xl shadow-brand-accent/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <span>Подтвердить запись</span>
              <Check className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </form>

        {/* Сводка заказа (Сайдбар) */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-brand-surface border border-white/10 p-5 space-y-4 sticky top-24 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Детали визита
            </h3>

            <div className="space-y-3 text-xs border-y border-white/10 py-4">
              <div>
                <span className="text-slate-400 block text-[11px]">Услуга:</span>
                <span className="font-semibold text-white text-sm">{service.title}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Длительность:</span>
                <span className="font-medium text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-accent" />
                  {formatDuration(service.durationMinutes)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Дата:</span>
                <span className="font-medium text-white flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-accent" />
                  {formatDateRu(date)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Время начала:</span>
                <span className="font-bold text-brand-accent text-sm">{time}</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-slate-300 font-medium text-xs">Итого к оплате:</span>
              <span className="text-xl font-extrabold text-white">
                {formatPrice(service.price)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Оплата производится в кассе автоцентра после завершения и приемки работ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
