"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { GlobalFilter } from "@/components/shared/GlobalFilter";
import { BusinessCard } from "@/components/search/BusinessCard";
import type { BusinessRecord } from "@/types/business";
import { buildGlobalSearchResults } from "@/types/taxonomy";
import type { CategoryRecord, GlobalFilterState } from "@/types/taxonomy";
import type { EventRecord } from "@/types/event";
import { getEventSubTypeLabel, type Translations } from "@/types/i18n";
import { ui } from "@/utils/ui";

interface SearchViewProps {
  businesses: BusinessRecord[];
  events: EventRecord[];
  categories: CategoryRecord[];
  globalFilter: GlobalFilterState;
  onGlobalFilterChange: (sector: GlobalFilterState["sector"], contextTab: string, category: string) => void;
  onBusinessSelect: (business: BusinessRecord) => void;
  labels: Translations;
}

export function SearchView({
  businesses,
  events,
  categories,
  globalFilter,
  onGlobalFilterChange,
  onBusinessSelect,
  labels,
}: SearchViewProps) {
  const [query, setQuery] = useState("");

  const searchResults = useMemo(
    () => buildGlobalSearchResults(businesses, events, globalFilter, query),
    [businesses, events, globalFilter, query],
  );

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

      <GlobalFilter
        labels={labels}
        categories={categories}
        activeSector={globalFilter.sector}
        activeContextTab={globalFilter.contextTab}
        activeCategory={globalFilter.category}
        onFilterChange={onGlobalFilterChange}
        layout="inline"
        layoutIdPrefix="search"
      />

      <ul className="flex flex-col gap-5 pb-4">
        {searchResults.length === 0 ? (
          <li className={`p-8 text-center ${ui.card}`}>
            <p className="font-sans text-sm text-[#222222]/45 dark:text-white/45">
              {labels.searchNoResults}
            </p>
          </li>
        ) : (
          searchResults.map((item) => {
            if (item.kind === "business") {
              return (
                <li key={`business-${item.data.id}`}>
                  <BusinessCard
                    business={item.data}
                    labels={labels}
                    onSelect={onBusinessSelect}
                  />
                </li>
              );
            }

            const event = item.data;
            return (
              <li key={`event-${event.id}`}>
                <article
                  className={`cursor-default p-5 ${ui.card}`}
                  aria-label={event.name}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-sans text-base font-semibold text-[#222222] dark:text-white">
                        {event.name}
                      </p>
                      <p className="mt-2 line-clamp-2 font-sans text-sm leading-relaxed text-[#222222]/55 dark:text-white/55">
                        {event.description}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#F9F9F9] px-3 py-1 font-sans text-[10px] font-medium uppercase tracking-wide text-[#222222]/60 dark:bg-white/10 dark:text-white/60">
                      {labels.events}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {event.event_type && (
                      <span className="rounded-full bg-[#222222]/5 px-3 py-1 font-sans text-[10px] font-medium uppercase tracking-wide text-[#222222]/70 dark:bg-white/10 dark:text-white/70">
                        {getEventSubTypeLabel(event.event_type, labels)}
                      </span>
                    )}
                    <span className="font-sans text-xs text-[#222222]/45 dark:text-white/45">
                      {labels.eventDates}: {event.start_date} – {event.end_date}
                    </span>
                  </div>
                </article>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
