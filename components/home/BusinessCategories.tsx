"use client";

import { ChevronDown } from "lucide-react";
import {
  MAIN_CATEGORIES,
  type ActivityFilterOption,
  type MainCategory,
} from "@/types/businessCategories";

const pillShellClassName =
  "rounded-full bg-white p-1.5 shadow-soft-airy backdrop-blur-md dark:border dark:border-white/10 dark:bg-black dark:shadow-none";

const categoryButtonActiveClassName =
  "bg-[#222222] text-white dark:bg-white dark:text-black";

const categoryButtonInactiveClassName = "text-[#222222] dark:text-white";

const activitySelectClassName =
  "w-full min-w-[9.5rem] cursor-pointer appearance-none rounded-full bg-transparent py-2 pe-9 ps-4 font-sans text-sm font-medium text-[#222222] outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-white";

interface BusinessCategoriesProps {
  activeMainCategory: MainCategory;
  onMainCategoryChange: (category: MainCategory) => void;
  activeActivityFilter: string;
  onActivityFilterChange: (value: string) => void;
  activityOptions: ActivityFilterOption[];
}

export function BusinessCategories({
  activeMainCategory,
  onMainCategoryChange,
  activeActivityFilter,
  onActivityFilterChange,
  activityOptions,
}: BusinessCategoriesProps) {
  return (
    <div className="pointer-events-auto absolute top-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
      <div
        role="tablist"
        aria-label="Primary category"
        className={`flex items-center gap-1 ${pillShellClassName}`}
      >
        {MAIN_CATEGORIES.map((category) => {
          const isActive = activeMainCategory === category;

          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onMainCategoryChange(category)}
              className={`rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors ${
                isActive ? categoryButtonActiveClassName : categoryButtonInactiveClassName
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className={`relative ${pillShellClassName}`}>
        <label className="sr-only" htmlFor="map-activity-filter">
          Activity filter
        </label>
        <select
          id="map-activity-filter"
          value={activeActivityFilter}
          onChange={(event) => onActivityFilterChange(event.target.value)}
          className={activitySelectClassName}
          aria-label="Filter by activity"
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
