"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { BusinessCard } from "@/components/search/BusinessCard";
import type { BusinessRecord } from "@/types/business";
import { CATEGORY_FILTERS, type ActiveCategory } from "@/types/category";

interface SearchViewProps {
  businesses: BusinessRecord[];
  activeCategory: ActiveCategory;
  onCategoryChange: (category: ActiveCategory) => void;
  onBusinessSelect: (business: BusinessRecord) => void;
}

export function SearchView({
  businesses,
  activeCategory,
  onCategoryChange,
  onBusinessSelect,
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
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#222222]/40"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search local businesses…"
          className="w-full rounded-full bg-white py-4 pl-12 pr-6 font-sans text-sm font-medium text-[#222222] shadow-soft-airy placeholder:text-[#222222]/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#222222]/15"
          aria-label="Search local businesses"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
        {CATEGORY_FILTERS.map(({ id, label }) => {
          const isActive = activeCategory === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onCategoryChange(id)}
              aria-pressed={isActive}
              className={`shrink-0 rounded-full px-5 py-2.5 font-sans text-xs font-medium uppercase tracking-wide transition-colors ${
                isActive
                  ? "bg-[#222222] text-white shadow-soft-airy"
                  : "bg-white text-[#222222]/60 shadow-soft-airy"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <ul className="flex flex-col gap-5 pb-4">
        {searchResults.length === 0 ? (
          <li className="rounded-[32px] bg-white p-8 text-center shadow-soft-airy">
            <p className="font-sans text-sm text-[#222222]/45">
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
