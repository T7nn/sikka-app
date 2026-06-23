"use client";

import { CategoryFilter } from "@/components/home/CategoryFilter";
import { ExpandableMapWidget } from "@/components/home/ExpandableMapWidget";
import type { BusinessRecord } from "@/types/business";
import type { MapViewFilter } from "@/types/businessCategories";
import type { EventRecord } from "@/types/event";
import type { Translations } from "@/types/i18n";

interface HomeViewProps {
  businesses: BusinessRecord[];
  events: EventRecord[];
  activeMapFilter: MapViewFilter;
  activeSubTypeFilter: string;
  onMapFilterChange: (filter: MapViewFilter) => void;
  onSubTypeFilterChange: (subType: string) => void;
  allBusinesses: BusinessRecord[];
  mapPreviewBusiness: BusinessRecord | null;
  onMapPinSelect: (business: BusinessRecord) => void;
  labels: Translations;
}

export function HomeView({
  businesses,
  events,
  activeMapFilter,
  activeSubTypeFilter,
  onMapFilterChange,
  onSubTypeFilterChange,
  allBusinesses,
  mapPreviewBusiness,
  onMapPinSelect,
  labels,
}: HomeViewProps) {
  return (
    <div className="fixed inset-x-0 top-16 bottom-20 z-0">
      <ExpandableMapWidget
        businesses={businesses}
        events={events}
        mapPreviewBusiness={mapPreviewBusiness}
        onMapPinSelect={onMapPinSelect}
      />

      <CategoryFilter
        activeFilter={activeMapFilter}
        activeSubType={activeSubTypeFilter}
        onFilterChange={onMapFilterChange}
        onSubTypeChange={onSubTypeFilterChange}
        businesses={allBusinesses}
        labels={labels}
        layout="overlay"
      />
    </div>
  );
}
