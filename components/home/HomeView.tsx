"use client";

import { ExpandableMapWidget } from "@/components/home/ExpandableMapWidget";
import { GlobalFilter } from "@/components/shared/GlobalFilter";
import type { BusinessRecord } from "@/types/business";
import type { EventRecord } from "@/types/event";
import type { CategoryRecord, GlobalFilterState } from "@/types/taxonomy";
import type { Translations } from "@/types/i18n";

interface HomeViewProps {
  businesses: BusinessRecord[];
  events: EventRecord[];
  categories: CategoryRecord[];
  globalFilter: GlobalFilterState;
  onGlobalFilterChange: (sector: GlobalFilterState["sector"], contextTab: string, category: string) => void;
  mapPreviewBusiness: BusinessRecord | null;
  onMapPinSelect: (business: BusinessRecord) => void;
  labels: Translations;
}

export function HomeView({
  businesses,
  events,
  categories,
  globalFilter,
  onGlobalFilterChange,
  mapPreviewBusiness,
  onMapPinSelect,
  labels,
}: HomeViewProps) {
  return (
    <div className="fixed inset-x-0 top-16 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-0">
      <ExpandableMapWidget
        businesses={businesses}
        events={events}
        mapPreviewBusiness={mapPreviewBusiness}
        onMapPinSelect={onMapPinSelect}
      />

      <GlobalFilter
        labels={labels}
        categories={categories}
        activeSector={globalFilter.sector}
        activeContextTab={globalFilter.contextTab}
        activeCategory={globalFilter.category}
        onFilterChange={onGlobalFilterChange}
        layout="overlay"
        layoutIdPrefix="home"
      />
    </div>
  );
}
