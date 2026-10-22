"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Service } from "@/lib/types";
import { useBrand } from "@/context/BrandContext";
import { ChevronRight } from "lucide-react";
import { formatPrice, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function HomePopularServices({ initialServices }: { initialServices: Service[] }) {
  const { isDemo, getDemoHref } = useBrand();
  const [services, setServices] = useState<Service[]>(initialServices);

  useEffect(() => {
    if (isDemo && typeof window !== "undefined") {
      try {
        const demoSrvs = sessionStorage.getItem("anomayka_demo_services");
        if (demoSrvs) {
          const parsed: Service[] = JSON.parse(demoSrvs);
          setServices(parsed.filter((s) => s.isActive && s.isPopular).slice(0, 4));
          return;
        }
      } catch (e) {}
    }
    setServices(initialServices.filter((s) => s.isActive && s.isPopular).slice(0, 4));
  }, [isDemo, initialServices]);

  if (services.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-theme-title tracking-tight">
          Популярные процедуры
        </h2>
        <Link
          href={getDemoHref("/services")}
          className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1"
        >
          <span>Все услуги</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="rounded-3xl bg-brand-surface border border-brand-border overflow-hidden flex flex-col justify-between hover:border-brand-accent transition-all group shadow-sm"
          >
            {srv.imageUrl && (
              <div className="relative h-36 w-full overflow-hidden bg-black/40">
                <img
                  src={srv.imageUrl}
                  alt={srv.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-bold text-theme-title text-sm group-hover:text-brand-accent transition-colors">
                  {srv.title}
                </h3>
                <p className="text-xs text-theme-muted line-clamp-2 mt-1 leading-relaxed">
                  {srv.description}
                </p>
              </div>

              <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-theme-title text-sm block">
                    {formatPrice(srv.price)}
                  </span>
                  <span className="text-[10px] text-theme-muted">
                    {formatDuration(srv.durationMinutes)}
                  </span>
                </div>

                <Link href={getDemoHref(`/booking?serviceId=${srv.id}`)}>
                  <Button size="sm" className="h-8 px-3 rounded-xl text-xs font-semibold cursor-pointer">
                    Записаться
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
