"use client";

import React, { useState } from "react";
import { BrandSettings } from "@/lib/types";
import { Save, Palette, Globe, Phone, MapPin, Sparkles, Check, Upload, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminBrandSettingsProps {
  brand: BrandSettings;
  onSaveBrand: (settings: Partial<BrandSettings>) => Promise<void>;
}

export function AdminBrandSettings({ brand, onSaveBrand }: AdminBrandSettingsProps) {
  const [form, setForm] = useState<BrandSettings>({ ...brand });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Синхронизация формы при изменении бренда извне
  React.useEffect(() => {
    setForm({ ...brand });
  }, [brand]);

  const handleResetColors = async () => {
    const updated = {
      ...form,
      primaryColor: "#f6f5f1",
      accentColor: "#c8322a",
      secondaryColor: "#eeece6",
    };
    setForm(updated);
    await onSaveBrand({
      primaryColor: "#f6f5f1",
      accentColor: "#c8322a",
      secondaryColor: "#eeece6",
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };


  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (form.logoUrl) {
        formData.append("oldUrl", form.logoUrl);
      }
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка загрузки");
      setForm((prev) => ({ ...prev, logoUrl: data.url }));
      await onSaveBrand({ ...form, logoUrl: data.url });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Ошибка при загрузке логотипа");
    } finally {
      setIsUploadingLogo(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await onSaveBrand(form);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-theme-title tracking-tight flex items-center gap-2">
            <Palette className="w-5 h-5 text-brand-accent" />
            Настройки бренда (White-Label)
          </h2>
          <p className="text-xs text-theme-muted mt-1">
            Перекрашивайте, переименовывайте и настраивайте автоцентр под любого владельца без правки кода
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 text-xs font-semibold animate-in fade-in">
            <Check className="w-4 h-4" /> Настройки сохранены!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Блок 1: Основные реквизиты */}
        <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
          <h3 className="text-sm font-bold text-theme-title uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-accent" />
            Идентификация и бренд
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Название автоцентра / салона *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Город *"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
          </div>

          <Input
            label="Слоган компании"
            value={form.slogan}
            onChange={(e) => setForm({ ...form, slogan: e.target.value })}
          />

          <div className="pt-1">
            <Input
              label="Заголовок первого экрана"
              value={form.heroHeadline || ""}
              placeholder="Запись в сервис\nза две минуты"
              onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
            />
            <p className="mt-1 text-[11px] leading-relaxed text-theme-muted">
              Перенос на новую строку — символом <span className="font-mono">\n</span>.
            </p>
          </div>

          <Input
            label="Подзаголовок первого экрана"
            value={form.heroSubheadline || ""}
            placeholder="Выберите услугу, удобное время — гарантированная бронь без звонков"
            onChange={(e) => setForm({ ...form, heroSubheadline: e.target.value })}
          />

          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-theme-title">
                Логотип автоцентра
              </label>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--brand-secondary)] hover:bg-brand-accent/10 text-theme-title text-xs font-medium cursor-pointer border border-brand-border transition-colors">
                <Upload className="w-3.5 h-3.5 text-brand-accent" />
                {isUploadingLogo ? "Загрузка на сервер..." : "Выбрать файл логотипа с устройства"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoFileChange}
                  disabled={isUploadingLogo}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-center">
              <Input
                label="Путь или URL логотипа"
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              />
              <div className="flex items-center gap-3 pt-1 sm:pt-5">
                <span className="text-xs text-theme-muted">Превью:</span>
                <div className="w-14 h-14 rounded-2xl border border-brand-border bg-[var(--brand-secondary)] overflow-hidden flex items-center justify-center p-1.5 shadow-inner">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                  ) : (
                    <span className="text-brand-accent font-bold text-lg">A</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Блок 2: Цветовая палитра White-Label */}
        <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-theme-title uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-brand-accent" />
                Цветовая схема сайта
              </h3>
              <p className="text-xs text-theme-muted mt-0.5">
                Изменение цветов динамически перекрашивает кнопки, подсветки, карточки и элементы сайта
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetColors}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--brand-secondary)] hover:bg-brand-accent/10 text-xs font-semibold text-theme-title hover:text-theme-title border border-brand-border transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-brand-accent" />
              Вернуть по умолчанию
            </button>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-theme-title">
                Акцентный цвет (Кнопки, CTA)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  className="flex-1 h-10 px-3 rounded-xl bg-[var(--brand-secondary)] border border-brand-border text-xs text-theme-title font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-theme-title">
                Основной фон (Холст)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="flex-1 h-10 px-3 rounded-xl bg-[var(--brand-secondary)] border border-brand-border text-xs text-theme-title font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-theme-title">
                Вторичный оттенок (Карточки)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  className="flex-1 h-10 px-3 rounded-xl bg-[var(--brand-secondary)] border border-brand-border text-xs text-theme-title font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Блок 3: Контакты и мессенджеры */}
        <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
          <h3 className="text-sm font-bold text-theme-title uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-4 h-4 text-brand-accent" />
            Контакты и адрес
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Телефон для связи *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <Input
              label="График работы (текст)"
              value={form.workHours}
              onChange={(e) => setForm({ ...form, workHours: e.target.value })}
            />
          </div>

          <Input
            label="Фактический адрес *"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />

          <Input
            label="Прямая ссылка на организацию в Яндекс.Картах"
            placeholder="https://yandex.ru/maps/org/... (для кнопки перехода к филиалу)"
            value={form.mapUrl || ""}
            onChange={(e) => setForm({ ...form, mapUrl: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Ссылка на Telegram"
              value={form.telegramUrl || ""}
              onChange={(e) => setForm({ ...form, telegramUrl: e.target.value })}
            />
            <Input
              label="Ссылка на WhatsApp"
              value={form.whatsappUrl || ""}
              onChange={(e) => setForm({ ...form, whatsappUrl: e.target.value })}
            />
            <Input
              label="Ссылка на VK"
              value={form.vkUrl || ""}
              onChange={(e) => setForm({ ...form, vkUrl: e.target.value })}
            />
          </div>
        </div>

        {/* Кнопка сохранения */}
        <div className="flex justify-end pt-2">
          <Button type="submit" size="lg" isLoading={isSaving} className="gap-2 px-8">
            <Save className="w-4 h-4" />
            <span>Применить настройки бренда</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
