"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  MAP_VIEW_DROPDOWN_OPTIONS,
  type MapViewDropdownOption,
  type MapViewFilter,
} from "@/types/businessCategories";
import { getMapViewFilterLabel, type Translations } from "@/types/i18n";

const pillShellClassName =
  "rounded-full bg-white p-1.5 shadow-soft-airy backdrop-blur-md dark:border dark:border-white/10 dark:bg-black dark:shadow-none";

const segmentButtonClassName =
  "relative rounded-full px-5 py-2.5 font-sans text-xs font-medium uppercase tracking-wide transition-colors";

const segmentTextActiveClassName = "text-white dark:text-black";
const segmentTextInactiveClassName = "text-[#222222]/45 dark:text-white/45";

const dropdownSelectClassName =
  "w-full min-w-[7.5rem] cursor-pointer appearance-none rounded-full bg-transparent py-2.5 pe-9 ps-5 font-sans text-xs font-medium uppercase tracking-wide text-[#222222] outline-none dark:text-white";

interface CategoryFilterProps {
  activeFilter: MapViewFilter;
  onFilterChange: (filter: MapViewFilter) => void;
  labels: Translations;
}

export function CategoryFilter({
  activeFilter,
  onFilterChange,
  labels,
}: CategoryFilterProps) {
  const isAllActive = activeFilter === "All";
  const dropdownValue: MapViewDropdownOption =
    activeFilter === "All" ? "Events" : (activeFilter as MapViewDropdownOption);
  const isDropdownActive = !isAllActive;

  return (
    <div className="pointer-events-auto absolute top-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
      <div
        role="tablist"
        aria-label={labels.primaryCategoryFilter}
        className={`flex items-center gap-1 ${pillShellClassName}`}
      >
        <button
          type="button"
          role="tab"
          aria-selected={isAllActive}
          onClick={() => onFilterChange("All")}
          className={segmentButtonClassName}
        >
          {isAllActive && (
            <motion.div
              layoutId="activeFilter"
              className="absolute inset-0 z-0 rounded-full bg-[#222222] shadow-soft-airy dark:bg-white dark:shadow-none"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span
            className={`relative z-10 ${
              isAllActive ? segmentTextActiveClassName : segmentTextInactiveClassName
            }`}
          >
            {labels.all}
          </span>
        </button>

        <div className={`relative ${isDropdownActive ? "" : ""}`}>
          {isDropdownActive && (
            <motion.div
              layoutId="activeFilter"
              className="absolute inset-0 z-0 rounded-full bg-[#222222] shadow-soft-airy dark:bg-white dark:shadow-none"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <label className="sr-only" htmlFor="map-category-filter">
            {labels.mapCategoryDropdown}
          </label>
          <select
            id="map-category-filter"
            value={dropdownValue}
            onChange={(event) => onFilterChange(event.target.value as MapViewFilter)}
            onClick={() => {
              if (isAllActive) {
                onFilterChange("Events");
              }
            }}
            className={`${dropdownSelectClassName} relative z-10 ${
              isDropdownActive ? segmentTextActiveClassName : segmentTextInactiveClassName
            }`}
            aria-label={labels.mapCategoryDropdown}
          >
            {MAP_VIEW_DROPDOWN_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {getMapViewFilterLabel(option, labels)}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            strokeWidth={1.75}
            aria-hidden
            className={`pointer-events-none absolute inset-e-3 top-1/2 z-10 -translate-y-1/2 ${
              isDropdownActive ? "text-white/70 dark:text-black/70" : "text-[#222222]/40 dark:text-white/40"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
