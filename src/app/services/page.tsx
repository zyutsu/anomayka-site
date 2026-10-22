import React from "react";
import Link from "next/link";
import { getDatabase } from "@/lib/db";
import { Clock, Calendar, ArrowRight, PhoneCall } from "lucide-react";
import { formatPrice, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CallMasterModal } from "@/components/CallMasterModal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ServicesPage() {
  const db = getDatabase();
  const categories = db.categories.filter((c) => c.isActive);
  const services = db.services.filter((s) => s.isActive);
  const brand = db.brand;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Шапка каталога */}
      <div className="max-w-2xl space-y-2">
        <span className="text-xs font-bold text-brand-accent uppercase tracking-wider block">
          Прайс-лист и регламент
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-theme-title tracking-tight">
          Услуги автоцентра и детейлинга
        </h1>
        <p className="text-sm text-theme-muted leading-relaxed">
          Фиксированные цены и регламентное время. Выберите услугу и запишитесь на свободный слот онлайн или запросите консультацию мастера.
        </p>
      </div>

      {/* Список по категориям */}
      <div className="space-y-14">
        {categories.map((category) => {
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
                <Link href={`/booking?categoryId=${category.id}`}>
                  <span className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1">
                    Записаться в категорию <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoryServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="rounded-3xl bg-brand-surface border border-brand-border hover:border-brand-accent overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-sm group"
                  >
                    {/* Фотография услуги */}
                    {srv.imageUrl && (
                      <div className="relative h-40 w-full overflow-hidden bg-black/40">
                        <img
                          src={srv.imageUrl}
                          alt={srv.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          {srv.isPopular && (
                            <Badge variant="accent" className="text-[10px] bg-black/70 backdrop-blur-md">
                              Хит
                            </Badge>
                          )}
                          {srv.requiresCall && (
                            <Badge variant="warning" className="text-[10px] bg-black/70 backdrop-blur-md">
                              По согласованию
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <h3 className="font-bold text-theme-title text-base group-hover:text-brand-accent transition-colors">
                          {srv.title}
                        </h3>

                        <p className="text-xs text-theme-muted leading-relaxed line-clamp-3">
                          {srv.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
                        <div>
                          <div className="font-extrabold text-lg text-theme-title">
                            {formatPrice(srv.price)}
                          </div>
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
                            size="sm"
                            label="Позвонить мастеру"
                            className="h-10 px-4 text-xs font-bold"
                          />
                        ) : (
                          <Link href={`/booking?serviceId=${srv.id}`}>
                            <Button size="sm" className="text-xs font-bold px-5 h-10 rounded-xl">
                              Записаться
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
