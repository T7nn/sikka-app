"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { BusinessCard } from "@/components/search/BusinessCard";
import type { BusinessRecord } from "@/types/business";
import {
  businessMatchesCatalogCategory,
  CATALOG_CATEGORY_FILTERS,
  resolveBusinessMainCategory,
  type CatalogCategoryFilter,
} from "@/types/businessCategories";
import { getCatalogCategoryLabel, type Translations } from "@/types/i18n";
import { ui } from "@/utils/ui";

interface SearchViewProps {
  businesses: BusinessRecord[];
  activeCatalogCategory: CatalogCategoryFilter;
  onCatalogCategoryChange: (category: CatalogCategoryFilter) => void;
  onBusinessSelect: (business: BusinessRecord) => void;
  labels: Translations;
}

export function SearchView({
  businesses,
  activeCatalogCategory,
  onCatalogCategoryChange,
  onBusinessSelect,
  labels,
}: SearchViewProps) {
  const [query, setQuery] = useState("");

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const categoryFiltered = businesses.filter((business) =>
      businessMatchesCatalogCategory(business, activeCatalogCategory),
    );

    if (normalizedQuery.length === 0) {
      return categoryFiltered;
    }

    return categoryFiltered.filter((business) => {
      const mainCategory =
        business.main_category?.trim() || resolveBusinessMainCategory(business);
      const activities = (business.activities ?? []).join(" ").toLowerCase();

      return (
        business.name.toLowerCase().includes(normalizedQuery) ||
        business.description.toLowerCase().includes(normalizedQuery) ||
        mainCategory.toLowerCase().includes(normalizedQuery) ||
        activities.includes(normalizedQuery)
      );
    });
  }, [businesses, query, activeCatalogCategory]);

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
          placeholder={labels.searchPlaceholder}
          className={`w-full rounded-full py-4 ps-12 pe-6 font-sans text-sm font-medium ${ui.input}`}
          aria-label={labels.searchPlaceholder}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
        {CATALOG_CATEGORY_FILTERS.map((category) => {
          const isActive = activeCatalogCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onCatalogCategoryChange(category)}
              aria-pressed={isActive}
              className={`shrink-0 rounded-full px-5 py-2.5 font-sans text-xs font-medium uppercase tracking-wide transition-colors ${
                isActive ? ui.pillActive : ui.pillInactive
              }`}
            >
              {getCatalogCategoryLabel(category, labels)}
            </button>
          );
        })}
      </div>

      <ul className="flex flex-col gap-5 pb-4">
        {searchResults.length === 0 ? (
          <li className={`p-8 text-center ${ui.card}`}>
            <p className="font-sans text-sm text-[#222222]/45 dark:text-white/45">
              {labels.searchNoResults}
            </p>
          </li>
        ) : (
          searchResults.map((business) => (
            <li key={business.id}>
              <BusinessCard business={business} labels={labels} onSelect={onBusinessSelect} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
