"use client";

import { Briefcase, Monitor, Store, type LucideIcon } from "lucide-react";
import type { ActiveCategory, BusinessType } from "@/types/category";
import type { Translations } from "@/types/i18n";

interface Category {
  id: BusinessType;
  icon: LucideIcon;
}

const CATEGORIES: Category[] = [
  { id: "digital", icon: Monitor },
  { id: "physical", icon: Store },
  { id: "services", icon: Briefcase },
];

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
    <div className="mt-8 flex items-start justify-between gap-4 px-1">
      {CATEGORIES.map(({ id, icon: Icon }) => {
        const isActive = activeCategory === id;
        const label = labels[id];

        return (
          <button
            key={id}
            type="button"
            onClick={() => onCategoryChange(id)}
            className="group flex flex-1 flex-col items-center gap-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#222222]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-white/20 dark:focus-visible:ring-offset-black"
            aria-label={label}
            aria-pressed={isActive}
          >
            <span
              className={`flex h-[72px] w-[72px] items-center justify-center rounded-full transition-all duration-200 group-active:scale-95 ${
                isActive
                  ? "bg-[#222222] shadow-soft-airy dark:bg-white dark:shadow-none"
                  : "bg-white shadow-soft-airy dark:border dark:border-white/10 dark:bg-[#111111] dark:shadow-none"
              }`}
            >
              <Icon
                size={26}
                strokeWidth={1.5}
                className={
                  isActive
                    ? "text-white dark:text-black"
                    : "text-[#222222]/70 dark:text-white/70"
                }
              />
            </span>
            <span
              className={`font-sans text-xs font-medium tracking-wide transition-colors ${
                isActive
                  ? "text-[#222222] dark:text-white"
                  : "text-[#222222]/60 dark:text-white/60"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
