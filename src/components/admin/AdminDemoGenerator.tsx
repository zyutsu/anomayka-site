"use client";

import React, { useState, useEffect } from "react";
import { BrandSettings } from "@/lib/types";
import { generateMonogramLogo } from "@/context/BrandContext";
import {
  Share2,
  Copy,
  ExternalLink,
  Check,
  Sparkles,
  Phone,
  MapPin,
  Palette,
  Upload,
  History,
  Trash2,
  CheckCircle2,
  Eye,
  Wrench,
  Disc,
  Cpu,
  Shield,
  Gauge,
  Zap,
  SlidersHorizontal,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SavedDemoItem {
  id: string;
  name: string;
  phone: string;
  city: string;
  color: string;
  url: string;
  shortUrl?: string;
  createdAt: string;
}

// Доступные категории услуг для выбора в демке
const DEMO_CATEGORIES = [
  { id: "to", slug: "to", label: "Регламентное ТО & Слесарный", icon: Wrench },
  { id: "diagnostics", slug: "diagnostics", label: "Компьютерная диагностика", icon: Cpu },
  { id: "detailing", slug: "detailing", label: "Детейлинг & Мойка", icon: Sparkles },
  { id: "tires", slug: "tires", label: "Шиномонтаж и балансировка", icon: Disc },
  { id: "bodywork", slug: "bodywork", label: "Кузовной ремонт & PPF", icon: Shield },
  { id: "tuning", slug: "tuning", label: "Тюнинг & Дооснащение", icon: Gauge },
];

// Функция транслитерации названия в красивый короткий слаг
function translitSlug(text: string): string {
  const ruMap: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
    ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
  };
  return text
    .toLowerCase()
    .split("")
    .map((char) => (ruMap[char] !== undefined ? ruMap[char] : char))
    .join("")
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 32);
}

// Сжатие полезной нагрузки в base64url (stateless компактная ссылка)
function encodeBase64UrlJson(obj: Record<string, any>): string {
  try {
    const jsonStr = JSON.stringify(obj);
    const utf8Bytes = encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    );
    return btoa(utf8Bytes)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch (e) {
    return "";
  }
}

