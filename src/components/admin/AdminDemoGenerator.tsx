"use client";

import React, { useState, useEffect } from "react";
import { BrandSettings } from "@/lib/types";
import { COLOR_PRESETS } from "@/context/BrandContext";
import {
  Share2,
  Copy,
  ExternalLink,
  Check,
  Sparkles,
  Phone,
  MapPin,
  Palette,
  MessageSquare,
  Upload,
  History,
  Trash2,
  CheckCircle2,
  Eye,
  Wrench,
  Disc,
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
  createdAt: string;
}

export function AdminDemoGenerator({ currentBrand }: { currentBrand: BrandSettings }) {
  const [name, setName] = useState("Автотехцентр Форвард");
  const [phone, setPhone] = useState("+7 (999) 777-55-33");
  const [city, setCity] = useState("Санкт-Петербург");
  const [address, setAddress] = useState("Московский пр-т, д. 102");
  const [accentColor, setAccentColor] = useState("#2563eb");
  const [serviceType, setServiceType] = useState<"autoservice" | "detailing" | "tire" | "complex">("autoservice");
  const [logoUrl, setLogoUrl] = useState("");
  const [slogan, setSlogan] = useState("Профессиональное обслуживание и ремонт автомобилей");
  const [showRibbon, setShowRibbon] = useState(true);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  // Генерация итогового URL
  const generateUrl = () => {
    const base = origin || "https://anomayka.ru";
    const params = new URLSearchParams();

    params.set("demo", "1");
    if (name.trim()) params.set("name", name.trim());
    if (phone.trim()) params.set("phone", phone.trim());
    if (city.trim()) params.set("city", city.trim());
    if (address.trim()) params.set("address", address.trim());
    if (accentColor) params.set("color", accentColor.replace("#", ""));
    if (logoUrl.trim()) params.set("logo", logoUrl.trim());
    if (slogan.trim()) params.set("slogan", slogan.trim());
    if (serviceType) params.set("type", serviceType);
    if (!showRibbon) params.set("ribbon", "0");

    return `${base}/?${params.toString()}`;
  };

  const finalUrl = generateUrl();

  // Готовый скрипт сообщения для клиента
  const salesMessage = `Здравствуйте! Меня зовут Вячеслав.
Увидел ваш автосервис «${name || "Автосервис"}».

Чтобы ваши клиенты могли быстро записываться к вам 24/7 без очередей и звонков, я подготовил для вас готовый сервис онлайн-записи:
👉 ${finalUrl}

Внутри уже настроен расчет времени процедур, адаптивный каталог услуг и удобная панель мастера с календарем заявок.
Посмотрите, как это выглядит со смартфона!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(finalUrl);
    setCopiedLink(true);
    saveToHistory();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(salesMessage);
    setCopiedMessage(true);
    saveToHistory();
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const saveToHistory = () => {
    if (!name.trim()) return;
    const newItem: SavedDemoItem = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      city: city.trim(),
      color: accentColor,
      url: finalUrl,
      createdAt: new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
    };

    setSavedDemos((prev) => {
      // Исключаем дубликаты по имени
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

  const applyPreset = (preset: "service" | "detailing" | "tire" | "premium") => {
    switch (preset) {
      case "detailing":
        setName("Royal Detailing");
        setServiceType("detailing");
        setAccentColor("#10b981");
        setSlogan("Премиальный уход, детейлинг, керамика и полировка кузова");
        break;
      case "tire":
        setName("Пит-Стоп Шиномонтаж");
        setServiceType("tire");
        setAccentColor("#f59e0b");
        setSlogan("Быстрый шиномонтаж без очередей, балансировка и сезонное хранение");
        break;
      case "premium":
        setName("Autohaus Motors");
        setServiceType("complex");
        setAccentColor("#8b5cf6");
        setSlogan("Специализированный сервис премиальных автомобилей");
        break;
      default:
        setName("Автотехцентр Форвард");
        setServiceType("autoservice");
        setAccentColor("#2563eb");
        setSlogan("Регламентное ТО, ремонт подвески, тормозов и агрегатов");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-brand-surface border border-brand-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-accent text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Инструмент быстрых продаж</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-theme-title tracking-tight">
            Генератор Демо-ссылок для клиентов
          </h2>
          <p className="text-xs sm:text-sm text-theme-muted max-w-2xl leading-relaxed">
            Вбейте название сервиса клиента и телефон — система мгновенно создаст персонализированную ссылку. 
            Клиент открывает сайт и сразу видит готовый продукт со своим логотипом, цветами и контактами!
          </p>
        </div>

        {/* Быстрые шаблоны */}
        <div className="flex flex-wrap sm:flex-nowrap gap-1.5 shrink-0">
          <button
            onClick={() => applyPreset("service")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-theme-title border border-brand-border transition-all flex items-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5 text-blue-400" />
            <span>ТО</span>
          </button>
          <button
            onClick={() => applyPreset("detailing")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-theme-title border border-brand-border transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Детейлинг</span>
          </button>
          <button
            onClick={() => applyPreset("tire")}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-theme-title border border-brand-border transition-all flex items-center gap-1.5"
          >
            <Disc className="w-3.5 h-3.5 text-amber-400" />
            <span>Шины</span>
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
                  onChange={(e) => setName(e.target.value)}
                  placeholder="например, Автотехцентр Форвард"
                  className="font-bold text-base"
                />
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
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
                {logoUrl && (
                  <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-black/30 border border-brand-border">
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-brand-border shrink-0 bg-black/60">
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-theme-muted truncate flex-1">{logoUrl}</span>
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      className="text-xs text-rose-400 hover:underline px-2"
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>

              {/* Опция плашки */}
              <div className="pt-2 flex items-center justify-between border-t border-brand-border/60">
                <div>
                  <span className="text-xs font-bold text-theme-title block">
                    Показывать плашку «Демо-презентация»
                  </span>
                  <span className="text-[11px] text-theme-muted">
                    Если выключить — сайт будет выглядеть как полностью их готовый веб-продукт
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRibbon(!showRibbon)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    showRibbon ? "bg-brand-accent" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      showRibbon ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Результат: Готовая ссылка и Скрипт продаж */}
        <div className="lg:col-span-5 space-y-6">
          {/* Блок готовой ссылки */}
          <div className="p-6 rounded-3xl bg-brand-surface border border-brand-accent/30 shadow-xl shadow-brand-accent/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-brand-accent tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ссылка готова к отправке</span>
              </span>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: accentColor }}
                title="Цвет темы"
              />
            </div>

            {/* Поле ссылки */}
            <div className="p-3 rounded-2xl bg-black/40 border border-brand-border font-mono text-xs text-slate-300 break-all select-all">
              {finalUrl}
            </div>

            {/* Кнопки действий со ссылкой */}
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Копировать</span>
                  </>
                )}
              </Button>

              <a
                href={finalUrl}
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
          </div>

          {/* Готовое продающее сообщение */}
          <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-theme-title flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-accent" />
                <span>Готовый текст для WhatsApp / Telegram</span>
              </h3>
            </div>

            <p className="text-[11px] text-theme-muted leading-relaxed">
              Отправьте этот текст владельцу автосервиса в WhatsApp, Telegram или директ. Конверсия из такого сообщения максимальная, так как клиент сразу видит свой сервис:
            </p>

            <div className="p-3 rounded-2xl bg-black/40 border border-brand-border font-sans text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
              {salesMessage}
            </div>

            <Button
              variant="secondary"
              onClick={handleCopyMessage}
              className="w-full flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedMessage ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Текст сообщения скопирован!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Скопировать готовый текст</span>
                </>
              )}
            </Button>
          </div>

          {/* История недавних презентаций */}
          {savedDemos.length > 0 && (
            <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-theme-title">
                <History className="w-3.5 h-3.5 text-theme-muted" />
                <span>Недавние ссылки ({savedDemos.length}):</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
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
                        <span className="text-[10px] text-theme-muted">{item.city || item.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.url);
                          alert(`Ссылка для «${item.name}» скопирована!`);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-theme-muted hover:text-white transition-colors"
                        title="Скопировать ссылку"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-white/10 text-theme-muted hover:text-white transition-colors"
                        title="Открыть"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDeleteHistoryItem(item.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-rose-400 hover:text-rose-300 transition-colors"
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
