"use client";

import React, { useState } from "react";
import { BrandSettings, BlockedSlot } from "@/lib/types";
import { Clock, Plus, Trash2, Calendar, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminScheduleProps {
  brand: BrandSettings;
  blockedSlots: BlockedSlot[];
  onSaveSchedule: (settings: { openTime: string; closeTime: string; slotDurationMinutes: number }) => Promise<void>;
  onAddBlockedSlot: (slot: BlockedSlot) => Promise<void>;
  onDeleteBlockedSlot: (id: string) => Promise<void>;
}

export function AdminSchedule({
  brand,
  blockedSlots,
  onSaveSchedule,
  onAddBlockedSlot,
  onDeleteBlockedSlot,
}: AdminScheduleProps) {
  const [openTime, setOpenTime] = useState(brand.openTime || "09:00");
  const [closeTime, setCloseTime] = useState(brand.closeTime || "21:00");
  const [slotStep, setSlotStep] = useState(brand.slotDurationMinutes || 30);
  const [isSaving, setIsSaving] = useState(false);

  // Форма добавления блокировки
  const [newBlock, setNewBlock] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "13:00",
    endTime: "14:00",
    reason: "Обеденный перерыв / Тех. окно",
  });

  const handleSaveHours = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSchedule({
        openTime,
        closeTime,
        slotDurationMinutes: Number(slotStep),
      });
      alert("График работы успешно обновлен!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddBlockedSlot({
      id: `block-${Date.now()}`,
      date: newBlock.date,
      startTime: newBlock.startTime,
      endTime: newBlock.endTime,
      reason: newBlock.reason,
    });
    setNewBlock({
      date: new Date().toISOString().split("T")[0],
      startTime: "13:00",
      endTime: "14:00",
      reason: "Обеденный перерыв / Тех. окно",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-theme-title tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-accent" />
          График работы и управление слотами
        </h2>
        <p className="text-xs text-theme-muted mt-1">
          Настройка рабочих часов сервиса, шага формирования временной сетки и блокировка технологических окон
        </p>
      </div>

      {/* Основные часы работы */}
      <form onSubmit={handleSaveHours} className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
        <h3 className="text-sm font-bold text-theme-title uppercase tracking-wider">
          Рабочие часы автоцентра
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Время открытия"
            type="text"
            placeholder="09:00"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            required
          />
          <Input
            label="Время закрытия"
            type="text"
            placeholder="21:00"
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-medium text-theme-title mb-1.5">
              Базовый шаг слотов записи
            </label>
            <select
              value={slotStep}
              onChange={(e) => setSlotStep(Number(e.target.value))}
              className="w-full h-11 px-3 rounded-xl bg-[var(--brand-secondary)] border border-brand-border text-xs text-theme-title focus:outline-none focus:border-brand-accent"
            >
              <option value={15}>15 минут (Экспресс-услуги)</option>
              <option value={30}>30 минут (Рекомендуется)</option>
              <option value={60}>60 минут (Почасовой шаг)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" size="sm" isLoading={isSaving}>
            Сохранить часы работы
          </Button>
        </div>
      </form>

      {/* Блокировка слотов (Обед, техперерыв, праздники) */}
      <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
        <h3 className="text-sm font-bold text-theme-title uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Блокировка слотов и технологические окна
        </h3>
        <p className="text-xs text-theme-muted">
          Заблокированное время автоматически становится недоступным для записи клиентов на сайте
        </p>

        {/* Форма добавления блокировки */}
        <form onSubmit={handleAddBlockSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end bg-[var(--brand-secondary)] p-4 rounded-xl border border-brand-border">
          <Input
            label="Дата"
            type="date"
            value={newBlock.date}
            onChange={(e) => setNewBlock({ ...newBlock, date: e.target.value })}
            required
          />
          <Input
            label="С (время)"
            type="text"
            placeholder="13:00"
            value={newBlock.startTime}
            onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
            required
          />
          <Input
            label="По (время)"
            type="text"
            placeholder="14:00"
            value={newBlock.endTime}
            onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
            required
          />
          <Button type="submit" size="sm" className="h-11 gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Блокировать
          </Button>
        </form>

        {/* Список активных блокировок */}
        <div className="space-y-2 pt-2">
          {blockedSlots.length === 0 ? (
            <p className="text-xs text-theme-muted py-3 text-center">
              Нет активных блокировок слотов. Все рабочие часы открыты для записи.
            </p>
          ) : (
            blockedSlots.map((bs) => (
              <div
                key={bs.id}
                className="p-3 rounded-xl bg-[var(--brand-secondary)] border border-brand-border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                    {bs.date} {bs.startTime} - {bs.endTime}
                  </span>
                  <span className="text-theme-title font-medium">{bs.reason}</span>
                </div>
                <button
                  onClick={() => onDeleteBlockedSlot(bs.id)}
                  className="p-1 text-theme-muted hover:text-red-400 transition-colors"
                  title="Удалить блокировку"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
