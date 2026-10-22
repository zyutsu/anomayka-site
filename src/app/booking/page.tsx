"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Category, Service, Booking, BrandSettings } from "@/lib/types";
import { StepCategory } from "@/components/booking/StepCategory";
import { StepService } from "@/components/booking/StepService";
import { StepDateTime } from "@/components/booking/StepDateTime";
import { StepClientInfo } from "@/components/booking/StepClientInfo";
import { StepSuccess } from "@/components/booking/StepSuccess";
import { Check } from "lucide-react";
import { useBrand } from "@/context/BrandContext";

function BookingContent() {
  const { brand, isDemo } = useBrand();
  const searchParams = useSearchParams();
  const initialCatId = searchParams.get("categoryId") || "";
  const initialSrvId = searchParams.get("serviceId") || "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Состояние шагов мастера
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Загрузка начальных данных
  useEffect(() => {
    async function loadData() {
      try {
        const [catsRes, srvsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/services"),
        ]);

        if (catsRes.ok && srvsRes.ok) {
          let catsData: Category[] = await catsRes.json();
          let srvsData: Service[] = await srvsRes.json();

          // В демо-режиме подгружаем изолированные категории и услуги текущей вкладки
          if (isDemo && typeof window !== "undefined") {
            try {
              const demoCats = sessionStorage.getItem("anomayka_demo_categories");
              if (demoCats) catsData = JSON.parse(demoCats);

              const demoSrvs = sessionStorage.getItem("anomayka_demo_services");
              if (demoSrvs) srvsData = JSON.parse(demoSrvs);
            } catch (e) {}
          }

          catsData = catsData.filter((c) => c.isActive);
          srvsData = srvsData.filter((s) => s.isActive);

          setCategories(catsData);
          setServices(srvsData);

          // Проверка прямых переходов по query-параметрам
          if (initialSrvId) {
            const foundSrv = srvsData.find((s) => s.id === initialSrvId);
            if (foundSrv) {
              const foundCat = catsData.find((c) => c.id === foundSrv.categoryId);
              setSelectedCategory(foundCat || catsData[0]);
              setSelectedService(foundSrv);
              setStep(3); // сразу к выбору даты
              return;
            }
          }

          if (initialCatId) {
            const foundCat = catsData.find((c) => c.id === initialCatId);
            if (foundCat) {
              setSelectedCategory(foundCat);
              setStep(2); // сразу к услугам категории
            }
          }
        }
      } catch (e) {
        console.error("Ошибка загрузки данных записи:", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [initialCatId, initialSrvId]);

  // Плавный скролл наверх страницы при переходе между шагами
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Обработчики шагов
  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setStep(2);
  };

  const handleSelectService = (srv: Service) => {
    setSelectedService(srv);
    setStep(3);
  };

  const handleSelectDateTime = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setStep(4);
  };

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

      if (!response.ok) {
        throw new Error(result.error || "Ошибка при сохранении записи");
      }

      // В демо-режиме сохраняем бронь локально в сессию вкладки
      if (isDemo && typeof window !== "undefined" && result.booking) {
        try {
          const stored = sessionStorage.getItem("anomayka_demo_bookings");
          const list = stored ? JSON.parse(stored) : [];
          list.unshift(result.booking);
          sessionStorage.setItem("anomayka_demo_bookings", JSON.stringify(list));
        } catch (e) {}
      }

      setCreatedBooking(result.booking);
      setStep(5); // Переход к экрану успешного подтверждения
    } catch (err: any) {
      setErrorMessage(err.message || "Не удалось завершить запись");
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

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Загрузка мастера записи...</span>
      </div>
    );
  }

  const stepsList = [
    { num: 1, title: "Категория" },
    { num: 2, title: "Услуга" },
    { num: 3, title: "Время" },
    { num: 4, title: "Контакты" },
    { num: 5, title: "Талон" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Шаги (Stepper) */}
      <div className="relative">
        <div className="flex items-center justify-between max-w-2xl mx-auto relative z-10">
          {stepsList.map((s) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;

            return (
              <div key={s.num} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                    isCompleted
                      ? "bg-brand-accent border-brand-accent text-white"
                      : isCurrent
                      ? "bg-brand-surface border-brand-accent text-brand-accent ring-4 ring-brand-accent/20"
                      : "bg-brand-surface border-white/10 text-slate-500"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-medium ${
                    isCurrent ? "text-white font-bold" : "text-slate-500"
                  }`}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Фоновая линия прогресса */}
        <div className="absolute top-4 sm:top-4.5 left-1/2 -translate-x-1/2 w-[70%] max-w-xl h-[2px] bg-white/10 -z-0" />
      </div>

      {/* Контейнер текущего шага */}
      <div className="bg-brand-surface/40 border border-white/5 rounded-3xl p-6 sm:p-10 backdrop-blur-sm shadow-2xl">
        {step === 1 && (
          <StepCategory
            categories={categories}
            selectedCategoryId={selectedCategory?.id || ""}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {step === 2 && selectedCategory && (
          <StepService
            category={selectedCategory}
            services={services.filter((s) => s.categoryId === selectedCategory.id)}
            selectedServiceId={selectedService?.id || ""}
            onSelectService={handleSelectService}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && selectedService && (
          <StepDateTime
            service={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSelectDateTime={handleSelectDateTime}
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

        {step === 5 && createdBooking && brand && (
          <StepSuccess
            booking={createdBooking}
            brand={brand}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
          Загрузка онлайн-записи...
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
