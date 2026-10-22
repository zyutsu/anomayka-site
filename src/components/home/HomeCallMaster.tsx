"use client";

import React from "react";
import { useBrand } from "@/context/BrandContext";
import { CallMasterModal } from "@/components/CallMasterModal";

export function HomeCallMaster() {
  const { brand } = useBrand();

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="rounded-3xl bg-brand-surface border border-brand-border p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-1.5 text-center md:text-left">
          <span className="text-[11px] font-bold text-brand-accent uppercase tracking-wider">
            Индивидуальный расчет
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-theme-title">
            Сложный случай или нужен совет мастера?
          </h3>
          <p className="text-xs text-theme-muted max-w-xl">
            Если поломка нестандартная, требуется дефектовка или индивидуальный расчет — позвоните нашему мастеру напрямую для оперативной консультации и бронирования.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <CallMasterModal
            phone={brand.phone}
            phoneRaw={brand.phoneRaw}
            size="lg"
            className="h-14 px-8 text-base"
            label="Позвонить мастеру"
          />
        </div>
      </div>
    </section>
  );
}
