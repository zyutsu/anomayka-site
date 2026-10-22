"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { BrandSettings } from "@/lib/types";

export const COLOR_PRESETS: Record<string, string> = {
  red: "#ef4444",
  blue: "#2563eb",
  emerald: "#10b981",
  green: "#16a34a",
  amber: "#f59e0b",
  gold: "#eab308",
  purple: "#8b5cf6",
  violet: "#7c3aed",
  orange: "#f97316",
  cyan: "#06b6d4",
  rose: "#f43f5e",
};

interface BrandContextValue {
  brand: BrandSettings;
  isDemo: boolean;
  demoType: string;
  demoRibbon: boolean;
  resetDemo: () => void;
  updateBrand: (updated: Partial<BrandSettings>) => void;
}

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

const DEMO_STORAGE_KEY = "anomayka_demo_brand";

export function BrandProvider({
  children,
  initialBrand,
}: {
  children: React.ReactNode;
  initialBrand: BrandSettings;
}) {
  const [brand, setBrand] = useState<BrandSettings>(initialBrand);
  const [isDemo, setIsDemo] = useState(false);
  const [demoType, setDemoType] = useState<string>("");

  // Функция применения оверрайда к бренду
  const applyBrandOverride = useCallback((override: Partial<BrandSettings> & { demoType?: string }) => {
    setBrand((prev) => ({
      ...prev,
      name: override.name || prev.name,
      phone: override.phone || prev.phone,
      phoneRaw: override.phoneRaw || (override.phone ? override.phone.replace(/\D/g, "") : prev.phoneRaw),
      city: override.city || prev.city,
      address: override.address || prev.address,
      accentColor: override.accentColor || prev.accentColor,
      primaryColor: override.primaryColor || prev.primaryColor,
      logoUrl: override.logoUrl !== undefined ? override.logoUrl : prev.logoUrl,
      slogan: override.slogan || prev.slogan,
    }));

    if (override.demoType) {
      setDemoType(override.demoType);
    }
    setIsDemo(true);
  }, []);

  // Синхронизация из URL или localStorage
  const syncBrand = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isReset = urlParams.get("demo") === "reset" || urlParams.get("reset") === "1";

      if (isReset) {
        localStorage.removeItem(DEMO_STORAGE_KEY);
        sessionStorage.removeItem(DEMO_STORAGE_KEY);
        setBrand(initialBrand);
        setIsDemo(false);
        setDemoType("");
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
        return;
      }

      const urlName = urlParams.get("name");
      const urlPhone = urlParams.get("phone");
      const urlCity = urlParams.get("city");
      const urlAddress = urlParams.get("address");
      const urlColor = urlParams.get("color");
      const urlBg = urlParams.get("bg");
      const urlLogo = urlParams.get("logo");
      const urlSlogan = urlParams.get("slogan");
      const urlType = urlParams.get("type");
      const isDemoFlag = urlParams.get("demo") === "1" || urlParams.get("demo") === "true";

      const hasUrlParams = Boolean(
        urlName || urlPhone || urlCity || urlAddress || urlColor || urlLogo || urlType || isDemoFlag
      );

      if (hasUrlParams) {
        // Парсим цвет
        let resolvedAccent = initialBrand.accentColor;
        if (urlColor) {
          const lower = urlColor.toLowerCase();
          if (COLOR_PRESETS[lower]) {
            resolvedAccent = COLOR_PRESETS[lower];
          } else if (urlColor.startsWith("#")) {
            resolvedAccent = urlColor;
          } else {
            resolvedAccent = `#${urlColor}`;
          }
        }

        const activeOverride: Partial<BrandSettings> & { demoType?: string } = {
          name: urlName || undefined,
          phone: urlPhone || undefined,
          phoneRaw: urlPhone ? urlPhone.replace(/\D/g, "") : undefined,
          city: urlCity || undefined,
          address: urlAddress || undefined,
          accentColor: urlColor ? resolvedAccent : undefined,
          primaryColor: urlBg ? (urlBg.startsWith("#") ? urlBg : `#${urlBg}`) : undefined,
          logoUrl: urlLogo || undefined,
          slogan: urlSlogan || undefined,
          demoType: urlType || "",
        };

        // Сохраняем в localStorage для надежного сохранения между вкладками и перезагрузками
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(activeOverride));
        sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(activeOverride));
        applyBrandOverride(activeOverride);
      } else {
        // Проверяем сохраненный оверрайд из localStorage
        const saved = localStorage.getItem(DEMO_STORAGE_KEY) || sessionStorage.getItem(DEMO_STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === "object") {
              applyBrandOverride(parsed);
            }
          } catch (e) {
            localStorage.removeItem(DEMO_STORAGE_KEY);
            sessionStorage.removeItem(DEMO_STORAGE_KEY);
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse demo params", e);
    }
  }, [initialBrand, applyBrandOverride]);

  useEffect(() => {
    syncBrand();

    // Слушаем изменение маршрутов и popstate
    const handlePopState = () => syncBrand();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [syncBrand]);

  // Метод для обновления бренда из любого компонента (например, после загрузки логотипа)
  const updateBrand = (updated: Partial<BrandSettings>) => {
    setBrand((prev) => {
      const merged = { ...prev, ...updated };
      if (typeof window !== "undefined" && isDemo) {
        try {
          const saved = localStorage.getItem(DEMO_STORAGE_KEY);
          const currentOverride = saved ? JSON.parse(saved) : {};
          localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ ...currentOverride, ...updated }));
        } catch (e) {}
      }
      return merged;
    });
  };

  // Применение CSS-переменных темы (акцентный цвет, фон, контрастность)
  useEffect(() => {
    if (!brand || typeof document === "undefined") return;

    const root = document.documentElement;

    const hexToRgb = (hex: string) => {
      let clean = hex.replace("#", "").trim();
      if (clean.length === 3) {
        clean = clean.split("").map((c) => c + c).join("");
      }
      const num = parseInt(clean, 16);
      if (isNaN(num)) return { r: 9, g: 10, b: 15 };
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
      };
    };

    // 1. Акцентный цвет
    if (brand.accentColor) {
      const accentRgb = hexToRgb(brand.accentColor);
      root.style.setProperty("--brand-accent", brand.accentColor);
      root.style.setProperty("--brand-accent-rgb", `${accentRgb.r} ${accentRgb.g} ${accentRgb.b}`);
      root.style.setProperty("--brand-accent-hover", adjustBrightness(brand.accentColor, -18));
    }

    // 2. Фон и контраст
    if (brand.primaryColor) {
      const primaryRgb = hexToRgb(brand.primaryColor);
      root.style.setProperty("--brand-primary", brand.primaryColor);
      root.style.setProperty("--brand-primary-rgb", `${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b}`);

      const brightness = (primaryRgb.r * 299 + primaryRgb.g * 587 + primaryRgb.b * 114) / 1000;
      const isLight = brightness > 140;

      if (isLight) {
        root.classList.remove("dark");
        root.classList.add("light");
        root.style.setProperty("--brand-text", "#0f172a");
        root.style.setProperty("--brand-text-inverted", "#ffffff");
        root.style.setProperty("--brand-muted", "#475569");
        root.style.setProperty("--brand-surface", "#ffffff");
        root.style.setProperty("--brand-surface-rgb", "255 255 255");
        root.style.setProperty("--brand-secondary", "#f1f5f9");
        root.style.setProperty("--brand-border", "rgba(0, 0, 0, 0.12)");
        root.style.setProperty("--brand-border-subtle", "rgba(0, 0, 0, 0.06)");
        root.style.setProperty("--brand-header-bg", "rgba(255, 255, 255, 0.92)");
        root.style.setProperty("--brand-card-bg", "#ffffff");
      } else {
        root.classList.remove("light");
        root.classList.add("dark");
        root.style.setProperty("--brand-text", "#f8fafc");
        root.style.setProperty("--brand-text-inverted", "#090a0f");
        root.style.setProperty("--brand-muted", "#94a3b8");
        root.style.setProperty("--brand-surface", "#11131a");
        root.style.setProperty("--brand-surface-rgb", "17 19 26");
        root.style.setProperty("--brand-secondary", "#171a24");
        root.style.setProperty("--brand-border", "rgba(255, 255, 255, 0.08)");
        root.style.setProperty("--brand-border-subtle", "rgba(255, 255, 255, 0.04)");
        root.style.setProperty("--brand-header-bg", "rgba(9, 10, 15, 0.92)");
        root.style.setProperty("--brand-card-bg", "#11131a");
      }
    }

    if (brand.secondaryColor) {
      root.style.setProperty("--brand-secondary", brand.secondaryColor);
    }

    if (brand.name) {
      document.title = `${brand.name} — Онлайн-запись в автоцентр`;
    }
  }, [brand]);

  const resetDemo = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DEMO_STORAGE_KEY);
      sessionStorage.removeItem(DEMO_STORAGE_KEY);
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }
    setBrand(initialBrand);
    setIsDemo(false);
    setDemoType("");
  };

  return (
    <BrandContext.Provider
      value={{
        brand,
        isDemo,
        demoType,
        demoRibbon: false,
        resetDemo,
        updateBrand,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
}

function adjustBrightness(col: string, percent: number) {
  let clean = col.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return col;

  const r = Math.min(255, Math.max(0, ((num >> 16) & 255) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 255) + percent));
  const b = Math.min(255, Math.max(0, (num & 255) + percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
