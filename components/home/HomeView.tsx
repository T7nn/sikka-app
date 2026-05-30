"use client";

import { BusinessCategories } from "@/components/home/BusinessCategories";
import { ExpandableMapWidget } from "@/components/home/ExpandableMapWidget";
import type { BusinessRecord } from "@/types/business";
import type {
  ActivityFilterOption,
  CatalogCategoryFilter,
} from "@/types/businessCategories";
import type { Translations } from "@/types/i18n";

interface HomeViewProps {
  businesses: BusinessRecord[];
  activeCatalogCategory: CatalogCategoryFilter;
  onCatalogCategoryChange: (category: CatalogCategoryFilter) => void;
  activeActivityFilter: string;
  onActivityFilterChange: (value: string) => void;
  activityFilterOptions: ActivityFilterOption[];
  mapPreviewBusiness: BusinessRecord | null;
  onMapPinSelect: (business: BusinessRecord) => void;
  labels: Translations;
}

export function HomeView({
  businesses,
  activeCatalogCategory,
  onCatalogCategoryChange,
  activeActivityFilter,
  onActivityFilterChange,
  activityFilterOptions,
  mapPreviewBusiness,
  onMapPinSelect,
  labels,
}: HomeViewProps) {
  return (
    <div className="fixed inset-x-0 top-16 bottom-20 z-0">
      <ExpandableMapWidget
        businesses={businesses}
        mapPreviewBusiness={mapPreviewBusiness}
        onMapPinSelect={onMapPinSelect}
      />

      <BusinessCategories
        activeCatalogCategory={activeCatalogCategory}
        onCatalogCategoryChange={onCatalogCategoryChange}
        activeActivityFilter={activeActivityFilter}
        onActivityFilterChange={onActivityFilterChange}
        activityOptions={activityFilterOptions}
        labels={labels}
      />
    </div>
  );
}
