"use client";

import React from "react";
import { PhoneCall } from "lucide-react";
import { useBrand } from "@/context/BrandContext";
import { CallMasterModal } from "@/components/CallMasterModal";

export function HomeCallMaster() {
  const { brand } = useBrand();

  return (
    <section className="section-tight">
      <div className="page-shell">
        <div className="relative overflow-hidden rounded-[26px] border border-brand-border bg-brand-surface px-6 py-8 sm:px-9 sm:py-10">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full glow-accent blur-2xl" aria-hidden="true" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <p className="eyebrow mb-3">Нестандартная задача</p>
              <h2 className="heading text-[clamp(1.4rem,2.8vw,1.9rem)] text-theme-title">
                Нужен совет мастера до записи?
              </h2>
              <p className="mt-2.5 text-[13px] leading-relaxed text-theme-muted">
                Если поломка нестандартная или нужен индивидуальный расчёт — позвоните
                напрямую. Коротко опишите ситуацию, и мы предложим время и решение.
              </p>
            </div>

            <CallMasterModal
              phone={brand.phone}
              phoneRaw={brand.phoneRaw}
              size="lg"
              className="h-12 shrink-0 px-6 text-sm"
              label="Позвонить мастеру"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

