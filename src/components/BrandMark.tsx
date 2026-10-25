"use client";

import React, { useState } from "react";
import { generateMonogramLogo } from "@/context/BrandContext";

interface BrandMarkProps {
  name: string;
  logoUrl?: string;
  accentColor?: string;
  className?: string;
  imageClassName?: string;
}

/**
 * Логотип бренда с автоматическим фолбэком на монограмму.
 * Если внешняя картинка (например, из Яндекс.Карт) не загрузилась,
 * клиент всё равно увидит аккуратную фирменную эмблему.
 */
export function BrandMark({
  name,
  logoUrl,
  accentColor = "#e23b2e",
  className = "",
  imageClassName = "",
}: BrandMarkProps) {
  const [failed, setFailed] = useState(false);
  const fallback = generateMonogramLogo(name, accentColor);
  const src = !logoUrl || failed ? fallback : logoUrl;

  return (
    <span
      className={"relative inline-flex items-center justify-center overflow-hidden " + className}
    >
      <img
        src={src}
        alt={name}
        className={"h-full w-full object-contain " + imageClassName}
        onError={() => setFailed(true)}
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}

