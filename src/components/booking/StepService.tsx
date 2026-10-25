"use client";

import React from "react";
import { ArrowLeft, ArrowUpRight, Clock3, Phone } from "lucide-react";
import { Service, Category } from "@/lib/types";
import { formatPrice, formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CallMasterModal } from "@/components/CallMasterModal";

interface StepServiceProps {
  category: Category;
  services: Service[];
  selectedServiceId: string;
  onSelectService: (service: Service) => void;
  onBack: () => void;
  phone?: string;
  phoneRaw?: string;
}

export function StepService({
  category,
  services,
  selectedServiceId,
  onSelectService,
  onBack,
  phone,
  phoneRaw,
}: StepServiceProps) {
  return (
    <div className="space-y-7">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-theme-muted transition-colors hover:text-theme-title"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Назад к направлениям
        </button>
        <p className="eyebrow mb-3">Шаг 2 из 5</p>
        <h2 className="heading text-[clamp(1.5rem,3vw,2rem)] text-theme-title">
          {category.title}
        </h2>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-theme-muted">
          Цена и длительность фиксируются на момент бронирования.
        </p>
      </div>

      <div className="grid gap-2.5 md:grid-cols-2">
        {services.map((srv) => {
          const isSelected = selectedServiceId === srv.id;

          return (
            <article
              key={srv.id}
              className={
                "flex flex-col justify-between gap-4 rounded-2xl border bg-brand-surface p-5 transition-all " +
                (isSelected ? "border-brand-accent" : "border-brand-border hover:border-brand-accent/40")
              }
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[14px] font-semibold leading-snug text-theme-title">
                    {srv.title}
                  </h3>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {srv.isPopular && <Badge variant="accent">Хит</Badge>}
                    {srv.requiresCall && <Badge variant="warning">По звонку</Badge>}
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-theme-muted">
                  {srv.description}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-brand-border/70 pt-4">
                <div>
                  <p className="text-[16px] font-bold text-theme-title">{formatPrice(srv.price)}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-theme-muted">
                    <Clock3 className="h-3 w-3" />
                    {formatDuration(srv.durationMinutes)}
                  </p>
                </div>

                {srv.requiresCall ? (
                  <CallMasterModal
                    phone={phone || ""}
                    phoneRaw={phoneRaw}
                    serviceTitle={srv.title}
                    label="Уточнить"
                    className="h-9 px-4 text-[12px]"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectService(srv)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--brand-secondary)] px-4 text-[12px] font-semibold text-theme-title transition-colors hover:bg-brand-accent hover:text-white"
                  >
                    Выбрать
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </article>
          );
        })}

        {services.length === 0 && (
          <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 text-center text-[13px] text-theme-muted md:col-span-2">
            В этом направлении пока нет активных услуг. Позвоните мастеру — подскажем варианты.
            <div className="mt-4 flex justify-center">
              <CallMasterModal phone={phone || ""} phoneRaw={phoneRaw} label="Позвонить" size="sm" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

