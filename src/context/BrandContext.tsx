"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
}

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

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
  const [demoRibbon, setDemoRibbon] = useState(true);

  // Считывание параметров из URL или sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlName = urlParams.get("name");
      const urlPhone = urlParams.get("phone");
      const urlCity = urlParams.get("city");
      const urlAddress = urlParams.get("address");
      const urlColor = urlParams.get("color");
      const urlBg = urlParams.get("bg");
      const urlLogo = urlParams.get("logo");
      const urlSlogan = urlParams.get("slogan");
      const urlType = urlParams.get("type");
      const urlRibbon = urlParams.get("ribbon");
      const isDemoFlag = urlParams.get("demo") === "1" || urlParams.get("demo") === "true";

      const hasUrlParams = Boolean(
        urlName || urlPhone || urlCity || urlAddress || urlColor || urlLogo || urlType || isDemoFlag
      );

      let activeOverride: Partial<BrandSettings> & { demoType?: string; ribbon?: boolean } = {};

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

        activeOverride = {
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
          ribbon: urlRibbon !== "0",
        };

        // Сохраняем в sessionStorage для сохранения при переходах по страницам
        sessionStorage.setItem("anomayka_demo_brand", JSON.stringify(activeOverride));
        setIsDemo(true);
      } else {
        // Проверяем сохраненный сессионный оверрайд
        const saved = sessionStorage.getItem("anomayka_demo_brand");
        if (saved) {
          try {
            activeOverride = JSON.parse(saved);
            setIsDemo(true);
          } catch (e) {
            sessionStorage.removeItem("anomayka_demo_brand");
          }
        }
      }

      if (Object.keys(activeOverride).length > 0) {
        setBrand((prev) => ({
          ...prev,
          name: activeOverride.name || prev.name,
          phone: activeOverride.phone || prev.phone,
          phoneRaw: activeOverride.phoneRaw || prev.phoneRaw,
          city: activeOverride.city || prev.city,
          address: activeOverride.address || prev.address,
          accentColor: activeOverride.accentColor || prev.accentColor,
          primaryColor: activeOverride.primaryColor || prev.primaryColor,
          logoUrl: activeOverride.logoUrl !== undefined ? activeOverride.logoUrl : prev.logoUrl,
          slogan: activeOverride.slogan || prev.slogan,
        }));

        if (activeOverride.demoType) {
          setDemoType(activeOverride.demoType);
        }
        if (activeOverride.ribbon !== undefined) {
          setDemoRibbon(activeOverride.ribbon);
        }
      }
    } catch (e) {
      console.error("Failed to parse demo params", e);
    }
  }, [initialBrand]);

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
      sessionStorage.removeItem("anomayka_demo_brand");
      // Очищаем параметры из адресной строки без перезагрузки страницы
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
