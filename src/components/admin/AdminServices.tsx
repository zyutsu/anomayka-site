"use client";

import React, { useState } from "react";
import { Service, Category } from "@/lib/types";
import { Plus, Edit2, Trash2, Clock, Check, Eye, EyeOff, Star, PhoneCall } from "lucide-react";
import { formatPrice, formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminServicesProps {
  categories: Category[];
  services: Service[];
  onSaveService: (srv: Service) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
  onSaveCategory: (cat: Category) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export function AdminServices({
  categories,
  services,
  onSaveService,
  onDeleteService,
  onSaveCategory,
  onDeleteCategory,
}: AdminServicesProps) {

  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all");
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  const filteredServices =
    selectedCategoryTab === "all"
      ? services
      : services.filter((s) => s.categoryId === selectedCategoryTab);

  const handleOpenAddService = () => {
    setEditingService({
      id: "",
      categoryId: categories[0]?.id || "",
      title: "",
      description: "",
      price: 2500,
      durationMinutes: 45,
      imageUrl: "",
      isActive: true,
      isPopular: false,
      requiresCall: false,
    });
  };

  const handleSaveServiceForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.title) return;

    await onSaveService({
      id: editingService.id || `srv-${Date.now()}`,
      categoryId: editingService.categoryId || categories[0]?.id || "",
      title: editingService.title.trim(),
      description: editingService.description || "",
      price: Number(editingService.price) || 0,
      durationMinutes: Number(editingService.durationMinutes) || 30,
      imageUrl: editingService.imageUrl || "",
      isActive: editingService.isActive ?? true,
      isPopular: editingService.isPopular ?? false,
      requiresCall: editingService.requiresCall ?? false,
    });

    setEditingService(null);
  };

  const handleSaveCategoryForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.title) return;

    await onSaveCategory({
      id: editingCategory.id || `cat-${Date.now()}`,
      title: editingCategory.title.trim(),
      slug: (editingCategory.title || "").toLowerCase().replace(/\s+/g, "-"),
      description: editingCategory.description || "",
      icon: editingCategory.icon || "Wrench",
      imageUrl: editingCategory.imageUrl || "",
      order: editingCategory.order || categories.length + 1,
      isActive: editingCategory.isActive ?? true,
    });

    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Шапка раздела */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-theme-title tracking-tight">
            Управление услугами и прайс-листом
          </h2>
          <p className="text-xs text-theme-muted mt-1">
            Редактируйте цены, описания и отмечайте сложные услуги, требующие звонка мастера
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsCategoryManagerOpen(true)}
            className="text-xs rounded-xl"
          >
            Категории ({categories.length})
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              setEditingCategory({
                id: "",
                title: "",
                description: "",
                icon: "Wrench",
                imageUrl: "",
                isActive: true,
              })
            }
            className="text-xs rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" /> Категория
          </Button>

          <Button size="sm" onClick={handleOpenAddService} className="text-xs rounded-xl font-bold shadow-md shadow-brand-accent/20">
            <Plus className="w-3.5 h-3.5" /> Добавить услугу
          </Button>
        </div>
      </div>

      {/* Вкладки категорий с быстрым управлением и удалением */}
      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none items-center">
          <button
            onClick={() => setSelectedCategoryTab("all")}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
              selectedCategoryTab === "all"
                ? "bg-brand-accent border-brand-accent text-white shadow-sm"
                : "bg-brand-surface border-brand-border text-theme-title hover:border-brand-accent/50"
            }`}
          >
            Все ({services.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryTab(c.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                selectedCategoryTab === c.id
                  ? "bg-brand-accent border-brand-accent text-white shadow-sm"
                  : "bg-brand-surface border-brand-border text-theme-title hover:border-brand-accent/50"
              }`}
            >
              {c.title} ({services.filter((s) => s.categoryId === c.id).length})
            </button>
          ))}
        </div>

        {/* Панель выбранной категории: редактирование и удаление */}
        {selectedCategoryTab !== "all" && (() => {
          const currentCat = categories.find((c) => c.id === selectedCategoryTab);
          if (!currentCat) return null;
          const catServicesCount = services.filter((s) => s.categoryId === currentCat.id).length;

          return (
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="text-theme-muted">Категория:</span>
                <strong className="text-theme-title text-sm">{currentCat.title}</strong>
                <span className="text-theme-muted text-[11px]">({catServicesCount} услуг)</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingCategory(currentCat)}
                  className="h-8 px-3 text-xs rounded-xl"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1 text-brand-accent" />
                  Редактировать
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    if (
                      confirm(
                        `Удалить категорию «${currentCat.title}»? Все услуги этой категории (${catServicesCount} шт.) также будут удалены.`
                      )
                    ) {
                      await onDeleteCategory(currentCat.id);
                      setSelectedCategoryTab("all");
                    }
                  }}
                  className="h-8 px-3 text-xs rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Удалить категорию
                </Button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Таблица / карточки услуг */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map((srv) => {
          const category = categories.find((c) => c.id === srv.categoryId);

          return (
            <div
              key={srv.id}
              className={`p-5 rounded-3xl bg-brand-surface border transition-all space-y-3 shadow-sm ${
                srv.isActive
                  ? "border-brand-border hover:border-brand-accent"
                  : "border-red-900/30 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold text-brand-accent uppercase tracking-wider block">
                      {category?.title || "Общее"}
                    </span>
                    {srv.requiresCall && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold flex items-center gap-1">
                        <PhoneCall className="w-2.5 h-2.5" /> По звонку
                      </span>
                    )}
                    {srv.isPopular && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-accent/20 text-brand-accent font-semibold">
                        Хит
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-theme-title text-sm">{srv.title}</h4>
                  <p className="text-xs text-theme-muted line-clamp-2 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditingService(srv)}
                    className="p-2 rounded-xl text-theme-muted hover:text-theme-title hover:bg-white/5 transition-colors"
                    title="Редактировать"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Удалить услугу «${srv.title}»?`)) {
                        onDeleteService(srv.id);
                      }
                    }}
                    className="p-2 rounded-xl text-theme-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <strong className="text-theme-title text-base">{formatPrice(srv.price)}</strong>
                  <span className="flex items-center gap-1 text-theme-muted bg-brand-secondary px-2.5 py-0.5 rounded-lg border border-brand-border">
                    <Clock className="w-3 h-3 text-brand-accent" />
                    {formatDuration(srv.durationMinutes)}
                  </span>
                </div>

                <button
                  onClick={() =>
                    onSaveService({
                      ...srv,
                      isActive: !srv.isActive,
                    })
                  }
                  className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full cursor-pointer transition-colors ${
                    srv.isActive
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/15 text-red-400 border border-red-500/30"
                  }`}
                >
                  {srv.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{srv.isActive ? "Активна" : "Скрыта"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Модалка редактирования услуги */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-brand-surface border border-brand-border rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-theme-title">
              {editingService.id ? "Редактировать услугу" : "Добавить новую услугу"}
            </h3>

            <form onSubmit={handleSaveServiceForm} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Категория</label>
                <select
                  value={editingService.categoryId}
                  onChange={(e) =>
                    setEditingService({ ...editingService, categoryId: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-2xl bg-black/40 border border-brand-border text-theme-title focus:outline-none focus:border-brand-accent"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Название услуги *"
                placeholder="Замена моторного масла..."
                value={editingService.title || ""}
                onChange={(e) =>
                  setEditingService({ ...editingService, title: e.target.value })
                }
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Цена (руб) *"
                  type="number"
                  value={editingService.price ?? 0}
                  onChange={(e) =>
                    setEditingService({ ...editingService, price: Number(e.target.value) })
                  }
                  required
                />
                <Input
                  label="Длительность (в минутах) *"
                  type="number"
                  step="15"
                  value={editingService.durationMinutes ?? 30}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      durationMinutes: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300">Подробное описание процедуры</label>
                <textarea
                  rows={3}
                  value={editingService.description || ""}
                  onChange={(e) =>
                    setEditingService({ ...editingService, description: e.target.value })
                  }
                  placeholder="Что входит в услугу, гарантии, материалы..."
                  className="w-full rounded-2xl bg-black/40 border border-brand-border p-3 text-theme-title focus:outline-none focus:border-brand-accent resize-none"
                />
              </div>

              <Input
                label="Ссылка на фото услуги (URL или /uploads/...)"
                placeholder="/uploads/... или https://..."
                value={editingService.imageUrl || ""}
                onChange={(e) =>
                  setEditingService({ ...editingService, imageUrl: e.target.value })
                }
              />

              {/* Чекбоксы: Активность, Хит, Сложная услуга */}
              <div className="space-y-2 pt-2 border-t border-brand-border/60">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingService.isActive ?? true}
                    onChange={(e) =>
                      setEditingService({ ...editingService, isActive: e.target.checked })
                    }
                    className="rounded text-brand-accent focus:ring-brand-accent"
                  />
                  <span className="text-theme-title font-medium">Отображать на сайте</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingService.isPopular ?? false}
                    onChange={(e) =>
                      setEditingService({ ...editingService, isPopular: e.target.checked })
                    }
                    className="rounded text-brand-accent focus:ring-brand-accent"
                  />
                  <span className="text-theme-title font-medium">Популярная услуга («Хит»)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <input
                    type="checkbox"
                    checked={editingService.requiresCall ?? false}
                    onChange={(e) =>
                      setEditingService({ ...editingService, requiresCall: e.target.checked })
                    }
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-amber-300 font-semibold">
                    Сложная услуга (запись только через звонок / консультацию мастера)
                  </span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-brand-border/60">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingService(null)}
                >
                  Отмена
                </Button>
                <Button type="submit" size="sm">
                  Сохранить услугу
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модалка категории */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-theme-title">Категория услуг</h3>
            <form onSubmit={handleSaveCategoryForm} className="space-y-3 text-xs">
              <Input
                label="Название категории *"
                placeholder="Например: Кузовной ремонт"
                value={editingCategory.title || ""}
                onChange={(e) =>
                  setEditingCategory({ ...editingCategory, title: e.target.value })
                }
                required
              />
              <div className="space-y-1">
                <label className="block text-slate-300">Краткое описание</label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ""}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, description: e.target.value })
                  }
                  className="w-full rounded-2xl bg-black/40 border border-brand-border p-3 text-theme-title focus:outline-none focus:border-brand-accent resize-none"
                />
              </div>
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-brand-border/60">
                {editingCategory.id ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (
                        confirm(
                          `Удалить категорию «${editingCategory.title}»? Все услуги этой категории также будут удалены.`
                        )
                      ) {
                        await onDeleteCategory(editingCategory.id!);
                        setEditingCategory(null);
                        setSelectedCategoryTab("all");
                      }
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Удалить
                  </Button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCategory(null)}
                  >
                    Отмена
                  </Button>
                  <Button type="submit" size="sm">
                    Сохранить
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    
      {/* Модальное окно быстрого управления всеми категориями */}
      {isCategoryManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-brand-surface border border-brand-border p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div>
                <h3 className="text-base font-bold text-theme-title">
                  Список категорий ({categories.length})
                </h3>
                <p className="text-xs text-theme-muted">
                  Здесь можно быстро отредактировать или удалить любую категорию
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsCategoryManagerOpen(false)}
                className="text-xs"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {categories.length === 0 ? (
                <div className="text-center py-6 text-xs text-theme-muted">
                  Категорий пока нет. Нажмите «Добавить новую категорию» ниже.
                </div>
              ) : (
                categories.map((c) => {
                  const count = services.filter((s) => s.categoryId === c.id).length;
                  return (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-2xl bg-black/30 border border-brand-border flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-theme-title text-sm">{c.title}</div>
                        <div className="text-[11px] text-theme-muted">
                          Услуг в категории: {count}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditingCategory(c);
                            setIsCategoryManagerOpen(false);
                          }}
                          className="h-8 px-3 text-xs rounded-xl"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1 text-brand-accent" />
                          Изменить
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            if (
                              confirm(
                                'Точно удалить категорию «' + c.title + '»? Все связанные услуги (' + count + ' шт.) также будут удалены.'
                              )
                            ) {
                              await onDeleteCategory(c.id);
                              if (selectedCategoryTab === c.id) {
                                setSelectedCategoryTab('all');
                              }
                            }
                          }}
                          className="h-8 px-3 text-xs rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-brand-border flex justify-between items-center">
              <Button
                size="sm"
                onClick={() => {
                  setEditingCategory({
                    id: '',
                    title: '',
                    description: '',
                    icon: 'Wrench',
                    imageUrl: '',
                    isActive: true,
                  });
                  setIsCategoryManagerOpen(false);
                }}
                className="text-xs rounded-xl font-bold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Новая категория
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsCategoryManagerOpen(false)}
                className="text-xs"
              >
                Готово
              </Button>
            </div>
          </div>
        </div>
      )}
</div>
  );
}
