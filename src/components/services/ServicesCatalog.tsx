"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Clock3, PhoneCall } from "lucide-react";
import { Category, Service } from "@/lib/types";
import { formatPrice, formatDuration } from "@/lib/utils";
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
  const [activeCat, setActiveCat] = React.useState<string>("all");

  React.useEffect(() => {
    const update = () => {
      if (isDemo && typeof window !== "undefined") {
        try {
          const demoCats = sessionStorage.getItem("anomayka_demo_categories");
          setCategories(
            demoCats
              ? JSON.parse(demoCats).filter((c: Category) => c.isActive)
              : initialCategories
          );

          const demoSrvs = sessionStorage.getItem("anomayka_demo_services");
          setServices(
            demoSrvs
              ? JSON.parse(demoSrvs).filter((s: Service) => s.isActive)
              : initialServices
          );
          return;
        } catch (e) {}
      }
      setCategories(initialCategories);
      setServices(initialServices);
    };

    update();
    window.addEventListener("anomayka_demo_data_updated", update);
    return () => window.removeEventListener("anomayka_demo_data_updated", update);
  }, [isDemo, initialCategories, initialServices]);

  const ordered = React.useMemo(() => {
    if (!demoType) return categories;
    const priority = demoType === "detailing" ? ["детейл", "мойк", "кузов"] : demoType === "tire" ? ["шин", "колес", "диск"] : [];
    if (priority.length === 0) return categories;
    return [...categories].sort((a, b) => {
      const aHit = priority.some((p) => a.title.toLowerCase().includes(p));
      const bHit = priority.some((p) => b.title.toLowerCase().includes(p));
      return aHit === bHit ? 0 : aHit ? -1 : 1;
    });
  }, [categories, demoType]);

  const visible = activeCat === "all" ? ordered : ordered.filter((c) => c.id === activeCat);

  return (
    <div className="space-y-10">
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => setActiveCat("all")}
          className={
            "shrink-0 rounded-full border px-4 py-2 text-[12px] font-medium transition-colors " +
            (activeCat === "all"
              ? "border-transparent bg-theme-title text-brand-primary"
              : "border-brand-border text-theme-muted hover:text-theme-title")
          }
        >
          Все направления
        </button>
        {ordered.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCat(cat.id)}
            className={
              "shrink-0 rounded-full border px-4 py-2 text-[12px] font-medium transition-colors " +
              (activeCat === cat.id
                ? "border-transparent bg-theme-title text-brand-primary"
                : "border-brand-border text-theme-muted hover:text-theme-title")
            }
          >
            {cat.title}
          </button>
        ))}
      </div>

      <div className="space-y-14">
        {visible.map((category) => {
          const categoryServices = services.filter((s) => s.categoryId === category.id);
          if (categoryServices.length === 0) return null;

          return (
            <section key={category.id} className="space-y-5 scroll-mt-28" id={category.id}>
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-brand-border pb-4">
                <div>
                  <h2 className="heading text-[clamp(1.35rem,2.6vw,1.8rem)] text-theme-title">
                    {category.title}
                  </h2>
                  <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-theme-muted">
                    {category.description}
                  </p>
                </div>
                <Link
                  href={getDemoHref("/booking?categoryId=" + category.id)}
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-theme-muted transition-colors hover:text-theme-title"
                >
                  Записаться в категорию
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid gap-2.5 md:grid-cols-2">
                {categoryServices.map((srv) => (
                  <article
                    key={srv.id}
                    className="group flex flex-col justify-between gap-5 rounded-2xl border border-brand-border bg-brand-surface p-5 transition-colors hover:border-brand-accent/40"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-[14px] font-semibold leading-snug text-theme-title">
                          {srv.title}
                        </h3>
                        {srv.isPopular && (
                          <Badge variant="accent" className="shrink-0">
                            Хит
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-theme-muted">
                        {srv.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-brand-border/70 pt-4">
                      <div>
                        <p className="text-[16px] font-bold text-theme-title">
                          {formatPrice(srv.price)}
                        </p>
                        <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-theme-muted">
                          <Clock3 className="h-3 w-3" />
                          {formatDuration(srv.durationMinutes)}
                        </p>
                      </div>

                      {srv.requiresCall ? (
                        <CallMasterModal
                          phone={brand.phone}
                          phoneRaw={brand.phoneRaw}
                          serviceTitle={srv.title}
                          label="Уточнить"
                          className="h-9 px-4 text-[12px]"
                        />
                      ) : (
                        <Link
                          href={getDemoHref("/booking?serviceId=" + srv.id)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--brand-secondary)] px-4 text-[12px] font-semibold text-theme-title transition-colors hover:bg-brand-accent hover:text-white"
                        >
                          Записаться
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-brand-border bg-brand-surface px-6 py-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-[14px] font-semibold text-theme-title">
            Не нашли нужную услугу?
          </p>
          <p className="mt-1 text-[12px] text-theme-muted">
            Позвоните мастеру — подскажем по работам и стоимости.
          </p>
        </div>
        <a
          href={"tel:" + (brand.phoneRaw || brand.phone)}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-brand-border px-4 text-[12px] font-medium text-theme-title transition-colors hover:border-brand-accent/60"
        >
          <PhoneCall className="h-4 w-4 text-brand-accent" />
          {brand.phone}
        </a>
      </div>
    </div>
  );
}

