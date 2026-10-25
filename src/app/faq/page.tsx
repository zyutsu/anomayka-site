"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import { useBrand } from "@/context/BrandContext";

const FAQS = [
  {
    q: "Нужно ли звонить и подтверждать запись?",
    a: "Нет. После отправки формы слот сразу закрепляется за вашим автомобилем, а на экране появляется талон с номером брони. Дополнительный звонок не нужен.",
  },
  {
    q: "Как перенести или отменить визит?",
    a: "В разделе «Мои записи» введите номер телефона, который указывали при записи. Там можно перенести время или отменить визит — слот сразу освободится.",
  },
  {
    q: "Можно ли приехать со своими запчастями и маслом?",
    a: "Да. Мы принимаем ваши оригинальные расходники и запчасти. Если чего-то не хватает, предложим сертифицированные аналоги со склада.",
  },
  {
    q: "Где подождать, пока идут работы?",
    a: "В клиентской зоне есть места для ожидания, кофе и Wi-Fi. Уточните у администратора, если нужна зона с видом на сервис.",
  },
  {
    q: "Даётся ли гарантия на работы?",
    a: "Да, на выполненные регламентные и технические работы действует гарантия сервиса. Срок зависит от вида работ — его фиксируют в заказ-наряде.",
  },
  {
    q: "Что если работа займёт больше времени?",
    a: "Между слотами заложен технологический запас. Если мастер обнаружит скрытый дефект, он согласует с вами дополнительные работы и стоимость до их выполнения.",
  },
  {
    q: "Зачем указывать модель автомобиля?",
    a: "Так мастер заранее подготовит нужные расходники и инструмент. Поле необязательное, но помогает сократить время визита.",
  },
];

export default function FAQPage() {
  const { getDemoHref } = useBrand();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div>
      <div className="border-b border-brand-border">
        <div className="page-shell py-10 sm:py-14">
          <p className="eyebrow mb-3">Вопросы и ответы</p>
          <h1 className="heading text-[clamp(2rem,4.4vw,3.2rem)] text-theme-title">
            Коротко о важном
          </h1>
          <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-theme-muted sm:text-sm">
            Собрали то, что чаще всего спрашивают до первого визита.
          </p>
        </div>
      </div>

      <div className="page-shell section-tight">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[13px] leading-relaxed text-theme-muted">
              Не нашли ответ? Позвоните — администратор поможет с записью и
              подскажет по услугам.
            </p>
            <Link
              href={getDemoHref("/booking")}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-brand-accent px-5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-accentHover"
            >
              Записаться онлайн
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="divide-y divide-brand-border border-y border-brand-border">
            {FAQS.map((faq, idx) => {
              const isOpen = open === idx;
              return (
                <div key={faq.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : idx)}
                    className="flex w-full items-start justify-between gap-5 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[14px] font-medium leading-snug text-theme-title">
                      {faq.q}
                    </span>
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-brand-border text-theme-muted">
                      {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                  {isOpen && (
                    <p className="-mt-1 max-w-2xl pb-5 pr-10 text-[13px] leading-relaxed text-theme-muted">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

