"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { BusinessCard } from "@/components/search/BusinessCard";
import type { BusinessRecord } from "@/types/business";
import type { ActiveCategory } from "@/types/category";
import { getCategoryLabel, type Translations } from "@/types/i18n";
import { ui } from "@/utils/ui";

const FILTER_IDS: ActiveCategory[] = ["all", "digital", "physical", "services"];

interface SearchViewProps {
  businesses: BusinessRecord[];
  activeCategory: ActiveCategory;
  onCategoryChange: (category: ActiveCategory) => void;
  onBusinessSelect: (business: BusinessRecord) => void;
  labels: Translations;
}

export function SearchView({
  businesses,
  activeCategory,
  onCategoryChange,
  onBusinessSelect,
  labels,
}: SearchViewProps) {
  const [query, setQuery] = useState("");

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length === 0) return businesses;

    return businesses.filter(
      (business) =>
        business.name.toLowerCase().includes(normalizedQuery) ||
        business.description.toLowerCase().includes(normalizedQuery) ||
        business.type.toLowerCase().includes(normalizedQuery),
    );
  }, [businesses, query]);

  return (
    <div className="flex h-full flex-col gap-8">
      <div className="relative">
        <Search
          size={18}
          strokeWidth={1.75}
          className="pointer-events-none absolute inset-s-5 top-1/2 -translate-y-1/2 text-[#222222]/40 dark:text-white/40"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search local businesses…"
          className={`w-full rounded-full py-4 ps-12 pe-6 font-sans text-sm font-medium ${ui.input}`}
          aria-label="Search local businesses"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
        {FILTER_IDS.map((id) => {
          const isActive = activeCategory === id;
          

          return (
            <button
              key={id}
              type="button"
              onClick={() => onCategoryChange(id)}
              aria-pressed={isActive}
              className={`shrink-0 rounded-full px-5 py-2.5 font-sans text-xs font-medium uppercase tracking-wide transition-colors ${
                isActive ? ui.pillActive : ui.pillInactive
              }`}
            >
              {getCategoryLabel(id, labels)}
            </button>
          );
        })}
      </div>

      <ul className="flex flex-col gap-5 pb-4">
        {searchResults.length === 0 ? (
          <li className={`p-8 text-center ${ui.card}`}>
            <p className="font-sans text-sm text-[#222222]/45 dark:text-white/45">
              No businesses found in this category yet.
            </p>
          </li>
        ) : (
          searchResults.map((business) => (
            <li key={business.id}>
              <BusinessCard business={business} onSelect={onBusinessSelect} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
