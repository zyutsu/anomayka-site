"use client";

import React, { useState } from "react";
import { Service, Category } from "@/lib/types";
import { Clock, Check, ArrowLeft, Star, Phone } from "lucide-react";
import { formatPrice, formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CallMasterModal } from "@/components/CallMasterModal";

interface StepServiceProps {
  category: Category;
  services: Service[];
  selectedServiceId: string;
  onSelectService: (service: Service) => void;
  onBack: () => void;
}

export function StepService({
  category,
  services,
  selectedServiceId,
  onSelectService,
  onBack,
}: StepServiceProps) {
  const [selectedCallService, setSelectedCallService] = useState<Service | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-muted hover:text-theme-title mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Назад к категориям
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-theme-title tracking-tight">
            Шаг 2. Выберите услугу: {category.title}
          </h2>
          <p className="text-sm text-theme-muted mt-1">
            Длительность и стоимость фиксируются на момент бронирования без скрытых платежей
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((srv) => {
          const isSelected = selectedServiceId === srv.id;

          return (
            <div
              key={srv.id}
              onClick={() => {
                if (srv.requiresCall) {
                  setSelectedCallService(srv);
                } else {
                  onSelectService(srv);
                }
              }}
              className={`group relative rounded-3xl border cursor-pointer overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-sm ${
                isSelected
                  ? "bg-brand-surface border-brand-accent ring-2 ring-brand-accent/25 shadow-xl shadow-brand-accent/10"
                  : "bg-brand-surface hover:border-brand-accent/50 border-brand-border hover:scale-[1.01]"
              }`}
            >
              {srv.imageUrl && (
                <div className="relative h-36 w-full overflow-hidden bg-black/40">
                  <img
                    src={srv.imageUrl}
                    alt={srv.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {srv.isPopular && (
                      <Badge variant="accent" className="text-[10px] bg-black/70 backdrop-blur-sm">
                        <Star className="w-3 h-3 fill-brand-accent inline mr-1" />
                        Хит
                      </Badge>
                    )}
                    {srv.requiresCall && (
                      <Badge variant="warning" className="text-[10px] bg-black/70 backdrop-blur-sm">
                        <Phone className="w-3 h-3 inline mr-1" />
                        По звонку
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-theme-title group-hover:text-brand-accent transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-theme-muted leading-relaxed line-clamp-2">
                    {srv.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-lg text-theme-title">
                      {formatPrice(srv.price)}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-theme-muted bg-brand-secondary px-2.5 py-1 rounded-xl border border-brand-border">
                      <Clock className="w-3 h-3 text-brand-accent" />
                      <span>{formatDuration(srv.durationMinutes)}</span>
                    </div>
                  </div>

                  {srv.requiresCall ? (
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> Позвонить мастеру
                    </span>
                  ) : (
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                        isSelected
                          ? "bg-brand-accent border-brand-accent text-white"
                          : "border-brand-border group-hover:border-brand-accent text-transparent"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Модалка для услуги, требующей прямого звонка */}
      {selectedCallService && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl relative">
            <h3 className="text-lg font-bold text-theme-title">Связь с мастером по услуге</h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              Услуга <strong>«{selectedCallService.title}»</strong> относится к сложным или нестандартным работам. Позвоните нашему мастеру напрямую для оперативного согласования деталей и бронирования бокса:
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setSelectedCallService(null)}>
                Назад
              </Button>
              <a href="tel:+79990002424" className="w-full sm:w-auto">
                <Button size="lg" className="w-full font-bold">
                  <Phone className="w-4 h-4 mr-2" />
                  Позвонить мастеру
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
