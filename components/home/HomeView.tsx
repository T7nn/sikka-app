"use client";

import { BusinessCategories } from "@/components/home/BusinessCategories";
import { ExpandableMapWidget } from "@/components/home/ExpandableMapWidget";
import type { BusinessRecord } from "@/types/business";
import type { ActivityFilterOption, MainCategory } from "@/types/businessCategories";

interface HomeViewProps {
  businesses: BusinessRecord[];
  activeMainCategory: MainCategory;
  onMainCategoryChange: (category: MainCategory) => void;
  activeActivityFilter: string;
  onActivityFilterChange: (value: string) => void;
  activityFilterOptions: ActivityFilterOption[];
  mapPreviewBusiness: BusinessRecord | null;
  onMapPinSelect: (business: BusinessRecord) => void;
}

export function HomeView({
  businesses,
  activeMainCategory,
  onMainCategoryChange,
  activeActivityFilter,
  onActivityFilterChange,
  activityFilterOptions,
  mapPreviewBusiness,
  onMapPinSelect,
}: HomeViewProps) {
  return (
    <div className="fixed inset-x-0 top-16 bottom-20 z-0">
      <ExpandableMapWidget
        businesses={businesses}
        mapPreviewBusiness={mapPreviewBusiness}
        onMapPinSelect={onMapPinSelect}
      />

      <BusinessCategories
        activeMainCategory={activeMainCategory}
        onMainCategoryChange={onMainCategoryChange}
        activeActivityFilter={activeActivityFilter}
        onActivityFilterChange={onActivityFilterChange}
        activityOptions={activityFilterOptions}
      />
    </div>
  );
}
