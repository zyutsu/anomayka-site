"use client";

import { useEffect, useState } from "react";
import { BrandSettings } from "@/lib/types";

export function BrandThemeInjector({ initialBrand }: { initialBrand?: BrandSettings }) {
  const [brand, setBrand] = useState<BrandSettings | undefined>(initialBrand);

  useEffect(() => {
    async function loadBrand() {
      try {
        const res = await fetch("/api/brand");
        if (res.ok) {
          const data: BrandSettings = await res.json();
          setBrand(data);
        }
      } catch (e) {
        console.error("Failed to load brand settings", e);
      }
    }

    loadBrand();
  }, [initialBrand]);

  useEffect(() => {
    if (!brand) return;

    const root = document.documentElement;

    // Функция перевода HEX в RGB
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

    // 1. Настройка акцентного цвета
    if (brand.accentColor) {
      const accentRgb = hexToRgb(brand.accentColor);
      root.style.setProperty("--brand-accent", brand.accentColor);
      root.style.setProperty("--brand-accent-rgb", `${accentRgb.r} ${accentRgb.g} ${accentRgb.b}`);
      root.style.setProperty(
        "--brand-accent-hover",
        adjustColorBrightness(brand.accentColor, -18)
      );
    }

    // 2. Настройка цвета холста / фона и адаптация контраста (Светлая / Темная тема)
    if (brand.primaryColor) {
      const primaryRgb = hexToRgb(brand.primaryColor);
      root.style.setProperty("--brand-primary", brand.primaryColor);
      root.style.setProperty("--brand-primary-rgb", `${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b}`);

      // Расчет яркости цвета фона (ITU-R BT.601)
      const brightness = (primaryRgb.r * 299 + primaryRgb.g * 587 + primaryRgb.b * 114) / 1000;
      const isLight = brightness > 140;

      if (isLight) {
        // Светлая тема
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
        // Темная тема
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

  return null;
}

function adjustColorBrightness(col: string, percent: number) {
  let clean = col.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  let num = parseInt(clean, 16);
  if (isNaN(num)) return col;

  let r = Math.min(255, Math.max(0, ((num >> 16) & 255) + percent));
  let g = Math.min(255, Math.max(0, ((num >> 8) & 255) + percent));
  let b = Math.min(255, Math.max(0, (num & 255) + percent));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
