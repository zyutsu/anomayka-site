"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Category, Service, Booking } from "@/lib/types";
import { StepCategory } from "@/components/booking/StepCategory";
import { StepService } from "@/components/booking/StepService";
import { StepDateTime } from "@/components/booking/StepDateTime";
import { StepClientInfo } from "@/components/booking/StepClientInfo";
import { StepSuccess } from "@/components/booking/StepSuccess";
import { useBrand } from "@/context/BrandContext";

const STEPS = ["Услуга", "Детали", "Время", "Контакты", "Готово"];

function BookingContent() {
  const { brand, isDemo } = useBrand();
  const searchParams = useSearchParams();
  const initialCatId = searchParams.get("categoryId") || "";
  const initialSrvId = searchParams.get("serviceId") || "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [catsRes, srvsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/services"),
        ]);

        if (!catsRes.ok || !srvsRes.ok) throw new Error("load failed");

        let catsData: Category[] = await catsRes.json();
        let srvsData: Service[] = await srvsRes.json();

        if (isDemo && typeof window !== "undefined") {
          try {
            const demoCats = sessionStorage.getItem("anomayka_demo_categories");
            if (demoCats) catsData = JSON.parse(demoCats);
            const demoSrvs = sessionStorage.getItem("anomayka_demo_services");
            if (demoSrvs) srvsData = JSON.parse(demoSrvs);
          } catch (e) {}
        }

        catsData = catsData.filter((c) => c.isActive).sort((a, b) => a.order - b.order);
        srvsData = srvsData.filter((s) => s.isActive);

        setCategories(catsData);
        setServices(srvsData);

        if (initialSrvId) {
          const foundSrv = srvsData.find((s) => s.id === initialSrvId);
          if (foundSrv) {
            setSelectedCategory(catsData.find((c) => c.id === foundSrv.categoryId) || catsData[0] || null);
            setSelectedService(foundSrv);
            setStep(3);
            return;
          }
        }

        if (initialCatId) {
          const foundCat = catsData.find((c) => c.id === initialCatId);
          if (foundCat) {
            setSelectedCategory(foundCat);
            setStep(2);
          }
        }
      } catch (e) {
        setErrorMessage("Не удалось загрузить каталог. Проверьте соединение и попробуйте ещё раз.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
    window.addEventListener("anomayka_demo_data_updated", loadData);
    return () => window.removeEventListener("anomayka_demo_data_updated", loadData);
  }, [initialCatId, initialSrvId, isDemo]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleSubmitBooking = async (clientData: {
    clientName: string;
    clientPhone: string;
    carModel: string;
    comment: string;
  }) => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isDemo ? { "x-demo-mode": "1" } : {}),
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date: selectedDate,
          time: selectedTime,
          isDemo,
          ...clientData,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не удалось создать запись");

      if (isDemo && typeof window !== "undefined" && result.booking) {
        try {
          const stored = sessionStorage.getItem("anomayka_demo_bookings");
          const list = stored ? JSON.parse(stored) : [];
          list.unshift(result.booking);
          sessionStorage.setItem("anomayka_demo_bookings", JSON.stringify(list));
        } catch (e) {}
      }

      setCreatedBooking(result.booking);
      setStep(5);
    } catch (err: any) {
      setErrorMessage(err?.message || "Не удалось завершить запись");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedService(null);
    setSelectedDate("");
    setSelectedTime("");
    setCreatedBooking(null);
    setErrorMessage("");
    setStep(1);
  };

  const stepIndex = Math.min(step, 5);

  return (
    <div className="page-shell pb-16 pt-8 sm:pt-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-theme-muted transition-colors hover:text-theme-title"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          На главную
        </Link>
        <p className="text-[11px] text-theme-muted">
          {brand.name} · {brand.workHours}
        </p>
      </div>

      <ol className="mb-8 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none" aria-label="Этапы записи">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = stepIndex > n;
          const current = stepIndex === n;
          return (
            <li key={label} className="flex shrink-0 items-center gap-1">
              <span
                className={
                  "flex items-center gap-2 rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-colors " +
                  (current
                    ? "bg-theme-title text-brand-primary"
                    : done
                    ? "text-theme-title"
                    : "text-theme-muted")
                }
              >
                <span
                  className={
                    "flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold " +
                    (done
                      ? "border-brand-accent bg-brand-accent text-white"
                      : current
                      ? "border-transparent bg-brand-primary text-theme-title"
                      : "border-brand-border text-theme-muted")
                  }
                >
                  {done ? <Check className="h-3 w-3" /> : n}
                </span>
                {label}
              </span>
              {i < STEPS.length - 1 && <span className="h-px w-3 bg-brand-border sm:w-5" />}
            </li>
          );
        })}
      </ol>

      <div className="rounded-[26px] border border-brand-border bg-brand-surface/60 p-5 sm:p-8">
        {isLoading ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-theme-muted">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
            <span className="text-[12px]">Загружаем каталог услуг…</span>
          </div>
        ) : errorMessage && !selectedService ? (
          <div className="py-10 text-center">
            <p className="text-[13px] text-theme-title">{errorMessage}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-brand-accent px-5 py-2 text-[12px] font-semibold text-white"
            >
              Попробовать снова
            </button>
          </div>
        ) : (
          <>
            {step === 1 && (
              <StepCategory
                categories={categories}
                selectedCategoryId={selectedCategory?.id || ""}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  setStep(2);
                }}
              />
            )}

            {step === 2 && selectedCategory && (
              <StepService
                category={selectedCategory}
                services={services.filter((s) => s.categoryId === selectedCategory.id)}
                selectedServiceId={selectedService?.id || ""}
                onSelectService={(srv) => {
                  setSelectedService(srv);
                  setStep(3);
                }}
                onBack={() => setStep(1)}
                phone={brand.phone}
                phoneRaw={brand.phoneRaw}
              />
            )}

            {step === 3 && selectedService && (
              <StepDateTime
                service={selectedService}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSelectDateTime={(date, time) => {
                  setSelectedDate(date);
                  setSelectedTime(time);
                  setStep(4);
                }}
                onBack={() => setStep(2)}
              />
            )}

            {step === 4 && selectedService && (
              <StepClientInfo
                service={selectedService}
                date={selectedDate}
                time={selectedTime}
                onSubmit={handleSubmitBooking}
                onBack={() => setStep(3)}
                isSubmitting={isSubmitting}
                errorMessage={errorMessage}
              />
            )}

            {step === 5 && createdBooking && (
              <StepSuccess booking={createdBooking} brand={brand} onReset={handleReset} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-[13px] text-theme-muted">
          Загрузка онлайн-записи…
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}

