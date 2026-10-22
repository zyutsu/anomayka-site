"use client";

import React, { useState, useEffect } from "react";
import { Booking, Service, Category, BrandSettings, BlockedSlot, BookingStatus } from "@/lib/types";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminBookings } from "@/components/admin/AdminBookings";
import { AdminServices } from "@/components/admin/AdminServices";
import { AdminBrandSettings } from "@/components/admin/AdminBrandSettings";
import { AdminSchedule } from "@/components/admin/AdminSchedule";
import { AdminPhotos } from "@/components/admin/AdminPhotos";
import { AdminManualBookingModal } from "@/components/admin/AdminManualBookingModal";
import { AdminDemoGenerator } from "@/components/admin/AdminDemoGenerator";
import { LayoutDashboard, CalendarCheck, Wrench, Palette, Clock, LogOut, Shield, Camera, Lock, PhoneCall, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "bookings" | "services" | "schedule" | "brand" | "photos" | "security" | "demo">("dashboard");
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);

  // Данные системы
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Форма логина
  const [email, setEmail] = useState("admin@anomayka.ru");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Форма смены пароля
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Проверка сохраненной авторизации при загрузке страницы (HttpOnly Cookie + fallback)
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch("/api/admin/auth");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setAdminUser(data.user);
            setIsAuthenticated(true);
            fetchAllData();
            return;
          }
        }
      } catch (e) {
        // Fallback на sessionStorage
      }

      try {
        const saved = sessionStorage.getItem("anomayka_admin_auth");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.email) {
            setAdminUser(parsed);
            setIsAuthenticated(true);
            fetchAllData();
          }
        }
      } catch (e) {
        // Игнорируем ошибку чтения сессии
      }
    };

    verifySession();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [bRes, sRes, cRes, brRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/services?all=true"),
        fetch("/api/categories"),
        fetch("/api/brand"),
      ]);

      if (bRes.ok && sRes.ok && cRes.ok && brRes.ok) {
        setBookings(await bRes.json());
        setServices(await sRes.json());
        setCategories(await cRes.json());
        setBrand(await brRes.json());
      }
    } catch (e) {
      console.error("Ошибка обновления данных админки:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Неверный логин или пароль");
      }

      setAdminUser(data.user);
      setIsAuthenticated(true);
      sessionStorage.setItem("anomayka_admin_auth", JSON.stringify(data.user));
      await fetchAllData();
    } catch (err: any) {
      setLoginError(err.message || "Ошибка входа");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch (e) {
      // Игнорируем
    }
    sessionStorage.removeItem("anomayka_admin_auth");
    setIsAuthenticated(false);
    setAdminUser(null);
    setPassword("");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ ok: false, msg: "Новые пароли не совпадают" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ ok: false, msg: "Новый пароль должен быть от 6 символов" });
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminUser?.email || email,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Ошибка обновления пароля");
      }

      setPasswordStatus({ ok: true, msg: "Пароль успешно обновлен и защищен SHA-256!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordStatus({ ok: false, msg: err.message || "Ошибка обновления пароля" });
    } finally {
      setIsChangingPass(false);
    }
  };

  // Действия над заявками
  const handleUpdateBookingStatus = async (id: string, status: BookingStatus, notes?: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(notes !== undefined ? { notes } : {}) }),
      });

      if (res.ok) {
        const result = await res.json();
        setBookings((prev) => prev.map((b) => (b.id === id ? result.booking : b)));
      }
    } catch (e) {
      alert("Ошибка обновления статуса");
    }
  };

  const handleRescheduleBooking = async (id: string, date: string, time: string) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, time }),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Слот занят");
    }

    setBookings((prev) => prev.map((b) => (b.id === id ? result.booking : b)));
  };

  const handleAddManualBooking = async (formData: any) => {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Ошибка бронирования слота");
    }

    setBookings((prev) => [result.booking, ...prev]);
  };

  // Действия над услугами
  const handleSaveService = async (srv: Service) => {
    try {
      // Оптимистичное обновление UI
      setServices((prev) => {
        const idx = prev.findIndex((s) => s.id === srv.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = srv;
          return updated;
        }
        return [srv, ...prev];
      });

      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(srv),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка сохранения услуги");
      }

      await fetchAllData();
    } catch (err: any) {
      alert("Не удалось сохранить услугу: " + err.message);
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      setServices((prev) => prev.filter((s) => s.id !== id));
      const res = await fetch(`/api/services?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка удаления");
      }
    } catch (err: any) {
      alert("Ошибка удаления услуги: " + err.message);
      await fetchAllData();
    }
  };

  const handleSaveCategory = async (cat: Category) => {
    try {
      setCategories((prev) => {
        const idx = prev.findIndex((c) => c.id === cat.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = cat;
          return updated;
        }
        return [...prev, cat];
      });

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cat),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка сохранения категории");
      }

      await fetchAllData();
    } catch (err: any) {
      alert("Не удалось сохранить категорию: " + err.message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка удаления");
      }
      await fetchAllData();
    } catch (err: any) {
      alert("Ошибка удаления категории: " + err.message);
      await fetchAllData();
    }
  };

  // Действия над брендом
  const handleSaveBrand = async (settings: Partial<BrandSettings>) => {
    try {
      // Оптимистично обновляем бренд в состоянии
      if (brand) {
        setBrand({ ...brand, ...settings });
      }

      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка обновления настроек бренда");
      }

      const data = await res.json();
      if (data.brand) {
        setBrand(data.brand);
      }
    } catch (err: any) {
      alert("Не удалось сохранить настройки бренда: " + err.message);
    }
  };

  // График
  const handleSaveSchedule = async (sched: { openTime: string; closeTime: string; slotDurationMinutes: number }) => {
    await handleSaveBrand(sched);
  };

  const handleAddBlockedSlot = async (slot: BlockedSlot) => {
    setBlockedSlots((prev) => [...prev, slot]);
  };

  const handleDeleteBlockedSlot = async (id: string) => {
    setBlockedSlots((prev) => prev.filter((b) => b.id !== id));
  };

  // ЭКРАН АВТОРИЗАЦИИ (ВХОД ПО ПАРОЛЮ)
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-brand-surface border border-brand-border shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-brand-accent/20 border border-brand-accent/30 mx-auto flex items-center justify-center text-brand-accent shadow-lg shadow-brand-accent/20">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-theme-title tracking-tight">Вход в панель управления</h1>
            <p className="text-xs text-theme-muted">
              Введите логин и пароль администратора автоцентра
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs text-center font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label="Email администратора"
              type="email"
              placeholder="admin@anomayka.ru"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Пароль"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" size="lg" isLoading={isLoggingIn} className="w-full font-bold">
              Войти в админ-панель
            </Button>
          </form>

          <div className="p-3 rounded-xl bg-brand-secondary border border-brand-border text-center text-xs text-theme-muted space-y-1">
            <span className="block font-semibold text-theme-title">Данные для входа по умолчанию:</span>
            <span>Логин: <code className="font-mono text-brand-accent">admin@anomayka.ru</code></span>
            <span className="block">Пароль: <code className="font-mono text-brand-accent">admin123</code></span>
          </div>
        </div>
      </div>
    );
  }

  // АВТОРИЗОВАННАЯ АДМИН-ПАНЕЛЬ
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Шапка панели управления */}
      <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-theme-title">
                Панель управления • {brand?.name || "ANOMAYKA"}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-accent/20 text-brand-accent">
                {adminUser?.role === "owner" ? "Владелец" : "Администратор"}
              </span>
            </div>
            <span className="text-xs text-theme-muted">
              {adminUser?.name || "Администратор"} ({adminUser?.email})
            </span>
          </div>
        </div>

        {/* Навигационные табы + кнопка Выйти */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-brand-border">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-brand-accent text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Дашборд</span>
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "bookings"
                ? "bg-brand-accent text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Заявки ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("services")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "services"
                ? "bg-brand-accent text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Услуги и цены</span>
          </button>

          <button
            onClick={() => setActiveTab("photos")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "photos"
                ? "bg-brand-accent text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Фотографии</span>
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "schedule"
                ? "bg-brand-accent text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>График</span>
          </button>

          <button
            onClick={() => setActiveTab("brand")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "brand"
                ? "bg-brand-accent text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Брендинг</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "security"
                ? "bg-brand-accent text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Безопасность</span>
          </button>

          <button
            onClick={() => setActiveTab("demo")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "demo"
                ? "bg-brand-accent text-white shadow-sm"
                : "text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 font-bold"
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>🚀 Продажи & Демо</span>
          </button>

          <Button
            size="sm"
            onClick={() => setIsManualBookingOpen(true)}
            className="gap-1.5 text-xs rounded-xl font-bold bg-brand-accent hover:bg-brand-accent/90 text-white shadow-md shadow-brand-accent/25 hover:scale-105 transition-all ml-1.5 h-8"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Записать по звонку</span>
            <span className="sm:hidden">+ Запись</span>
          </Button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:text-white hover:bg-red-500/20 transition-all cursor-pointer ml-1"
            title="Выйти из аккаунта"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </div>

      {/* Контент активного таба */}
      {activeTab === "dashboard" && (
        <AdminDashboard
          bookings={bookings}
          services={services}
          onNavigateToBookings={() => setActiveTab("bookings")}
          onOpenManualBooking={() => setIsManualBookingOpen(true)}
        />
      )}

      {activeTab === "bookings" && (
        <AdminBookings
          bookings={bookings}
          services={services}
          onUpdateStatus={handleUpdateBookingStatus}
          onReschedule={handleRescheduleBooking}
          onAddManualBooking={handleAddManualBooking}
          onRefresh={fetchAllData}
          onOpenManualBooking={() => setIsManualBookingOpen(true)}
        />
      )}

      {activeTab === "services" && (
        <AdminServices
          categories={categories}
          services={services}
          onSaveService={handleSaveService}
          onDeleteService={handleDeleteService}
          onSaveCategory={handleSaveCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      )}

      {activeTab === "photos" && brand && (
        <AdminPhotos
          brand={brand}
          categories={categories}
          services={services}
          onSaveBrand={handleSaveBrand}
          onSaveCategory={handleSaveCategory}
          onSaveService={handleSaveService}
        />
      )}

      {activeTab === "schedule" && brand && (
        <AdminSchedule
          brand={brand}
          blockedSlots={blockedSlots}
          onSaveSchedule={handleSaveSchedule}
          onAddBlockedSlot={handleAddBlockedSlot}
          onDeleteBlockedSlot={handleDeleteBlockedSlot}
        />
      )}

      {activeTab === "brand" && brand && (
        <AdminBrandSettings brand={brand} onSaveBrand={handleSaveBrand} />
      )}

      {activeTab === "security" && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div>
            <h2 className="text-xl font-bold text-theme-title tracking-tight">Безопасность и доступ персонала</h2>
            <p className="text-xs text-theme-muted mt-1">
              Управление паролями учетных записей, защита от брутфорса и защищенные сессии
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-brand-surface border border-brand-border space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Активно
              </span>
              <h4 className="font-bold text-theme-title text-sm">Защита от подбора (Brute Force)</h4>
              <p className="text-xs text-theme-muted leading-relaxed">
                После 5 неудачных попыток ввода пароля IP-адрес автоматически блокируется на 5 минут.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-brand-surface border border-brand-border space-y-2">
              <span className="text-[10px] uppercase font-bold text-brand-accent tracking-wider">
                Криптография
              </span>
              <h4 className="font-bold text-theme-title text-sm">Хэширование SHA-256</h4>
              <p className="text-xs text-theme-muted leading-relaxed">
                Пароли не сохраняются в открытом виде, а защищены криптографическим хэшем на сервере.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-brand-surface border border-brand-border space-y-2">
              <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                HttpOnly Cookie
              </span>
              <h4 className="font-bold text-theme-title text-sm">Безопасная сессия (7 дней)</h4>
              <p className="text-xs text-theme-muted leading-relaxed">
                Токен сессии недоступен клиентским скриптам (XSS-защита) и проверяется сервером.
              </p>
            </div>
          </div>

          {/* Форма смены пароля */}
          <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center text-brand-accent">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-theme-title text-base">Смена пароля персонала</h3>
                <p className="text-xs text-theme-muted">
                  Текущий аккаунт: <strong className="text-theme-title">{adminUser?.email || email}</strong>
                </p>
              </div>
            </div>

            {passwordStatus && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-semibold text-center border ${
                  passwordStatus.ok
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-red-950/40 border-red-500/40 text-red-300"
                }`}
              >
                {passwordStatus.msg}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <Input
                label="Текущий пароль *"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <Input
                label="Новый пароль (минимум 6 символов) *"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label="Повторите новый пароль *"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                isLoading={isChangingPass}
                className="font-bold rounded-xl shadow-md shadow-brand-accent/20 text-xs px-5 py-2.5"
              >
                Сохранить новый пароль
              </Button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "demo" && brand && (
        <AdminDemoGenerator currentBrand={brand} />
      )}

      {/* Модальное окно записи клиента по звонку */}
      <AdminManualBookingModal
        isOpen={isManualBookingOpen}
        onClose={() => setIsManualBookingOpen(false)}
        services={services}
        onSubmit={handleAddManualBooking}
      />
    </div>
  );
}
