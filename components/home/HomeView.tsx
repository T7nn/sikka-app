"use client";

import { BusinessCategories } from "@/components/home/BusinessCategories";
import { ExpandableMapWidget } from "@/components/home/ExpandableMapWidget";
import type { BusinessRecord } from "@/types/business";
import type { ActiveCategory, BusinessType } from "@/types/category";
import type { Translations } from "@/types/i18n";

interface HomeViewProps {
  businesses: BusinessRecord[];
  activeCategory: ActiveCategory;
  onCategoryChange: (category: BusinessType) => void;
  mapPreviewBusiness: BusinessRecord | null;
  onMapPinSelect: (business: BusinessRecord) => void;
  labels: Translations;
}

export function HomeView({
  businesses,
  activeCategory,
  onCategoryChange,
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
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
        labels={labels}
      />
    </div>
  );
}
