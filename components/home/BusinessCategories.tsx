"use client";

import { Briefcase, Monitor, Store, type LucideIcon } from "lucide-react";
import type { ActiveCategory, BusinessType } from "@/types/category";

interface Category {
  id: BusinessType;
  label: string;
  icon: LucideIcon;
}

const CATEGORIES: Category[] = [
  { id: "digital", label: "Digital", icon: Monitor },
  { id: "physical", label: "Physical", icon: Store },
  { id: "services", label: "Services", icon: Briefcase },
];

interface BusinessCategoriesProps {
  activeCategory: ActiveCategory;
  onCategoryChange: (category: BusinessType) => void;
}

export function BusinessCategories({
  activeCategory,
  onCategoryChange,
}: BusinessCategoriesProps) {
  return (
    <div className="mt-8 flex items-start justify-between gap-4 px-1">
      {CATEGORIES.map(({ id, label, icon: Icon }) => {
        const isActive = activeCategory === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onCategoryChange(id)}
            className="group flex flex-1 flex-col items-center gap-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#222222]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F9F9F9]"
            aria-label={`Browse ${label} businesses`}
            aria-pressed={isActive}
          >
            <span
              className={`flex h-[72px] w-[72px] items-center justify-center rounded-full shadow-soft-airy transition-all duration-200 group-active:scale-95 ${
                isActive ? "bg-[#222222]" : "bg-white"
              }`}
            >
              <Icon
                size={26}
                strokeWidth={1.5}
                className={isActive ? "text-white" : "text-[#222222]/70"}
              />
            </span>
            <span
              className={`font-sans text-xs font-medium tracking-wide transition-colors ${
                isActive ? "text-[#222222]" : "text-[#222222]/60"
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