export function AdminDemoGenerator({ currentBrand }: { currentBrand: BrandSettings }) {
  const [name, setName] = useState("Автотехцентр Форвард");
  const [slug, setSlug] = useState("forvard");
  const [phone, setPhone] = useState("+7 (999) 777-55-33");
  const [city, setCity] = useState("Санкт-Петербург");
  const [address, setAddress] = useState("Московский пр-т, д. 102");
  const [mapUrl, setMapUrl] = useState("");
  const [accentColor, setAccentColor] = useState("#2563eb");
  const [serviceType, setServiceType] = useState<"autoservice" | "detailing" | "tire" | "complex">("autoservice");
  const [logoUrl, setLogoUrl] = useState("");
  const [slogan, setSlogan] = useState("Профессиональное обслуживание и ремонт автомобилей");

  // Выбранные категории услуг для демки
  const [selectedCats, setSelectedCats] = useState<string[]>([
    "to",
    "diagnostics",
    "detailing",
    "tires",
    "bodywork",
    "tuning",
  ]);

  const [copiedLink, setCopiedLink] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isShortening, setIsShortening] = useState(false);
  const [savedDemos, setSavedDemos] = useState<SavedDemoItem[]>([]);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
      try {
        const stored = localStorage.getItem("anomayka_saved_demos");
        if (stored) {
          setSavedDemos(JSON.parse(stored));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // При изменении названия сервиса обновляем слаг, если пользователь не менял его вручную
  const handleNameChange = (val: string) => {
    setName(val);
    const newSlug = translitSlug(val);
    if (newSlug) setSlug(newSlug);
  };

  const toggleCategory = (catSlug: string) => {
    setSelectedCats((prev) => {
      if (prev.includes(catSlug)) {
        if (prev.length === 1) return prev; // хотя бы одна категория должна остаться
        return prev.filter((c) => c !== catSlug);
      } else {
        return [...prev, catSlug];
      }
    });
  };

  // Компактный stateless slug (base64url)
  const getStatelessSlug = () => {
    const compact: Record<string, any> = {};
    if (name.trim()) compact.n = name.trim();
    if (phone.trim()) compact.p = phone.trim();
    if (city.trim()) compact.c = city.trim();
    if (address.trim()) compact.a = address.trim();
    if (mapUrl.trim()) compact.m = mapUrl.trim();
    if (accentColor) compact.clr = accentColor.replace("#", "");
    if (logoUrl.trim()) compact.l = logoUrl.trim();
    if (slogan.trim()) compact.s = slogan.trim();
    if (serviceType) compact.t = serviceType;
    if (selectedCats.length > 0 && selectedCats.length < DEMO_CATEGORIES.length) {
      compact.cats = selectedCats;
    }
    return encodeBase64UrlJson(compact);
  };

  // Генерация полного URL демки со всеми параметрами
  const generateFullUrl = () => {
    const base = origin || (typeof window !== "undefined" ? window.location.origin : "https://vibe-rho-bay.vercel.app");
    const params = new URLSearchParams();

    params.set("demo", "1");
    if (name.trim()) params.set("name", name.trim());
    if (phone.trim()) params.set("phone", phone.trim());
    if (city.trim()) params.set("city", city.trim());
    if (address.trim()) params.set("address", address.trim());
    if (mapUrl.trim()) params.set("map", mapUrl.trim());
    if (accentColor) params.set("color", accentColor.replace("#", ""));
    if (logoUrl.trim()) params.set("logo", logoUrl.trim());
    if (slogan.trim()) params.set("slogan", slogan.trim());
    if (serviceType) params.set("type", serviceType);
    if (selectedCats.length > 0 && selectedCats.length < DEMO_CATEGORIES.length) {
      params.set("cats", selectedCats.join(","));
    }

    return `${base}/?${params.toString()}`;
  };

  const finalFullUrl = generateFullUrl();
  const cleanSlug = translitSlug(slug) || "demo";
  const baseOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "https://vibe-rho-bay.vercel.app");
  const displayShortUrl = `${baseOrigin}/d/${cleanSlug}`;

  // Копирование короткой ссылки с регистрацией в базе /api/shorten
  const handleCopyShortLink = async () => {
    setIsShortening(true);
    let targetLink = displayShortUrl;

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: cleanSlug,
          url: finalFullUrl,
          name: name.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.shortUrl) {
          targetLink = `${baseOrigin}${data.shortUrl}`;
        }
      } else {
        // Fallback на компактный base64url slug
        const b64 = getStatelessSlug();
        if (b64) targetLink = `${baseOrigin}/d/${b64}`;
      }
    } catch (e) {
      const b64 = getStatelessSlug();
      if (b64) targetLink = `${baseOrigin}/d/${b64}`;
    } finally {
      setIsShortening(false);
    }

    await navigator.clipboard.writeText(targetLink);
    setCopiedLink(true);
    saveToHistory(targetLink);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const saveToHistory = (shortLink: string) => {
    if (!name.trim()) return;
    const newItem: SavedDemoItem = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      city: city.trim(),
      color: accentColor,
      url: finalFullUrl,
      shortUrl: shortLink,
      createdAt: new Date().toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setSavedDemos((prev) => {
      const filtered = prev.filter((item) => item.name.toLowerCase() !== newItem.name.toLowerCase());
      const updated = [newItem, ...filtered].slice(0, 10);
      try {
        localStorage.setItem("anomayka_saved_demos", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleDeleteHistoryItem = (id: string) => {
    setSavedDemos((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("anomayka_saved_demos", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const applyPreset = (preset: "service" | "detailing" | "tire" | "tuning" | "premium") => {
    setMapUrl("");
    switch (preset) {
      case "detailing":
        setName("Royal Detailing");
        setSlug("royal-detailing");
        setServiceType("detailing");
        setAccentColor("#10b981");
        setSlogan("Премиальный уход, детейлинг, керамика и полировка кузова");
        setSelectedCats(["detailing", "bodywork"]);
        setLogoUrl("");
        break;
      case "tire":
        setName("Пит-Стоп Шиномонтаж");
        setSlug("pit-stop-tires");
        setServiceType("tire");
        setAccentColor("#f59e0b");
        setSlogan("Быстрый шиномонтаж без очередей, балансировка и сезонное хранение");
        setSelectedCats(["tires"]);
        setLogoUrl("");
        break;
      case "tuning":
        setName("RS Выхлоп & Тюнинг");
        setSlug("rs-vykhlop");
        setServiceType("complex");
        setAccentColor("#ef4444");
        setSlogan("Тюнинг выхлопных систем, даунпайпы, чип-тюнинг и дооснащение");
        setSelectedCats(["tuning", "diagnostics"]);
        setLogoUrl("");
        break;
      case "premium":
        setName("Autohaus Motors");
        setSlug("autohaus-motors");
        setServiceType("complex");
        setAccentColor("#8b5cf6");
        setSlogan("Специализированный сервис премиальных автомобилей");
        setSelectedCats(["to", "diagnostics", "detailing", "tires", "bodywork", "tuning"]);
        setLogoUrl("");
        break;
      default:
        setName("Автотехцентр Форвард");
        setSlug("forvard");
        setServiceType("autoservice");
        setAccentColor("#2563eb");
        setSlogan("Регламентное ТО, ремонт подвески, тормозов и агрегатов");
        setSelectedCats(["to", "diagnostics", "tires"]);
        setLogoUrl("");
        break;
    }
  };

  // Загрузка логотипа клиента
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка загрузки");
      setLogoUrl(data.url);
    } catch (err: any) {
      alert(err.message || "Ошибка загрузки файла");
    } finally {
      setIsUploading(false);
    }
  };

  const colorList = [
    { name: "Синий", hex: "#2563eb" },
    { name: "Алый", hex: "#ef4444" },
    { name: "Изумруд", hex: "#10b981" },
    { name: "Золотой", hex: "#f59e0b" },
    { name: "Фиолетовый", hex: "#8b5cf6" },
    { name: "Оранжевый", hex: "#f97316" },
    { name: "Бирюзовый", hex: "#06b6d4" },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      {/* Заголовок блока */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-brand-surface border border-brand-border shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-accent text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Инструмент быстрых продаж</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-theme-title tracking-tight">
            Генератор Коротких Демо-ссылок
          </h2>
          <p className="text-xs sm:text-sm text-theme-muted max-w-2xl leading-relaxed">
            Создайте красивую короткую ссылку вида <strong className="text-theme-title">/d/rs-vykhlop</strong> с выбором категорий услуг, 
            брендовым цветом, логотипом и точкой на Яндекс Картах. Клиент открывает и сразу видит чистый готовый сайт под свой бизнес.
          </p>
        </div>

        {/* Быстрые шаблоны */}
        <div className="flex flex-wrap sm:flex-nowrap gap-1.5 shrink-0">
          <button
            onClick={() => applyPreset("service")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-theme-title border border-brand-border transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-blue-400" />
            <span>ТО</span>
          </button>
          <button
            onClick={() => applyPreset("detailing")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-theme-title border border-brand-border transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Детейлинг</span>
          </button>
          <button
            onClick={() => applyPreset("tire")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-theme-title border border-brand-border transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Disc className="w-3.5 h-3.5 text-amber-400" />
            <span>Шины</span>
          </button>
          <button
            onClick={() => applyPreset("tuning")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-theme-title border border-brand-border transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Gauge className="w-3.5 h-3.5 text-rose-400" />
            <span>Тюнинг</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Форма настройки */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border space-y-5">
            <h3 className="text-base font-bold text-theme-title flex items-center gap-2">
              <Share2 className="w-4 h-4 text-brand-accent" />
              <span>Параметры автосервиса заказчика</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-theme-muted block mb-1.5">
                  Название автосервиса клиента *
                </label>
                <Input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="например, RS Выхлоп или Форвард"
                  className="font-bold text-base"
                />
              </div>

              {/* Короткий адрес ссылки (Slug) */}
              <div>
                <label className="text-xs font-semibold text-theme-muted block mb-1.5 flex items-center justify-between">
                  <span>Короткий код ссылки (slug)</span>
                  <span className="text-[10px] text-brand-accent font-medium">Красивый адрес для клиента</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-theme-muted shrink-0 px-2.5 py-2 rounded-xl bg-black/40 border border-brand-border">
                    /d/
                  </span>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(translitSlug(e.target.value))}
                    placeholder="rs-vykhlop"
                    className="font-mono text-sm font-bold text-brand-accent"
                  />
                </div>
                <span className="text-[10px] text-theme-muted mt-1 block">
                  Будет сгенерирована ссылка: <strong>{displayShortUrl}</strong>
                </span>
              </div>

              {/* ВЫБОР КАТЕГОРИЙ И УСЛУГ В ДЕМКЕ */}
              <div className="p-4 rounded-2xl bg-black/30 border border-brand-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-theme-title flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-brand-accent" />
                    <span>Направления и услуги в демо ({selectedCats.length}/{DEMO_CATEGORIES.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCats.length === DEMO_CATEGORIES.length) {
                        setSelectedCats(["to"]);
                      } else {
                        setSelectedCats(DEMO_CATEGORIES.map((c) => c.slug));
                      }
                    }}
                    className="text-[10px] text-brand-accent hover:underline font-semibold cursor-pointer"
                  >
                    {selectedCats.length === DEMO_CATEGORIES.length ? "Снять все" : "Выбрать все"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {DEMO_CATEGORIES.map((cat) => {
                    const isChecked = selectedCats.includes(cat.slug);
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => toggleCategory(cat.slug)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isChecked
                            ? "bg-brand-accent/10 border-brand-accent text-theme-title"
                            : "bg-black/20 border-brand-border/60 text-theme-muted hover:border-brand-border"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                            isChecked
                              ? "bg-brand-accent border-brand-accent text-black"
                              : "border-brand-border bg-black/40"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                        <Icon className={`w-4 h-4 shrink-0 ${isChecked ? "text-brand-accent" : "text-theme-muted"}`} />
                        <span className="text-xs font-medium truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
                <span className="text-[10px] text-theme-muted block">
                  В демке отобразятся только выбранные направления. Также клиент или менеджер сможет менять цены и услуги в панели управления (/admin).
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-theme-muted block mb-1.5">
                    Номер телефона
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (999) 000-00-00"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-theme-muted block mb-1.5">
                    Город
                  </label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Москва, СПб, Казань..."
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-theme-muted block mb-1.5">
                  Адрес автоцентра
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ул. Автомобильная, д. 12"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-theme-muted block mb-1.5 flex items-center justify-between">
                  <span>Точка в Яндекс.Картах (прямая ссылка)</span>
                  <span className="text-[10px] text-brand-accent font-medium">Для кнопки «Открыть в Яндекс.Картах»</span>
                </label>
                <Input
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  placeholder="https://yandex.ru/maps/org/... (необязательно)"
                />
                <span className="text-[10px] text-theme-muted mt-1 block">
                  Вставьте ссылку на организацию из Яндекс Карт, чтобы клиенты открывали прямо вашу точку с отзывами и маршрутом
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-theme-muted block mb-1.5">
                  Слоган или подзаголовок
                </label>
                <Input
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="Онлайн-запись и ремонт без очередей"
                />
              </div>

              {/* Выбор цвета */}
              <div>
                <label className="text-xs font-semibold text-theme-muted block mb-2">
                  Фирменный цвет бренда
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {colorList.map((col) => {
                    const isSelected = accentColor.toLowerCase() === col.hex.toLowerCase();
                    return (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setAccentColor(col.hex)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                          isSelected
                            ? "border-white bg-white/10 text-white shadow-md scale-105"
                            : "border-brand-border bg-black/20 text-theme-muted hover:text-white hover:border-white/30"
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.name}</span>
                      </button>
                    );
                  })}

                  <div className="flex items-center gap-1.5 ml-auto">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      title="Выбрать точный цвет"
                    />
                    <span className="text-xs font-mono text-theme-muted">{accentColor}</span>
                  </div>
                </div>
              </div>

              {/* Логотип */}
              <div>
                <label className="text-xs font-semibold text-theme-muted block mb-1.5">
                  Логотип клиента (ссылка или загрузка файла)
                </label>
                <div className="flex gap-2">
                  <Input
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://... или загрузите файл справа"
                    className="flex-1 text-xs"
                  />
                  <label className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-brand-border text-xs font-semibold text-theme-title cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? "..." : "Файл"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
                <div className="mt-2 flex items-center gap-3 p-2.5 rounded-2xl bg-black/40 border border-brand-border">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-brand-border shrink-0 bg-black/60 flex items-center justify-center shadow-md">
                    <img
                      src={logoUrl.trim() || generateMonogramLogo(name.trim() || "Автосервис", accentColor)}
                      alt="Logo Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-theme-title block truncate">
                      {logoUrl.trim() ? "Пользовательский логотип" : `Фирменная эмблема «${name.trim() || "Автосервис"}»`}
                    </span>
                    <span className="text-[10px] text-theme-muted block truncate">
                      {logoUrl.trim() || "Сгенерирована автоматически по названию и цвету"}
                    </span>
                  </div>
                  {logoUrl.trim() && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      className="text-xs text-rose-400 hover:text-rose-300 hover:underline px-2 cursor-pointer shrink-0"
                    >
                      Сбросить к эмблеме
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Результат: Готовая короткая ссылка и История */}
        <div className="lg:col-span-5 space-y-6">
          {/* Блок готовой короткой ссылки */}
          <div className="p-6 rounded-3xl bg-brand-surface border border-brand-accent/30 shadow-xl shadow-brand-accent/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-brand-accent tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span>Короткая ссылка для клиента</span>
              </span>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: accentColor }}
                title="Цвет темы"
              />
            </div>

            {/* Поле короткой ссылки */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-brand-accent/40 font-mono text-sm font-bold text-brand-accent break-all select-all flex items-center justify-between gap-2">
              <span className="truncate">{displayShortUrl}</span>
              <Link2 className="w-4 h-4 shrink-0 text-brand-accent/70" />
            </div>

            {/* Кнопки действий с короткой ссылкой */}
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                onClick={handleCopyShortLink}
                disabled={isShortening}
                className="w-full flex items-center justify-center gap-2 cursor-pointer bg-brand-accent hover:opacity-90 font-bold"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                    <span>Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{isShortening ? "Создание..." : "Копировать"}</span>
                  </>
                )}
              </Button>

              <a
                href={displayShortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button
                  variant="secondary"
                  className="w-full flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Открыть</span>
                </Button>
              </a>
            </div>

            {/* Подсказка об управлении услугами в демке */}
            <div className="p-3 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-theme-title flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent" />
                <span>Редактирование услуг в демо:</span>
              </div>
              <p className="text-[11px] text-theme-muted leading-relaxed">
                Внутри созданной демки можно войти в панель управления (<code className="text-brand-accent font-bold">/admin</code>) под логином <code className="text-white font-bold">anomayka</code> и паролем <code className="text-white font-bold">AutoPro#2026</code>. Любые правки цен и услуг безопасны и не меняют основной сайт!
              </p>
            </div>
          </div>

          {/* История недавних ссылок */}
          {savedDemos.length > 0 && (
            <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-theme-title">
                <History className="w-3.5 h-3.5 text-theme-muted" />
                <span>Недавние презентации ({savedDemos.length}):</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {savedDemos.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-black/20 border border-brand-border/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="truncate">
                        <strong className="text-theme-title block truncate">{item.name}</strong>
                        <span className="text-[10px] text-brand-accent font-mono truncate block">
                          {item.shortUrl || item.city || item.phone}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          const toCopy = item.shortUrl || item.url;
                          navigator.clipboard.writeText(toCopy);
                          alert(`Ссылка для «${item.name}» скопирована!`);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-theme-muted hover:text-white transition-colors cursor-pointer"
                        title="Скопировать ссылку"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={item.shortUrl || item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-white/10 text-theme-muted hover:text-white transition-colors"
                        title="Открыть"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDeleteHistoryItem(item.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                        title="Удалить из истории"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}