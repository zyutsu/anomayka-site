"use client";

import React, { useState } from "react";
import { Phone, X, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallMasterModalProps {
  phone: string;
  phoneRaw?: string;
  serviceTitle?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function CallMasterModal({
  phone,
  phoneRaw,
  serviceTitle,
  size = "md",
  className = "",
  label = "Позвонить мастеру",
}: CallMasterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const cleanRaw = (phoneRaw || phone || "").replace(/\D/g, "");
  const telHref = `tel:+${cleanRaw}`;

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // Игнорируем ошибку буфера обмена
    }
  };

  return (
    <>
      <Button
        type="button"
        size={size}
        onClick={() => setIsOpen(true)}
        className={`font-bold rounded-2xl shadow-md shadow-brand-accent/20 flex items-center justify-center gap-2 ${className}`}
      >
        <Phone className="w-4 h-4 text-white" />
        <span>{label}</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-theme-muted hover:text-theme-title hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-accent/15 border border-brand-accent/30 text-brand-accent flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-theme-title">Связь с мастером</h3>
                <p className="text-xs text-theme-muted">
                  {serviceTitle ? `Услуга: «${serviceTitle}»` : "Прямая консультация и запись"}
                </p>
              </div>
            </div>

            <p className="text-xs text-theme-muted leading-relaxed">
              Данная услуга требует предварительного согласования деталей и объема работ с мастером. Позвоните нам напрямую для моментальной консультации и бронирования бокса:
            </p>

            {/* Блок с номером телефона */}
            <div className="p-4 rounded-2xl bg-black/40 border border-brand-border flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-theme-muted uppercase tracking-wider block">
                  Телефон автоцентра
                </span>
                <span className="text-lg sm:text-xl font-black text-theme-title tracking-wide">
                  {phone}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-theme-muted hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Скопировать номер"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Кнопка прямого звонка */}
            <div className="space-y-2 pt-1">
              <a href={telHref} className="block w-full">
                <Button size="lg" className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-brand-accent/25 flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" />
                  <span>Набрать номер мастера</span>
                </Button>
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="w-full text-xs text-theme-muted hover:text-white"
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
