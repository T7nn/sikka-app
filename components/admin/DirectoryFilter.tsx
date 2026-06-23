"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import type { BusinessRecord } from "@/types/business";
import {
  buildDirectorySubTypeOptions,
  DIRECTORY_ENTITY_TYPES,
  DIRECTORY_PRIMARY_FILTERS,
  DIRECTORY_SUBTYPE_ALL,
  getDefaultEntityForPrimary,
  type DirectoryEntityType,
  type DirectoryPrimaryFilter,
} from "@/types/adminDirectoryFilters";
import {
  getActivityLabel,
  getEventSubTypeLabel,
  type Translations,
} from "@/types/i18n";

export type DirectoryMainCategory = DirectoryPrimaryFilter;
export type DirectorySubCategory = string;

export interface DirectoryFilterChange {
  mainCategory: DirectoryMainCategory;
  subCategory: DirectorySubCategory;
  entityType: DirectoryEntityType;
}

export interface DirectoryFilterProps {
  businesses: BusinessRecord[];
  labels: Translations;
  mainCategory: DirectoryMainCategory;
  entityType: DirectoryEntityType;
  subCategory: DirectorySubCategory;
  onFilterChange: (change: DirectoryFilterChange) => void;
}

const capsuleShellClassName =
  "rounded-full border border-[#222222]/10 bg-white/90 p-1.5 shadow-soft-airy backdrop-blur-md dark:border-white/10 dark:bg-black/90 dark:shadow-none";

const capsuleSegmentClassName =
  "relative shrink-0 rounded-full px-4 py-2 font-sans text-xs font-medium uppercase tracking-wide transition-colors";

const capsuleTextActiveClassName = "text-white dark:text-black";
const capsuleTextInactiveClassName = "text-[#222222]/45 dark:text-white/45";

const springTransition = { type: "spring" as const, bounce: 0.2, duration: 0.6 };

interface SlidingCapsuleRowProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  getLabel: (option: T) => string;
  ariaLabel: string;
  scrollable?: boolean;
}

function SlidingCapsuleRow<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  getLabel,
  ariaLabel,
  scrollable = false,
}: SlidingCapsuleRowProps<T>) {
  const inner = (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex items-center gap-1 ${scrollable ? "w-max min-w-full" : "w-full"}`}
    >
      {options.map((option) => {
        const isActive = value === option;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option)}
            className={capsuleSegmentClassName}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 z-0 rounded-full bg-[#222222] shadow-soft-airy dark:bg-white dark:shadow-none"
                transition={springTransition}
              />
            )}
            <span
              className={`relative z-10 whitespace-nowrap ${
                isActive ? capsuleTextActiveClassName : capsuleTextInactiveClassName
              }`}
            >
              {getLabel(option)}
            </span>
          </button>
        );
      })}
    </div>
  );

  if (scrollable) {
    return (
      <div className={`${capsuleShellClassName} hide-scrollbar w-full overflow-x-auto`}>
        {inner}
      </div>
    );
  }

  return <div className={capsuleShellClassName}>{inner}</div>;
}

function getMainCategoryLabel(
  category: DirectoryMainCategory,
  labels: Translations,
): string {
  if (category === "Food") return labels.food;
  if (category === "Services") return labels.catalogServices;
  return labels.events;
}

function getEntityLabel(entity: DirectoryEntityType, labels: Translations): string {
  if (entity === "Store") return labels.directoryEntityStores;
  if (entity === "Activity") return labels.directoryEntityActivities;
  return labels.directoryEntityEvents;
}

function getSubCategoryLabel(
  value: string,
  mainCategory: DirectoryMainCategory,
  labels: Translations,
): string {
  if (value === DIRECTORY_SUBTYPE_ALL) return labels.filterAll;
  if (mainCategory === "Events") return getEventSubTypeLabel(value, labels);
  return getActivityLabel(value, labels);
}

export function DirectoryFilter({
  businesses,
  labels,
  mainCategory,
  entityType,
  subCategory,
  onFilterChange,
}: DirectoryFilterProps) {
  const subCategoryOptions = useMemo(
    () => buildDirectorySubTypeOptions(mainCategory, businesses),
    [mainCategory, businesses],
  );

  const activeSubCategory = subCategoryOptions.includes(subCategory)
    ? subCategory
    : DIRECTORY_SUBTYPE_ALL;

  const emitChange = (
    nextMain: DirectoryMainCategory,
    nextEntity: DirectoryEntityType,
    nextSub: DirectorySubCategory,
  ) => {
    onFilterChange({
      mainCategory: nextMain,
      entityType: nextEntity,
      subCategory: nextSub,
    });
  };

  const handleMainChange = (nextMain: DirectoryMainCategory) => {
    emitChange(nextMain, getDefaultEntityForPrimary(nextMain), DIRECTORY_SUBTYPE_ALL);
  };

  const handleEntityChange = (nextEntity: DirectoryEntityType) => {
    emitChange(mainCategory, nextEntity, DIRECTORY_SUBTYPE_ALL);
  };

  const handleSubCategoryChange = (nextSub: DirectorySubCategory) => {
    emitChange(mainCategory, entityType, nextSub);
  };

  return (
    <div className="flex flex-col gap-3">
      <SlidingCapsuleRow
        options={DIRECTORY_PRIMARY_FILTERS}
        value={mainCategory}
        onChange={handleMainChange}
        layoutId="directoryMainCapsule"
        getLabel={(option) => getMainCategoryLabel(option, labels)}
        ariaLabel={labels.directoryPrimaryFilter}
      />

      <SlidingCapsuleRow
        options={DIRECTORY_ENTITY_TYPES}
        value={entityType}
        onChange={handleEntityChange}
        layoutId="directoryEntityCapsule"
        getLabel={(option) => getEntityLabel(option, labels)}
        ariaLabel={labels.directoryEntityFilter}
        scrollable
      />

      <SlidingCapsuleRow
        options={subCategoryOptions}
        value={activeSubCategory}
        onChange={handleSubCategoryChange}
        layoutId="directorySubCategoryCapsule"
        getLabel={(option) => getSubCategoryLabel(option, mainCategory, labels)}
        ariaLabel={labels.directoryTypeFilter}
        scrollable
      />
    </div>
  );
}
