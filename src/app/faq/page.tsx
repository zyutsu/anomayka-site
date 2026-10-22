"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, Calendar, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBrand } from "@/context/BrandContext";

export default function FAQPage() {
  const { getDemoHref } = useBrand();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Нужно ли дополнительно звонить и подтверждать запись после оформления на сайте?",
      a: "Нет, никаких подтверждающих звонков не требуется! Слот мгновенно бронируется за вашим автомобилем в сервисной базе данных. Вы сразу получаете SMS и электронный талон с уникальным номером бронирования.",
    },
    {
      q: "Как перенести или отменить запись, если мои планы изменились?",
      a: "Вы можете сделать это в личном кабинете на сайте по номеру телефона либо по персональной ссылке из SMS в 2 клика без необходимости дозваниваться до оператора.",
    },
    {
      q: "Можно ли приехать со своими запчастями и моторным маслом?",
      a: "Да, безусловно. Мы принимаем ваши оригинальные расходники и запчасти. Также вы можете заказать сертифицированные расходные материалы с нашего склада по дилерским ценам прямо во время визита.",
    },
    {
      q: "Где я могу подождать окончания обслуживания автомобиля?",
      a: "Для клиентов нашего автоцентра оборудована премиальная лаунж-зона с панорамным видом на чистую сервисную зону, зерновым итальянским кофе, высокоскоростным Wi-Fi, рабочими местами и консолью PlayStation 5.",
    },
    {
      q: "Предоставляется ли гарантия на выполненные работы?",
      a: "Да, на все выполненные регламентные и технические работы предоставляется официальная гарантия сервиса сроком от 6 месяцев до 2 лет в зависимости от вида услуги.",
    },
    {
      q: "Что если длительность работ превысит расчетное время?",
      a: "Мы закладываем технологический буфер между слотами, поэтому накладок и задержек не возникает. В случае обнаружения скрытых дефектов мастер обязательно согласует с вами все дополнительные шаги.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-accent/15 border border-brand-accent/30 mx-auto flex items-center justify-center text-brand-accent">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Часто задаваемые вопросы
        </h1>
        <p className="text-sm text-slate-400">
          Собрали ответы на самые популярные вопросы, чтобы вам не приходилось тратить время на звонки
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="rounded-2xl bg-brand-surface border border-white/5 overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
              >
                <span className="font-bold text-white text-sm sm:text-base">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-brand-accent shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Быстрый переход к записи */}
      <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-4">
        <h3 className="text-lg font-bold text-white">Не нашли ответ на свой вопрос?</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Вы можете оформить запись онлайн и указать интересующий вопрос в комментарии мастеру.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link href={getDemoHref("/booking")}>
            <Button size="md" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span>Записаться онлайн</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
