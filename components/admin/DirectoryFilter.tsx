"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import {
  DIRECTORY_ALL_CATEGORY,
  DIRECTORY_ALL_TYPES,
  DIRECTORY_SECTORS,
  getCategoryOptionsForSector,
  getDefaultTypeForSector,
  getTypeOptionsForSector,
  type DirectorySector,
} from "@/types/adminDirectoryQuery";
import {
  getActivityLabel,
  getEventSubTypeLabel,
  type Translations,
} from "@/types/i18n";

export type DirectoryFilterHandler = (
  sector: DirectorySector,
  type: string,
  category: string,
) => void;

export interface DirectoryFilterProps {
  labels: Translations;
  activeSector: DirectorySector;
  activeType: string;
  activeCategory: string;
  onFilterChange: DirectoryFilterHandler;
}

const capsuleShellClassName =
  "rounded-full border border-[#222222]/10 bg-white/90 p-1.5 shadow-soft-airy backdrop-blur-md dark:border-white/10 dark:bg-black/90 dark:shadow-none";

const capsuleSegmentClassName =
  "relative shrink-0 rounded-full px-4 py-2 font-sans text-xs font-medium uppercase tracking-wide transition-colors";

const capsuleTextActiveClassName = "text-white dark:text-black";
const capsuleTextInactiveClassName = "text-[#222222]/45 dark:text-white/45";

const menuButtonClassName =
  "flex w-full items-center justify-between gap-2 rounded-3xl border border-[#222222]/10 bg-white/90 px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-[#222222] shadow-soft-airy backdrop-blur-md transition-colors hover:bg-white dark:border-white/10 dark:bg-black/90 dark:text-white dark:hover:bg-black";

const menuPanelClassName =
  "absolute inset-x-0 top-[calc(100%+0.5rem)] z-40 max-h-56 overflow-y-auto rounded-3xl border border-[#222222]/10 bg-white/95 p-2 shadow-soft-airy backdrop-blur-md hide-scrollbar dark:border-white/10 dark:bg-black/95";

const menuItemClassName =
  "w-full rounded-2xl px-3 py-2.5 text-start font-sans text-xs font-medium uppercase tracking-wide text-[#222222] transition-colors hover:bg-[#F9F9F9] dark:text-white dark:hover:bg-white/10";

const menuItemActiveClassName =
  "bg-[#222222] text-white hover:bg-[#222222] dark:bg-white dark:text-black dark:hover:bg-white";

const springTransition = { type: "spring" as const, bounce: 0.2, duration: 0.6 };

function getSectorLabel(sector: DirectorySector, labels: Translations): string {
  if (sector === "Food") return labels.food;
  if (sector === "Services") return labels.catalogServices;
  return labels.events;
}

function getTypeLabel(
  sector: DirectorySector,
  value: string,
  labels: Translations,
): string {
  if (value === DIRECTORY_ALL_TYPES) return labels.allTypes;
  if (sector === "Events") return getEventSubTypeLabel(value, labels);
  if (value === "Stores") return labels.directoryEntityStores;
  if (value === "Activities") return labels.directoryEntityActivities;
  return value;
}

function getCategoryLabel(
  sector: DirectorySector,
  value: string,
  labels: Translations,
): string {
  if (value === DIRECTORY_ALL_CATEGORY) return labels.filterAll;
  if (sector === "Events") return getEventSubTypeLabel(value, labels);
  return getActivityLabel(value, labels);
}

interface FilterMenuProps {
  id: string;
  label: string;
  value: string;
  options: string[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  getOptionLabel: (value: string) => string;
}

function FilterMenu({
  id,
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
  getOptionLabel,
}: FilterMenuProps) {
  return (
    <div className="relative min-w-0 flex-1">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={onToggle}
        className={menuButtonClassName}
      >
        <span className="truncate">
          <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-[#222222]/45 dark:text-white/45">
            {label}
          </span>
          <span className="mt-0.5 block truncate text-xs">{getOptionLabel(value)}</span>
        </span>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          aria-hidden
          className={`shrink-0 text-[#222222]/50 transition-transform dark:text-white/50 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="listbox"
            aria-labelledby={id}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={menuPanelClassName}
          >
            {options.map((option) => {
              const isActive = option === value;
              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => onSelect(option)}
                  className={`${menuItemClassName} ${isActive ? menuItemActiveClassName : ""}`}
                >
                  {getOptionLabel(option)}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DirectoryFilter({
  labels,
  activeSector,
  activeType,
  activeCategory,
  onFilterChange,
}: DirectoryFilterProps) {
  const typeMenuId = useId();
  const categoryMenuId = useId();
  const [openMenu, setOpenMenu] = useState<"type" | "category" | null>(null);

  const typeOptions = useMemo(
    () => getTypeOptionsForSector(activeSector),
    [activeSector],
  );

  const categoryOptions = useMemo(
    () => getCategoryOptionsForSector(activeSector),
    [activeSector],
  );

  const resolvedType = typeOptions.includes(activeType)
    ? activeType
    : getDefaultTypeForSector(activeSector);

  const resolvedCategory = categoryOptions.includes(activeCategory)
    ? activeCategory
    : DIRECTORY_ALL_CATEGORY;

  useEffect(() => {
    setOpenMenu(null);
  }, [activeSector]);

  const emitChange = (sector: DirectorySector, type: string, category: string) => {
    onFilterChange(sector, type, category);
  };

  const handleSectorChange = (sector: DirectorySector) => {
    emitChange(sector, getDefaultTypeForSector(sector), DIRECTORY_ALL_CATEGORY);
    setOpenMenu(null);
  };

  const handleTypeChange = (type: string) => {
    emitChange(activeSector, type, resolvedCategory);
    setOpenMenu(null);
  };

  const handleCategoryChange = (category: string) => {
    emitChange(activeSector, resolvedType, category);
    setOpenMenu(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        role="tablist"
        aria-label={labels.directorySectorFilter}
        className={`${capsuleShellClassName} hide-scrollbar w-full overflow-x-auto`}
      >
        <div className="flex w-max min-w-full items-center gap-1">
          {DIRECTORY_SECTORS.map((sector) => {
            const isActive = activeSector === sector;
            return (
              <button
                key={sector}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSectorChange(sector)}
                className={capsuleSegmentClassName}
              >
                {isActive && (
                  <motion.div
                    layoutId="directorySectorCapsule"
                    className="absolute inset-0 z-0 rounded-full bg-[#222222] shadow-soft-airy dark:bg-white dark:shadow-none"
                    transition={springTransition}
                  />
                )}
                <span
                  className={`relative z-10 whitespace-nowrap ${
                    isActive ? capsuleTextActiveClassName : capsuleTextInactiveClassName
                  }`}
                >
                  {getSectorLabel(sector, labels)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative flex gap-2">
        <FilterMenu
          id={typeMenuId}
          label={labels.directoryTypeFilter}
          value={resolvedType}
          options={typeOptions}
          isOpen={openMenu === "type"}
          onToggle={() => setOpenMenu((current) => (current === "type" ? null : "type"))}
          onSelect={handleTypeChange}
          getOptionLabel={(option) => getTypeLabel(activeSector, option, labels)}
        />

        <FilterMenu
          id={categoryMenuId}
          label={labels.directoryCategoryFilter}
          value={resolvedCategory}
          options={categoryOptions}
          isOpen={openMenu === "category"}
          onToggle={() =>
            setOpenMenu((current) => (current === "category" ? null : "category"))
          }
          onSelect={handleCategoryChange}
          getOptionLabel={(option) => getCategoryLabel(activeSector, option, labels)}
        />
      </div>
    </div>
  );
}
