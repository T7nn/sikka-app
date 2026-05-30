"use client";

import { ChevronDown } from "lucide-react";
import {
  CATALOG_CATEGORY_FILTERS,
  type ActivityFilterOption,
  type CatalogCategoryFilter,
} from "@/types/businessCategories";
import { getCatalogCategoryLabel, type Translations } from "@/types/i18n";

const pillShellClassName =
  "rounded-full bg-white p-1.5 shadow-soft-airy backdrop-blur-md dark:border dark:border-white/10 dark:bg-black dark:shadow-none";

const categoryButtonActiveClassName =
  "bg-[#222222] text-white dark:bg-white dark:text-black";

const categoryButtonInactiveClassName = "text-[#222222] dark:text-white";

const activitySelectClassName =
  "w-full min-w-[9.5rem] cursor-pointer appearance-none rounded-full bg-transparent py-2 pe-9 ps-4 font-sans text-sm font-medium text-[#222222] outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-white";

interface BusinessCategoriesProps {
  activeCatalogCategory: CatalogCategoryFilter;
  onCatalogCategoryChange: (category: CatalogCategoryFilter) => void;
  activeActivityFilter: string;
  onActivityFilterChange: (value: string) => void;
  activityOptions: ActivityFilterOption[];
  labels: Translations;
}

export function BusinessCategories({
  activeCatalogCategory,
  onCatalogCategoryChange,
  activeActivityFilter,
  onActivityFilterChange,
  activityOptions,
  labels,
}: BusinessCategoriesProps) {
  return (
    <div className="pointer-events-auto absolute top-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
      <div
        role="tablist"
        aria-label={labels.primaryCategoryFilter}
        className={`flex items-center gap-1 ${pillShellClassName}`}
      >
        {CATALOG_CATEGORY_FILTERS.map((category) => {
          const isActive = activeCatalogCategory === category;

          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onCatalogCategoryChange(category)}
              className={`rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors ${
                isActive ? categoryButtonActiveClassName : categoryButtonInactiveClassName
              }`}
            >
              {getCatalogCategoryLabel(category, labels)}
            </button>
          );
        })}
      </div>

      <div className={`relative ${pillShellClassName}`}>
        <label className="sr-only" htmlFor="map-activity-filter">
          {labels.activityFilter}
        </label>
        <select
          id="map-activity-filter"
          value={activeActivityFilter}
          onChange={(event) => onActivityFilterChange(event.target.value)}
          className={activitySelectClassName}
          aria-label={labels.filterByActivity}
        >
          {activityOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          aria-hidden
          className="pointer-events-none absolute inset-e-3 top-1/2 -translate-y-1/2 text-[#222222]/50 dark:text-white/50"
        />
      </div>
    </div>
  );
}
