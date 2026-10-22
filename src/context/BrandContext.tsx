"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
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

// Генератор стильного автомобильного логотипа/монограммы для демо-клиентов
export function generateMonogramLogo(name: string, accentColor: string = "#2563eb"): string {
  const cleanName = (name || "А").trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  let displayLetters = "А";

  if (words.length >= 2) {
    displayLetters = (words[0][0] + words[1][0]).toUpperCase();
  } else if (cleanName.length > 0) {
    displayLetters = cleanName.slice(0, 2).toUpperCase();
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#161922"/>
        <stop offset="100%" stop-color="#08090d"/>
      </linearGradient>
      <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${accentColor}"/>
        <stop offset="100%" stop-color="${accentColor}" stop-opacity="0.35"/>
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="108" height="108" rx="28" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="3"/>
    <rect x="14" y="14" width="92" height="92" rx="20" fill="none" stroke="${accentColor}" stroke-opacity="0.25" stroke-width="1.5"/>
    <text x="60" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="${displayLetters.length > 1 ? 38 : 50}" fill="${accentColor}" text-anchor="middle" letter-spacing="-1">${displayLetters}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface BrandContextValue {
  brand: BrandSettings;
  isDemo: boolean;
  demoType: string;
  demoRibbon: boolean;
  demoQuery: string;
  getDemoHref: (path: string) => string;
  resetDemo: () => void;
  updateBrand: (updated: Partial<BrandSettings>) => void;
}

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

const DEMO_STORAGE_KEY = "anomayka_demo_brand";

function RouteListener({ onRoute }: { onRoute: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    onRoute();
  }, [pathname, searchParams, onRoute]);

  return null;
}

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
  const [demoQuery, setDemoQuery] = useState<string>("");

  // Функция применения оверрайда к бренду
  const applyBrandOverride = useCallback((override: Partial<BrandSettings> & { demoType?: string }) => {
    setBrand((prev) => {
      const activeName = override.name || prev.name;
      const activeAccent = override.accentColor || prev.accentColor;

      // Если в демо-режиме нет логотипа или стоит дефолтный логотип ANOMAYKA — генерируем стильную эмблему под клиента
      let resolvedLogo = override.logoUrl;
      if (!resolvedLogo || resolvedLogo === "/logo.jpg" || resolvedLogo === "") {
        resolvedLogo = generateMonogramLogo(activeName, activeAccent);
      }

      return {
        ...prev,
        name: activeName,
        phone: override.phone || prev.phone,
        phoneRaw: override.phoneRaw || (override.phone ? override.phone.replace(/\D/g, "") : prev.phoneRaw),
        city: override.city || prev.city,
        address: override.address || prev.address,
        accentColor: activeAccent,
        primaryColor: override.primaryColor || prev.primaryColor,
        logoUrl: resolvedLogo,
        slogan: override.slogan || prev.slogan,
      };
    });

    if (override.demoType) {
      setDemoType(override.demoType);
    }
    setIsDemo(true);
  }, []);

  // Генератор безопасных внутренних ссылок с сохранением демо-параметров
  const getDemoHref = useCallback(
    (path: string): string => {
      if (!isDemo || !demoQuery) return path;
      if (
        path.startsWith("tel:") ||
        path.startsWith("mailto:") ||
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("#")
      ) {
        return path;
      }
      const [pathname, search] = path.split("?");
      if (!search) {
        return `${pathname}?${demoQuery}`;
      }
      const existingParams = new URLSearchParams(search);
      const demoParams = new URLSearchParams(demoQuery);
      demoParams.forEach((val, key) => {
        if (!existingParams.has(key)) {
          existingParams.set(key, val);
        }
      });
      return `${pathname}?${existingParams.toString()}`;
    },
    [isDemo, demoQuery]
  );

  // Синхронизация из URL или безопасной сессии вкладки
  const syncBrand = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isReset = urlParams.get("demo") === "reset" || urlParams.get("reset") === "1";

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

      // ЕСЛИ пользователь открыл главную страницу или админку по прямой чистой ссылке (без параметров),
      // либо запросил сброс — гарантированно очищаем демо и показываем основной сайт!
      const isDirectMainOrAdmin =
        (window.location.pathname === "/" || window.location.pathname === "/admin") && !hasUrlParams;

      if (isReset || isDirectMainOrAdmin) {
        localStorage.removeItem(DEMO_STORAGE_KEY);
        sessionStorage.removeItem(DEMO_STORAGE_KEY);
        sessionStorage.removeItem("anomayka_demo_query");
        setBrand(initialBrand);
        setIsDemo(false);
        setDemoType("");
        setDemoQuery("");
        if (isReset) {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, "", cleanUrl);
        }
        return;
      }

      // Проверяем сохраненные переопределения из текущей сессии вкладки
      let savedOverride: (Partial<BrandSettings> & { demoType?: string }) | null = null;
      try {
        const savedStr = sessionStorage.getItem(DEMO_STORAGE_KEY);
        if (savedStr) {
          savedOverride = JSON.parse(savedStr);
        }
      } catch (e) {}

      // Проверяем, совпадает ли открываемая демка с уже сохраненной в этой вкладке
      const isSameDemoSession = Boolean(
        savedOverride?.name &&
        urlName &&
        savedOverride.name.trim().toLowerCase() === urlName.trim().toLowerCase()
      );

      // Если открыта ДРУГАЯ демка (новое название компании) — полностью очищаем кэш и песочницу предыдущей демки!
      if (hasUrlParams && savedOverride && !isSameDemoSession) {
        sessionStorage.removeItem(DEMO_STORAGE_KEY);
        sessionStorage.removeItem("anomayka_demo_query");
        sessionStorage.removeItem("anomayka_demo_categories");
        sessionStorage.removeItem("anomayka_demo_services");
        sessionStorage.removeItem("anomayka_demo_bookings");
        savedOverride = null;
      }

      if (hasUrlParams) {
        // Парсим цвет: приоритет у urlColor, затем у сохраненного оверрайда, затем дефолт
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
        } else if (isSameDemoSession && savedOverride?.accentColor) {
          resolvedAccent = savedOverride.accentColor;
        }

        const clientName = urlName || (isSameDemoSession ? savedOverride?.name : undefined) || initialBrand.name;

        // ВАЖНО: Разрешение логотипа:
        // 1. Если в URL передан реальный логотип (ссылка на изображение) — применяем его безусловно!
        // 2. Если внутри ТОЙ ЖЕ демки пользователь загружал логотип, а ссылка содержит начальную монограмму — сохраняем загруженный
        // 3. Если передан urlLogo любого вида (в т.ч. монограмма новой демки) — применяем его
        // 4. Если внутри той же демки есть сохраненный логотип — используем его
        // 5. Иначе генерируем свежую монограмму под текущее имя и цвет
        const isMonogram = (url?: string | null) => Boolean(url && url.startsWith("data:image/svg+xml"));
        const isRealImage = (url?: string | null) =>
          Boolean(url && !isMonogram(url) && url !== "/logo.jpg" && url.trim() !== "");

        let clientLogo = "";
        if (isRealImage(urlLogo)) {
          // В URL явно передан настоящий логотип для этой демки! Применяем его сразу
          clientLogo = urlLogo!.trim();
        } else if (isSameDemoSession && isRealImage(savedOverride?.logoUrl) && isMonogram(urlLogo)) {
          // В текущей сессии уже загружен реальный логотип, а ссылка содержит начальную монограмму
          clientLogo = savedOverride!.logoUrl!;
        } else if (urlLogo && urlLogo.trim() !== "") {
          clientLogo = urlLogo.trim();
        } else if (isSameDemoSession && savedOverride?.logoUrl && savedOverride.logoUrl.trim() !== "") {
          clientLogo = savedOverride.logoUrl;
        } else {
          clientLogo = generateMonogramLogo(clientName, resolvedAccent);
        }

        const activeOverride: Partial<BrandSettings> & { demoType?: string } = {
          name: urlName || (isSameDemoSession ? savedOverride?.name : undefined) || undefined,
          phone: urlPhone || (isSameDemoSession ? savedOverride?.phone : undefined) || undefined,
          phoneRaw: (urlPhone || (isSameDemoSession ? savedOverride?.phone : undefined))
            ? (urlPhone || savedOverride?.phone)!.replace(/\D/g, "")
            : undefined,
          city: urlCity || (isSameDemoSession ? savedOverride?.city : undefined) || undefined,
          address: urlAddress || (isSameDemoSession ? savedOverride?.address : undefined) || undefined,
          accentColor: urlColor ? resolvedAccent : (isSameDemoSession ? savedOverride?.accentColor : undefined),
          primaryColor: urlBg
            ? (urlBg.startsWith("#") ? urlBg : `#${urlBg}`)
            : (isSameDemoSession ? savedOverride?.primaryColor : undefined),
          logoUrl: clientLogo,
          slogan: urlSlogan || (isSameDemoSession ? savedOverride?.slogan : undefined) || undefined,
          demoType: urlType || (isSameDemoSession ? savedOverride?.demoType : undefined) || "",
        };

        // Формируем чистую query-строку для ссылок с актуальным логотипом и полями
        const queryParams = new URLSearchParams();
        queryParams.set("demo", "1");
        if (activeOverride.name) queryParams.set("name", activeOverride.name);
        if (activeOverride.phone) queryParams.set("phone", activeOverride.phone);
        if (activeOverride.city) queryParams.set("city", activeOverride.city);
        if (activeOverride.address) queryParams.set("address", activeOverride.address);
        if (activeOverride.accentColor) queryParams.set("color", activeOverride.accentColor.replace("#", ""));
        if (activeOverride.primaryColor) queryParams.set("bg", activeOverride.primaryColor.replace("#", ""));
        if (activeOverride.logoUrl && !activeOverride.logoUrl.startsWith("data:")) {
          queryParams.set("logo", activeOverride.logoUrl);
        }
        if (activeOverride.slogan) queryParams.set("slogan", activeOverride.slogan);
        if (activeOverride.demoType) queryParams.set("type", activeOverride.demoType);
        const qStr = queryParams.toString();

        setDemoQuery(qStr);
        // Сохраняем ТОЛЬКО в sessionStorage для переходов внутри текущей вкладки
        sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(activeOverride));
        sessionStorage.setItem("anomayka_demo_query", qStr);
        // Полностью очищаем глобальный localStorage, чтобы он не засорял другие вкладки и прямые переходы
        localStorage.removeItem(DEMO_STORAGE_KEY);
        applyBrandOverride(activeOverride);
      } else {
        // Проверяем сохраненный оверрайд из sessionStorage (только для навигации внутри текущей вкладки)
        const saved = sessionStorage.getItem(DEMO_STORAGE_KEY);
        const savedQuery = sessionStorage.getItem("anomayka_demo_query") || "";
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === "object") {
              setDemoQuery(savedQuery);
              applyBrandOverride(parsed);
            }
          } catch (e) {
            sessionStorage.removeItem(DEMO_STORAGE_KEY);
            sessionStorage.removeItem("anomayka_demo_query");
            setBrand(initialBrand);
            setIsDemo(false);
            setDemoType("");
            setDemoQuery("");
          }
        } else {
          setBrand(initialBrand);
          setIsDemo(false);
          setDemoType("");
          setDemoQuery("");
        }
      }
    } catch (e) {
      console.error("Failed to parse demo params", e);
    }
  }, [initialBrand, applyBrandOverride]);

  // Глобальный перехватчик кликов по внутренним ссылкам в режиме демо для сохранения параметров
  useEffect(() => {
    if (!isDemo || !demoQuery || typeof window === "undefined") return;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (
        !href ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("tel:") ||
        href.startsWith("mailto:") ||
        href.startsWith("#")
      ) {
        return;
      }

      if (!href.includes("demo=") && !href.includes("name=")) {
        const separator = href.includes("?") ? "&" : "?";
        target.setAttribute("href", `${href}${separator}${demoQuery}`);
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    document.addEventListener("auxclick", handleAnchorClick, true);
    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
      document.removeEventListener("auxclick", handleAnchorClick, true);
    };
  }, [isDemo, demoQuery]);

  useEffect(() => {
    syncBrand();
  }, [syncBrand]);

  // Метод для обновления бренда из любого компонента (например, после загрузки логотипа)
  const updateBrand = (updated: Partial<BrandSettings>) => {
    setBrand((prev) => {
      const merged = { ...prev, ...updated };
      if (typeof window !== "undefined" && isDemo) {
        try {
          const saved = sessionStorage.getItem(DEMO_STORAGE_KEY);
          const currentOverride = saved ? JSON.parse(saved) : {};
          const newOverride = { ...currentOverride, ...updated };
          sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(newOverride));

          // Пересобираем demoQuery с обновленными полями (логотип, название, телефон, город, цвет и т.д.)
          const params = new URLSearchParams(demoQuery || window.location.search);
          params.set("demo", "1");
          if (newOverride.name) params.set("name", newOverride.name);
          if (newOverride.phone) params.set("phone", newOverride.phone);
          if (newOverride.city) params.set("city", newOverride.city);
          if (newOverride.address) params.set("address", newOverride.address);
          if (newOverride.accentColor) params.set("color", newOverride.accentColor.replace("#", ""));
          if (newOverride.primaryColor) params.set("bg", newOverride.primaryColor.replace("#", ""));
          if (newOverride.slogan) params.set("slogan", newOverride.slogan);
          if (newOverride.demoType) params.set("type", newOverride.demoType);

          // Логотип сохраняем в query, если это валидный URL (не гигантский base64)
          if (newOverride.logoUrl && !newOverride.logoUrl.startsWith("data:")) {
            params.set("logo", newOverride.logoUrl);
          }

          const newQuery = params.toString();
          setDemoQuery(newQuery);
          sessionStorage.setItem("anomayka_demo_query", newQuery);

          // Мягко обновляем URL в адресной строке без перезагрузки страницы
          const newUrl = `${window.location.pathname}?${newQuery}`;
          window.history.replaceState({}, "", newUrl);
        } catch (e) {
          console.error("Failed to update demo brand in session", e);
        }
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
      sessionStorage.removeItem("anomayka_demo_query");
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }
    setBrand(initialBrand);
    setIsDemo(false);
    setDemoType("");
    setDemoQuery("");
  };

  return (
    <BrandContext.Provider
      value={{
        brand,
        isDemo,
        demoType,
        demoRibbon: false,
        demoQuery,
        getDemoHref,
        resetDemo,
        updateBrand,
      }}
    >
      <Suspense fallback={null}>
        <RouteListener onRoute={syncBrand} />
      </Suspense>
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
