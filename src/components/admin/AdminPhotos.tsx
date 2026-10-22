"use client";

import React, { useState } from "react";
import { BrandSettings, Category, Service } from "@/lib/types";
import { Camera, Upload, Check, Image as ImageIcon, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminPhotosProps {
  brand: BrandSettings;
  categories: Category[];
  services: Service[];
  onSaveBrand: (settings: Partial<BrandSettings>) => Promise<void>;
  onSaveCategory: (cat: Category) => Promise<void>;
  onSaveService: (srv: Service) => Promise<void>;
}

export function AdminPhotos({
  brand,
  categories,
  services,
  onSaveBrand,
  onSaveCategory,
  onSaveService,
}: AdminPhotosProps) {
  const [logoUrl, setLogoUrl] = useState(brand.logoUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  // Синхронизация состояния логотипа при смене бренда извне
  React.useEffect(() => {
    setLogoUrl(brand.logoUrl || "");
  }, [brand.logoUrl]);

  // Универсальный загрузчик файлов с удалением старого
  const handleFileUpload = async (file: File, oldUrl?: string): Promise<string | null> => {
    setIsUploading(true);
    setSavedMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (oldUrl) {
        formData.append("oldUrl", oldUrl);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Ошибка загрузки");
      }

      return data.url;
    } catch (err: any) {
      alert(err.message || "Ошибка при загрузке фото");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await handleFileUpload(file, brand.logoUrl);
    if (url) {
      setLogoUrl(url);
      await onSaveBrand({ logoUrl: url });
      setSavedMessage("Логотип успешно обновлен!");
      setTimeout(() => setSavedMessage(""), 3000);
    }
  };

  const handleSaveLogoUrl = async () => {
    await onSaveBrand({ logoUrl });
    setSavedMessage("Логотип успешно сохранен!");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleCategoryPhotoUpload = async (cat: Category, file: File) => {
    const url = await handleFileUpload(file, cat.imageUrl);
    if (url) {
      await onSaveCategory({ ...cat, imageUrl: url });
      setSavedMessage(`Фото для «${cat.title}» обновлено!`);
      setTimeout(() => setSavedMessage(""), 3000);
    }
  };

  const handleServicePhotoUpload = async (srv: Service, file: File) => {
    const url = await handleFileUpload(file, srv.imageUrl);
    if (url) {
      await onSaveService({ ...srv, imageUrl: url });
      setSavedMessage(`Фото для «${srv.title}» обновлено!`);
      setTimeout(() => setSavedMessage(""), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-theme-title tracking-tight flex items-center gap-2">
          <Camera className="w-5 h-5 text-brand-accent" />
          Управление фотографиями и медиа
        </h2>
        <p className="text-xs text-theme-muted mt-1">
          Загружайте фото логотипа, категорий, услуг и сервисной зоны прямо с компьютера или телефона
        </p>
      </div>

      {savedMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" /> {savedMessage}
        </div>
      )}

      {/* 1. ЛОГОТИП */}
      <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
        <h3 className="text-sm font-bold text-theme-title uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-brand-accent" />
          Фирменный логотип автоцентра
        </h3>
        <p className="text-xs text-theme-muted">
          Отображается в шапке сайта, главном блоке (Hero), талоне записи и мобильном приложении
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Превью */}
          <div className="space-y-1.5">
            <span className="text-xs text-theme-muted block">Текущее превью:</span>
            <div className="h-32 w-full rounded-2xl border border-brand-border bg-black/40 p-3 flex items-center justify-center overflow-hidden shadow-inner">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-xs text-theme-muted">Логотип не выбран</span>
              )}
            </div>
          </div>

          {/* Загрузка с устройства или ввод URL */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-theme-title mb-1.5">
                Загрузить файл с устройства (PNG, JPG, SVG, WebP):
              </label>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent text-white text-xs font-semibold hover:bg-brand-accentHover cursor-pointer shadow-md shadow-brand-accent/25 transition-all">
                <Upload className="w-4 h-4" />
                <span>{isUploading ? "Загрузка..." : "Выбрать файл логотипа"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-brand-border/60">
              <label className="block text-xs font-semibold text-theme-title">
                Либо укажите прямую ссылку на фото:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://... или /logo.jpg"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl bg-black/40 border border-brand-border text-xs text-theme-title focus:outline-none focus:border-brand-accent"
                />
                <Button size="sm" onClick={handleSaveLogoUrl} className="text-xs">
                  Применить URL
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ФОТОГРАФИИ КАТЕГОРИЙ */}
      <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
        <h3 className="text-sm font-bold text-theme-title uppercase tracking-wider">
          Фотографии направлений и категорий
        </h3>
        <p className="text-xs text-theme-muted">
          Отображаются на главных плитках сайта и на первом шаге мастера бронирования
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl border border-brand-border bg-brand-surface overflow-hidden space-y-3 p-3 flex flex-col justify-between"
            >
              <div className="h-32 w-full rounded-xl overflow-hidden bg-black/40 relative">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-theme-muted">
                    Нет фото
                  </div>
                )}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[11px] font-bold text-white">
                  {cat.title}
                </div>
              </div>

              <div className="pt-1">
                <label className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-secondary border border-brand-border text-theme-title text-xs font-semibold hover:border-brand-accent cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Загрузить фото</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleCategoryPhotoUpload(cat, f);
                    }}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. ФОТОГРАФИИ УСЛУГ */}
      <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
        <h3 className="text-sm font-bold text-theme-title uppercase tracking-wider">
          Фотографии конкретных услуг и процедур
        </h3>
        <p className="text-xs text-theme-muted">
          Отображаются в каталоге прайс-листа и при выборе услуги в мастере записи
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="p-3 rounded-xl bg-brand-secondary border border-brand-border flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-black/40 shrink-0 border border-brand-border">
                  {srv.imageUrl ? (
                    <img src={srv.imageUrl} alt={srv.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-theme-muted">
                      Без фото
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-theme-title line-clamp-1">{srv.title}</h4>
                  <span className="text-[11px] text-brand-accent font-semibold">{srv.price} ₽</span>
                </div>
              </div>

              <label className="p-2 rounded-lg bg-brand-surface border border-brand-border text-theme-title hover:border-brand-accent cursor-pointer transition-all shrink-0">
                <Upload className="w-4 h-4 text-brand-accent" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleServicePhotoUpload(srv, f);
                  }}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
