"use client";

import React from "react";
import Link from "next/link";
import { Category, Service } from "@/lib/types";
import { Clock, Calendar, ArrowRight, PhoneCall } from "lucide-react";
import { formatPrice, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CallMasterModal } from "@/components/CallMasterModal";
import { useBrand } from "@/context/BrandContext";

export function ServicesCatalog({
  categories: initialCategories,
  services: initialServices,
}: {
  categories: Category[];
  services: Service[];
}) {
  const { brand, demoType, getDemoHref, isDemo } = useBrand();

  const [categories, setCategories] = React.useState<Category[]>(initialCategories);
  const [services, setServices] = React.useState<Service[]>(initialServices);

  // В демо-режиме подгружаем изолированные категории и услуги текущей вкладки
  React.useEffect(() => {
    if (isDemo && typeof window !== "undefined") {
      try {
        const demoCats = sessionStorage.getItem("anomayka_demo_categories");
        if (demoCats) {
          setCategories(JSON.parse(demoCats).filter((c: Category) => c.isActive));
        } else {
          setCategories(initialCategories);
        }

        const demoSrvs = sessionStorage.getItem("anomayka_demo_services");
        if (demoSrvs) {
          setServices(JSON.parse(demoSrvs).filter((s: Service) => s.isActive));
        } else {
          setServices(initialServices);
        }
        return;
      } catch (e) {}
    }
    setCategories(initialCategories);
    setServices(initialServices);
  }, [isDemo, initialCategories, initialServices]);

  // Фильтрация/сортировка по demoType, если задан
  const filteredCategories = React.useMemo(() => {
    if (!demoType) return categories;

    if (demoType === "detailing") {
      return [...categories].sort((a, b) => {
        const aIsDetailing = a.title.toLowerCase().includes("детейл") || a.title.toLowerCase().includes("мойк") || a.title.toLowerCase().includes("кузов");
        const bIsDetailing = b.title.toLowerCase().includes("детейл") || b.title.toLowerCase().includes("мойк") || b.title.toLowerCase().includes("кузов");
        return aIsDetailing === bIsDetailing ? 0 : aIsDetailing ? -1 : 1;
      });
    }

    if (demoType === "tire") {
      return [...categories].sort((a, b) => {
        const aIsTire = a.title.toLowerCase().includes("шин") || a.title.toLowerCase().includes("колес") || a.title.toLowerCase().includes("диск");
        const bIsTire = b.title.toLowerCase().includes("шин") || b.title.toLowerCase().includes("колес") || b.title.toLowerCase().includes("диск");
        return aIsTire === bIsTire ? 0 : aIsTire ? -1 : 1;
      });
    }

    return categories;
  }, [categories, demoType]);

  return (
    <div className="space-y-14">
      {filteredCategories.map((category) => {
        const categoryServices = services.filter((s) => s.categoryId === category.id);
        if (categoryServices.length === 0) return null;

        return (
          <div key={category.id} className="space-y-5">
            <div className="border-b border-brand-border/60 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-theme-title tracking-tight">
                  {category.title}
                </h2>
                <p className="text-xs text-theme-muted mt-0.5">
                  {category.description}
                </p>
              </div>
              <Link href={getDemoHref(`/booking?categoryId=${category.id}`)}>
                <span className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1 cursor-pointer">
                  Записаться в категорию <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categoryServices.map((srv) => (
                <div
                  key={srv.id}
                  className="rounded-3xl border border-brand-border bg-brand-surface p-5 flex flex-col justify-between hover:border-brand-accent/50 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-brand-accent/5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-theme-title text-base leading-snug">
                        {srv.title}
                      </h3>
                      {srv.isPopular && (
                        <Badge variant="accent" className="text-[10px] shrink-0 font-bold">
                          Хит
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-theme-muted line-clamp-2 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-brand-border/40 flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-theme-title">
                        {formatPrice(srv.price)}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-theme-muted">
                        <Clock className="w-3 h-3 text-brand-accent" />
                        <span>{formatDuration(srv.durationMinutes)}</span>
                      </div>
                    </div>

                    {srv.requiresCall ? (
                      <CallMasterModal
                        phone={brand.phone}
                        phoneRaw={brand.phoneRaw}
                        serviceTitle={srv.title}
                        label="Позвонить мастеру"
                        className="h-10 px-4 text-xs font-bold"
                      />
                    ) : (
                      <Link href={getDemoHref(`/booking?serviceId=${srv.id}`)}>
                        <Button size="sm" className="text-xs font-bold px-5 h-10 rounded-xl cursor-pointer">
                          Записаться
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
