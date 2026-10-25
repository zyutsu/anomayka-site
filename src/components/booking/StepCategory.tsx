"use client";

import React from "react";
import { ArrowUpRight, Wrench, Sparkles, Disc, Cpu, Shield, Gauge, Check } from "lucide-react";
import { Category } from "@/lib/types";

const ICONS: Record<string, React.ElementType> = { Sparkles, Cpu, Disc, Shield, Gauge, Wrench };

interface StepCategoryProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (cat: Category) => void;
}

export function StepCategory({ categories, selectedCategoryId, onSelectCategory }: StepCategoryProps) {
  return (
    <div className="space-y-7">
      <div>
        <p className="eyebrow mb-3">Шаг 1 из 5</p>
        <h2 className="heading text-[clamp(1.5rem,3vw,2rem)] text-theme-title">
          Что нужно сделать с автомобилем?
        </h2>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-theme-muted">
          Выберите направление — дальше покажем услуги с ценами и свободное время.
        </p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {categories.map((cat) => {
          const Icon = ICONS[cat.icon] || Wrench;
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={
                "group relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all " +
                (isSelected
                  ? "border-brand-accent bg-brand-accent/[0.06]"
                  : "border-brand-border bg-brand-surface hover:border-brand-accent/40")
              }
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--brand-secondary)]">
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-theme-muted">
                    <Icon className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[13.5px] font-semibold text-theme-title">
                  <span className="truncate">{cat.title}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-brand-accent" />}
                </p>
                <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-theme-muted">
                  {cat.description}
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-theme-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-accent" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

