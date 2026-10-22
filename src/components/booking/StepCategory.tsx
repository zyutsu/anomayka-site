"use client";

import React from "react";
import { Category } from "@/lib/types";
import { Wrench, Sparkles, Cpu, Disc, Shield, Gauge, ArrowRight, CheckCircle2 } from "lucide-react";

interface StepCategoryProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (cat: Category) => void;
}

export function StepCategory({ categories, selectedCategoryId, onSelectCategory }: StepCategoryProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Sparkles":
        return <Sparkles className="w-5 h-5 text-brand-accent" />;
      case "Cpu":
        return <Cpu className="w-5 h-5 text-brand-accent" />;
      case "Disc":
        return <Disc className="w-5 h-5 text-brand-accent" />;
      case "Shield":
        return <Shield className="w-5 h-5 text-brand-accent" />;
      case "Gauge":
        return <Gauge className="w-5 h-5 text-brand-accent" />;
      default:
        return <Wrench className="w-5 h-5 text-brand-accent" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-theme-title tracking-tight">
          Шаг 1. Выберите категорию услуг
        </h2>
        <p className="text-sm text-theme-muted mt-1">
          Нажмите на интересующее вас направление обслуживания для выбора конкретной процедуры
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? "bg-brand-surface border-brand-accent ring-2 ring-brand-accent/20 shadow-xl shadow-brand-accent/10"
                  : "bg-brand-surface hover:border-brand-accent/50 border-brand-border hover:scale-[1.01]"
              }`}
            >
              {/* Фотография категории */}
              <div className="relative h-36 w-full overflow-hidden bg-black/40">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-brand-secondary flex items-center justify-center">
                    {getIcon(cat.icon)}
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                  {getIcon(cat.icon)}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-theme-title group-hover:text-brand-accent transition-colors">
                      {cat.title}
                    </h3>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-brand-accent shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-theme-muted line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs font-semibold text-brand-accent">
                  <span>Перейти к услугам</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
