"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Loader2, Plus } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { createCategory } from "@/utils/categoryRepository";
import type { CategoryRecord, TaxonomySector } from "@/types/taxonomy";
import type { Translations } from "@/types/i18n";

const ADD_NEW_VALUE = "__add_new__";

const triggerClassName =
  "flex w-full items-center justify-between gap-2 rounded-3xl border border-[#222222]/10 bg-white/90 px-4 py-3 font-sans text-xs font-medium uppercase tracking-wide text-[#222222] shadow-soft-airy backdrop-blur-md transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-black/90 dark:text-white dark:hover:bg-black";

const menuPanelClassName =
  "absolute inset-x-0 top-[calc(100%+0.5rem)] z-40 max-h-56 overflow-y-auto rounded-3xl border border-[#222222]/10 bg-white/95 p-2 shadow-soft-airy backdrop-blur-md hide-scrollbar dark:border-white/10 dark:bg-black/95";

const menuItemClassName =
  "w-full rounded-2xl px-3 py-2.5 text-start font-sans text-xs font-medium uppercase tracking-wide text-[#222222] transition-colors hover:bg-[#F9F9F9] dark:text-white dark:hover:bg-white/10";

const menuItemActiveClassName =
  "bg-[#222222] text-white hover:bg-[#222222] dark:bg-white dark:text-black dark:hover:bg-white";

const inputClassName =
  "w-full rounded-3xl border border-[#222222]/10 bg-white px-4 py-3 font-sans text-sm font-medium text-[#222222] outline-none dark:border-white/10 dark:bg-black dark:text-white";

interface CreatableCategorySelectProps {
  sector: TaxonomySector;
  categories: CategoryRecord[];
  value: string;
  onChange: (value: string) => void;
  onCategoryCreated: (category: CategoryRecord) => void;
  labels: Translations;
  disabled?: boolean;
  fieldLabel: string;
  getOptionLabel?: (name: string) => string;
}

export function CreatableCategorySelect({
  sector,
  categories,
  value,
  onChange,
  onCategoryCreated,
  labels,
  disabled = false,
  fieldLabel,
  getOptionLabel = (name) => name,
}: CreatableCategorySelectProps) {
  const triggerId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sectorCategories = useMemo(
    () =>
      categories
        .filter((category) => category.sector === sector)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [categories, sector],
  );

  useEffect(() => {
    setIsOpen(false);
    setIsAdding(false);
    setNewCategoryName("");
    setError(null);
  }, [sector]);

  const handleSelect = (optionValue: string) => {
    if (optionValue === ADD_NEW_VALUE) {
      setIsAdding(true);
      setIsOpen(false);
      return;
    }

    onChange(optionValue);
    setIsOpen(false);
    setIsAdding(false);
    setError(null);
  };

  const handleSaveNewCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setError(labels.newCategoryName);
      return;
    }

    setIsSaving(true);
    setError(null);

    const { category, error: createError } = await createCategory(trimmed, sector);

    setIsSaving(false);

    if (createError || !category) {
      setError(createError ?? labels.keyErrorGenerateFailed);
      return;
    }

    onCategoryCreated(category);
    onChange(category.name);
    setIsAdding(false);
    setNewCategoryName("");
  };

  const displayValue = value.trim() ? getOptionLabel(value) : labels.filterAll;

  return (
    <div className="relative">
      <span className="mb-2 block font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/55 dark:text-white/55">
        {fieldLabel}
      </span>

      {!isAdding ? (
        <>
          <button
            type="button"
            id={triggerId}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
            className={triggerClassName}
          >
            <span className="truncate">{displayValue}</span>
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
                aria-labelledby={triggerId}
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className={menuPanelClassName}
              >
                {sectorCategories.map((category) => {
                  const isActive = category.name === value;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => handleSelect(category.name)}
                      className={`${menuItemClassName} ${isActive ? menuItemActiveClassName : ""}`}
                    >
                      {getOptionLabel(category.name)}
                    </button>
                  );
                })}
                <button
                  type="button"
                  role="option"
                  onClick={() => handleSelect(ADD_NEW_VALUE)}
                  className={`${menuItemClassName} flex items-center gap-2 text-[#222222] dark:text-white`}
                >
                  <Plus size={14} strokeWidth={1.75} aria-hidden />
                  {labels.addNewCategory}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="flex flex-col gap-3 rounded-3xl border border-[#222222]/10 bg-white/90 p-4 shadow-soft-airy backdrop-blur-md dark:border-white/10 dark:bg-black/90">
          <label className="block">
            <span className="sr-only">{labels.newCategoryName}</span>
            <input
              type="text"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder={labels.newCategoryName}
              disabled={isSaving || disabled}
              className={inputClassName}
              autoFocus
            />
          </label>
          {error && (
            <p className="font-sans text-xs text-[#222222] dark:text-white">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isSaving || disabled}
              onClick={() => {
                setIsAdding(false);
                setNewCategoryName("");
                setError(null);
              }}
              className="flex-1 rounded-full border border-[#222222]/15 py-3 font-sans text-xs font-medium uppercase tracking-wide text-[#222222] dark:border-white/10 dark:text-white"
            >
              {labels.cancel}
            </button>
            <button
              type="button"
              disabled={isSaving || disabled}
              onClick={() => void handleSaveNewCategory()}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#222222] py-3 font-sans text-xs font-medium uppercase tracking-wide text-white dark:bg-white dark:text-black"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" aria-hidden />
                  {labels.savingCategory}
                </>
              ) : (
                labels.saveCategory
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface CreatableMultiCategorySelectProps {
  sector: TaxonomySector;
  categories: CategoryRecord[];
  values: string[];
  onChange: (values: string[]) => void;
  onCategoryCreated: (category: CategoryRecord) => void;
  labels: Translations;
  disabled?: boolean;
  fieldLabel: string;
  getOptionLabel?: (name: string) => string;
}

export function CreatableMultiCategorySelect({
  sector,
  categories,
  values,
  onChange,
  onCategoryCreated,
  labels,
  disabled = false,
  fieldLabel,
  getOptionLabel = (name) => name,
}: CreatableMultiCategorySelectProps) {
  const [selectedCategory, setSelectedCategory] = useState("");

  const toggleCategory = (name: string) => {
    const normalized = name.trim();
    if (!normalized) return;

    if (values.some((value) => value.toLowerCase() === normalized.toLowerCase())) {
      onChange(values.filter((value) => value.toLowerCase() !== normalized.toLowerCase()));
      return;
    }

    onChange([...values, normalized]);
  };

  const handleSingleSelect = (name: string) => {
    toggleCategory(name);
    setSelectedCategory("");
  };

  return (
    <div className="rounded-[32px] border border-[#222222]/10 bg-white px-4 py-4 dark:border-white/10 dark:bg-black">
      <CreatableCategorySelect
        sector={sector}
        categories={categories}
        value={selectedCategory}
        onChange={handleSingleSelect}
        onCategoryCreated={(category) => {
          onCategoryCreated(category);
          toggleCategory(category.name);
        }}
        labels={labels}
        disabled={disabled}
        fieldLabel={fieldLabel}
        getOptionLabel={getOptionLabel}
      />

      {values.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {values.map((name) => (
            <li key={name}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => toggleCategory(name)}
                className="rounded-full bg-[#222222] px-3 py-1.5 font-sans text-[10px] font-medium uppercase tracking-wide text-white dark:bg-white dark:text-black"
              >
                {getOptionLabel(name)} ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
