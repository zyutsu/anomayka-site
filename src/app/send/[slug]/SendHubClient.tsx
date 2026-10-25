"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
  MessageSquare,
  Send,
  Smartphone,
  Sparkles,
} from "lucide-react";

interface SendHubClientProps {
  slug: string;
  name: string;
  city: string;
  phone: string;
  cleanPhone: string;
  address: string;
  logo?: string;
  shortUrl: string;
  safePitch: string;
  fullPitch: string;
}

export default function SendHubClient({
  slug,
  name,
  city,
  phone,
  cleanPhone,
  address,
  logo,
  shortUrl,
  safePitch,
  fullPitch,
}: SendHubClientProps) {
  const [mode, setMode] = useState<"safe" | "full">("safe");
  const [copied, setCopied] = useState<"safe" | "full" | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const absoluteShort = (origin || "") + shortUrl;
  const rawPitch = mode === "safe" ? safePitch : fullPitch;
  // В тексте для мессенджера всегда нужна полная ссылка, а не путь /d/slug.
  const pitch = origin ? rawPitch.split(shortUrl).join(absoluteShort) : rawPitch;

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (e) {
      const area = document.createElement("textarea");
      area.value = value;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }
    setCopied(mode);
    setTimeout(() => setCopied(null), 2500);
  };

  const waUrl = cleanPhone
    ? "https://api.whatsapp.com/send?phone=" + cleanPhone + "&text=" + encodeURIComponent(pitch)
    : "https://api.whatsapp.com/send?text=" + encodeURIComponent(pitch);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-14">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="mono-label">Хаб отправки · {slug}</p>
        <a
          href={absoluteShort}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-theme-muted transition-colors hover:text-theme-title"
        >
          Посмотреть демо
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="overflow-hidden rounded-[26px] border border-brand-border bg-brand-surface">
        <div className="flex items-center gap-4 border-b border-brand-border p-5">
          {logo ? (
            <img
              src={logo}
              alt={name}
              className="h-14 w-14 shrink-0 rounded-2xl border border-brand-border bg-[var(--brand-secondary)] object-contain p-1"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-brand-border bg-[var(--brand-secondary)] text-lg font-bold text-brand-accent">
              {name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-[18px] font-bold tracking-tight text-theme-title">{name}</h1>
            <p className="truncate text-[12px] text-theme-muted">
              {[city, phone].filter(Boolean).join(" · ") || address}
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-[12px] leading-relaxed text-theme-title">
              Текст с персональной ссылкой готов. Откройте WhatsApp или Telegram —
              вставьте сообщение и отправьте в один клик.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-600 text-[13px] font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              <MessageSquare className="h-4 w-4" />
              Написать клиенту в WhatsApp
            </a>
            <a
              href={"/tg/" + slug}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#229ED9] text-[13px] font-semibold text-white transition-colors hover:bg-[#1b8dc4]"
            >
              <Send className="h-4 w-4" />
              Отправить демо в Telegram
            </a>
          </div>

            <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => copy(pitch)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-brand-border text-[12px] font-medium text-theme-title transition-colors hover:border-brand-accent/50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Скопировано" : "Скопировать текст"}
            </button>
            <a
              href={"/tg/" + slug}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-brand-border text-[12px] font-medium text-theme-title transition-colors hover:border-brand-accent/50"
            >
              <Smartphone className="h-3.5 w-3.5" />
              Показать клиенту его сайт
            </a>
          </div>

          <div className="border-t border-brand-border pt-4">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <p className="text-[12px] font-medium text-theme-title">Текст сообщения</p>
              <div className="flex rounded-full border border-brand-border p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setMode("safe")}
                  className={
                    "rounded-full px-3 py-1 font-medium transition-colors " +
                    (mode === "safe" ? "bg-theme-title text-brand-primary" : "text-theme-muted")
                  }
                >
                  Короткий
                </button>
                <button
                  type="button"
                  onClick={() => setMode("full")}
                  className={
                    "rounded-full px-3 py-1 font-medium transition-colors " +
                    (mode === "full" ? "bg-theme-title text-brand-primary" : "text-theme-muted")
                  }
                >
                  Полный
                </button>
              </div>
            </div>

            <div
              onClick={() => copy(pitch)}
              className="max-h-[260px] cursor-pointer overflow-y-auto whitespace-pre-wrap rounded-2xl border border-brand-border bg-[var(--brand-primary)] p-4 text-[12px] leading-relaxed text-theme-muted"
              title="Нажмите, чтобы скопировать"
            >
              {pitch}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-border pt-4 text-[12px]">
            <span className="text-theme-muted">Персональный сайт</span>
            <a
              href={absoluteShort}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-brand-accent"
            >
              {slug}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

