"use client";

import type { ActiveCategory, BusinessType } from "@/types/category";
import type { Translations } from "@/types/i18n";

const CATEGORY_IDS: BusinessType[] = ["digital", "physical", "services"];

interface BusinessCategoriesProps {
  activeCategory: ActiveCategory;
  onCategoryChange: (category: BusinessType) => void;
  labels: Pick<Translations, "digital" | "physical" | "services">;
}

export function BusinessCategories({
  activeCategory,
  onCategoryChange,
  labels,
}: BusinessCategoriesProps) {
  return (
    <div
      role="tablist"
      aria-label="Business categories"
      className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white p-1.5 shadow-soft-airy backdrop-blur-md dark:border dark:border-white/10 dark:bg-black dark:shadow-none"
    >
      {CATEGORY_IDS.map((id) => {
        const isActive = activeCategory === id;
        const label = labels[id];

        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onCategoryChange(id)}
            className={`rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors ${
              isActive
                ? "bg-[#222222] text-white dark:bg-white dark:text-black"
                : "text-[#222222] dark:text-white"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
