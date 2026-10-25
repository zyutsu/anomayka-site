"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { Service } from "@/lib/types";
import { useBrand } from "@/context/BrandContext";
import { formatPrice, formatDuration } from "@/lib/utils";

export function HomePopularServices({ initialServices }: { initialServices: Service[] }) {
  const { isDemo, getDemoHref } = useBrand();
  const [services, setServices] = useState<Service[]>(initialServices);

  useEffect(() => {
    const update = () => {
      if (isDemo && typeof window !== "undefined") {
        try {
          const demoSrvs = sessionStorage.getItem("anomayka_demo_services");
          if (demoSrvs) {
            setServices(JSON.parse(demoSrvs).filter((s: Service) => s.isActive && s.isPopular).slice(0, 4));
            return;
          }
        } catch (e) {}
      }
      setServices(initialServices.filter((s) => s.isActive && s.isPopular).slice(0, 4));
    };

    update();
    window.addEventListener("anomayka_demo_data_updated", update);
    return () => window.removeEventListener("anomayka_demo_data_updated", update);
  }, [isDemo, initialServices]);

  if (services.length === 0) return null;

  return (
    <section className="section-tight">
      <div className="page-shell">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">Чаще всего выбирают</p>
            <h2 className="heading text-[clamp(1.7rem,3.4vw,2.5rem)] text-theme-title">
              Популярные услуги
            </h2>
          </div>
          <Link
            href={getDemoHref("/services")}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-theme-muted transition-colors hover:text-theme-title"
          >
            Все услуги
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((srv) => (
            <Link
              key={srv.id}
              href={getDemoHref("/booking?serviceId=" + srv.id)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-brand-surface transition-all duration-300 hover:border-brand-accent/50"
            >
              <div className="relative h-[132px] overflow-hidden bg-[var(--brand-secondary)]">
                {srv.imageUrl ? (
                  <img
                    src={srv.imageUrl}
                    alt={srv.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(var(--brand-accent-rgb),0.25),transparent_65%)]" />
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between gap-4 p-4">
                <div>
                  <h3 className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-theme-title">
                    {srv.title}
                  </h3>
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-theme-muted">
                    <Clock3 className="h-3 w-3" />
                    {formatDuration(srv.durationMinutes)}
                  </p>
                </div>

                <div className="flex items-end justify-between border-t border-brand-border/70 pt-3">
                  <span className="text-[15px] font-bold text-theme-title">
                    {formatPrice(srv.price)}
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-border text-theme-muted transition-colors group-hover:border-brand-accent group-hover:text-brand-accent">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

