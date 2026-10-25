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
  const telHref = "tel:+" + cleanRaw;

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {}
  };

  return (
    <>
      <Button
        type="button"
        size={size}
        onClick={() => setIsOpen(true)}
        className={"flex items-center justify-center gap-2 " + className}
      >
        <Phone className="h-4 w-4" />
        <span>{label}</span>
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setIsOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="call-master-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-[26px] border border-brand-border bg-brand-surface p-6 shadow-2xl sm:rounded-[26px]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="call-master-title" className="text-[17px] font-semibold text-theme-title">
                  Связаться с мастером
                </h3>
                <p className="mt-1 text-[12px] leading-relaxed text-theme-muted">
                  {serviceTitle
                    ? "Уточним детали по услуге «" + serviceTitle + "»"
                    : "Подскажем по работам, срокам и стоимости"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="-mr-1 -mt-1 rounded-full p-2 text-theme-muted transition-colors hover:text-theme-title"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-brand-border bg-[var(--brand-secondary)] p-4">
              <div>
                <p className="mono-label">Телефон</p>
                <p className="mt-1 text-[18px] font-bold tracking-tight text-theme-title">{phone}</p>
              </div>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="rounded-full border border-brand-border p-2.5 text-theme-muted transition-colors hover:text-theme-title"
                title="Скопировать номер"
                aria-label="Скопировать номер"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <a href={telHref} className="mt-3 block">
              <Button size="lg" className="h-12 w-full text-sm">
                <Phone className="h-4 w-4" />
                Позвонить сейчас
              </Button>
            </a>

            <p className="mt-3 text-center text-[11px] text-theme-muted">
              {copied ? "Номер скопирован" : "Номер можно скопировать и набрать вручную"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

