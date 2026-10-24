'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Send, 
  MessageSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Share2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [copiedType, setCopiedType] = useState<'safe' | 'full' | null>(null);
  const [pitchMode, setPitchMode] = useState<'safe' | 'full'>('safe');

  const currentPitch = pitchMode === 'safe' ? safePitch : fullPitch;

  // Автоматическое копирование при открытии страницы
  useEffect(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(safePitch).then(() => {
        setCopiedType('safe');
        setTimeout(() => setCopiedType(null), 3000);
      }).catch(() => {});
    }
  }, [safePitch]);

  const handleCopy = async (type: 'safe' | 'full') => {
    try {
      const textToCopy = type === 'safe' ? safePitch : fullPitch;
      await navigator.clipboard.writeText(textToCopy);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 3000);
    } catch (e) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = type === 'safe' ? safePitch : fullPitch;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 3000);
    }
  };

  // WhatsApp ссылки
  const waDirectUrl = cleanPhone 
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(currentPitch)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(currentPitch)}`;

  const waWebUrl = cleanPhone
    ? `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(currentPitch)}`
    : `https://web.whatsapp.com/send?text=${encodeURIComponent(currentPitch)}`;

  // Telegram ссылки
  const tgDirectUrl = cleanPhone ? `tg://resolve?phone=${cleanPhone}` : `https://t.me/share/url?url=${encodeURIComponent(shortUrl)}&text=${encodeURIComponent(currentPitch)}`;
  const tgShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shortUrl)}&text=${encodeURIComponent(currentPitch)}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-rose-500 selection:text-white">
      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        
        {/* Шапка карточки автосервиса */}
        <div className="flex items-start gap-4 pb-4 border-b border-slate-800">
          {logo ? (
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
              <img src={logo} alt={name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-2xl text-white flex-shrink-0 shadow-lg">
              {name.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Хаб отправки
              </span>
              {copiedType && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-fade-in">
                  <Check className="w-3 h-3 stroke-[3]" />
                  Текст в буфере!
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white truncate mt-1">
              {name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
              {city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {city}
                </span>
              )}
              {phone && (
                <span className="flex items-center gap-1 font-mono text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  {phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Уведомление о буфере обмена */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-200 leading-relaxed">
            <span className="font-bold text-emerald-300">Сообщение уже скопировано в буфер!</span> Если при открытии чата WhatsApp/Telegram строка сообщения останется пустой — просто нажмите <kbd className="px-1.5 py-0.5 bg-black/40 rounded border border-emerald-500/30 font-mono text-white">Ctrl+V</kbd> или «Вставить».
          </div>
        </div>

        {/* Главные кнопки мгновенной отправки */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Действия в 1 клик:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* WhatsApp */}
            <a
              href={waDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold shadow-lg shadow-emerald-950/40 border border-emerald-500/30 transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Открыть в WhatsApp</span>
            </a>

            {/* Telegram */}
            <a
              href={tgDirectUrl}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold shadow-lg shadow-sky-950/40 border border-sky-500/30 transition-all"
            >
              <Send className="w-5 h-5" />
              <span>Открыть в Telegram</span>
            </a>
          </div>

          {/* Дополнительные действия */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleCopy(pitchMode)}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-semibold transition-all"
            >
              {copiedType ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-300">Скопировано!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Скопировать текст</span>
                </>
              )}
            </button>

            <a
              href={tgShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-semibold transition-all"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Поделиться текстом</span>
            </a>
          </div>
        </div>

        {/* Текст сообщения для копирования */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Текст сообщения:</span>
            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[11px]">
              <button
                onClick={() => setPitchMode('safe')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                  pitchMode === 'safe' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Короткое (быстрое)
              </button>
              <button
                onClick={() => setPitchMode('full')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                  pitchMode === 'full' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Полное
              </button>
            </div>
          </div>

          <div 
            onClick={() => handleCopy(pitchMode)}
            className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans cursor-pointer hover:border-slate-700 transition-colors relative group select-all"
          >
            {currentPitch}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/90 px-2 py-1 rounded text-[10px] text-slate-300 border border-slate-700 flex items-center gap-1">
              <Copy className="w-3 h-3" />
              <span>Кликните для копирования</span>
            </div>
          </div>
        </div>

        {/* Кнопка перехода на персональный сайт */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-500">Персональный сайт автосервиса:</span>
          <Link
            href={shortUrl}
            target="_blank"
            className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-bold transition-colors"
          >
            <span>Открыть демо-сайт</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
