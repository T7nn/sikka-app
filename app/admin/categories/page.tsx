"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SafeDeleteModal } from "@/components/account/SafeDeleteModal";
import {
  deleteCategorySafely,
  fetchAffectedCategoryItems,
  fetchAllCategories,
} from "@/utils/categoryRepository";
import type { CategoryRecord, TaxonomySector } from "@/types/taxonomy";
import {
  getActivityLabel,
  getEventSubTypeLabel,
  translations,
  type Language,
  type Translations,
} from "@/types/i18n";
import { ui } from "@/utils/ui";

const SECTORS: TaxonomySector[] = ["Food", "Services", "Events"];

function getSectorLabel(sector: TaxonomySector, labels: Translations): string {
  if (sector === "Food") return labels.food;
  if (sector === "Services") return labels.catalogServices;
  return labels.events;
}

function getCategoryDisplayName(
  sector: TaxonomySector,
  name: string,
  labels: Translations,
): string {
  if (sector === "Events") return getEventSubTypeLabel(name, labels);
  return getActivityLabel(name, labels);
}

export default function AdminCategoriesPage() {
  const [language] = useState<Language>("en");
  const labels = translations[language];

  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryRecord | null>(null);
  const [affectedItemsList, setAffectedItemsList] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const rows = await fetchAllCategories();
      setCategories(rows);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const groupedCategories = useMemo(() => {
    const groups: Record<TaxonomySector, CategoryRecord[]> = {
      Food: [],
      Services: [],
      Events: [],
    };

    for (const category of categories) {
      groups[category.sector].push(category);
    }

    for (const sector of SECTORS) {
      groups[sector].sort((a, b) => a.name.localeCompare(b.name));
    }

    return groups;
  }, [categories]);

  const openDeleteModal = async (category: CategoryRecord) => {
    const affected = await fetchAffectedCategoryItems(category);
    setCategoryToDelete(category);
    setAffectedItemsList(affected);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
    setAffectedItemsList([]);
  };

  const executeDelete = async () => {
    if (!categoryToDelete) return;

    const { success, error } = await deleteCategorySafely(categoryToDelete);
    if (!success) {
      alert(error ?? labels.deleteErrorAlert);
      return;
    }

    closeDeleteModal();
    await loadCategories();
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col overflow-x-hidden bg-white px-6 py-8 dark:bg-black">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/admin/directory"
          className="font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/55 transition-colors hover:text-[#222222] dark:text-white/55 dark:hover:text-white"
        >
          ← {labels.directoryManagement}
        </Link>
      </div>

      <section className={`relative p-6 ${ui.card}`}>
        <div className="flex items-start gap-4 px-2">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F9F9F9] dark:bg-white/10">
            <ShieldCheck size={20} strokeWidth={1.75} className="text-[#222222]/70 dark:text-white/70" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-sans text-base font-semibold text-[#222222] dark:text-white">
              {labels.categoryManagement}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#222222]/55 dark:text-white/55">
              {labels.categoryManagementSubtitle}
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-5 space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2
                size={28}
                strokeWidth={1.75}
                className="animate-spin text-[#222222]/40 dark:text-white/40"
                aria-hidden
              />
              <p className="font-sans text-sm text-[#222222]/45 dark:text-white/45">
                {labels.directoryLoading}
              </p>
            </div>
          ) : (
            SECTORS.map((sector) => (
              <div
                key={sector}
                className="rounded-[32px] border border-[#222222]/10 bg-white/90 p-4 shadow-soft-airy backdrop-blur-md dark:border-white/10 dark:bg-black/90"
              >
                <h2 className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-[#222222]/55 dark:text-white/55">
                  {getSectorLabel(sector, labels)}
                </h2>

                {groupedCategories[sector].length === 0 ? (
                  <p className="mt-3 font-sans text-sm text-[#222222]/45 dark:text-white/45">
                    {labels.categoriesEmpty}
                  </p>
                ) : (
                  <ul className="mt-3 divide-y divide-[#222222]/10 dark:divide-white/10">
                    {groupedCategories[sector].map((category) => (
                      <li
                        key={category.id}
                        className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <span className="truncate font-sans text-sm font-medium text-[#222222] dark:text-white">
                          {getCategoryDisplayName(sector, category.name, labels)}
                        </span>
                        <button
                          type="button"
                          onClick={() => void openDeleteModal(category)}
                          className="shrink-0 font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/40 transition-colors hover:text-red-500 dark:text-white/40 dark:hover:text-red-400"
                        >
                          {labels.remove}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <SafeDeleteModal
        isOpen={isDeleteModalOpen}
        itemName={categoryToDelete?.name ?? ""}
        affectedItems={affectedItemsList}
        onClose={closeDeleteModal}
        onConfirm={executeDelete}
        labels={{
          cancel: labels.cancel,
          deleteWarningPrefix: labels.deleteWarningAffected,
          confirmDeletionCountdown: (seconds) =>
            labels.confirmDeletionCountdown.replace("{seconds}", String(seconds)),
          permanentlyDeleteItem: labels.permanentlyDeleteItem,
        }}
      />
    </div>
  );
}
