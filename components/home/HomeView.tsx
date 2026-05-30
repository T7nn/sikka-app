"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { BusinessCategories } from "@/components/home/BusinessCategories";
import { ExpandableMapWidget } from "@/components/home/ExpandableMapWidget";
import type { BusinessRecord } from "@/types/business";
import type { ActiveCategory, BusinessType } from "@/types/category";
import type { Translations } from "@/types/i18n";

const layoutTransition = {
  layout: { type: "spring" as const, stiffness: 320, damping: 32 },
};

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
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <motion.div
        layout
        transition={layoutTransition}
        className={`relative min-h-0 w-full overflow-hidden rounded-[32px] bg-white shadow-soft-airy dark:border dark:border-white/10 dark:bg-black dark:shadow-none ${
          isMapExpanded ? "flex-1" : "flex-[6.5]"
        }`}
      >
        <ExpandableMapWidget
          businesses={businesses}
          mapPreviewBusiness={mapPreviewBusiness}
          isMapExpanded={isMapExpanded}
          onMapExpandedChange={setIsMapExpanded}
          onMapPinSelect={onMapPinSelect}
        />
      </motion.div>

      {!isMapExpanded && (
        <motion.div
          layout
          transition={layoutTransition}
          className="flex min-h-0 flex-[3.5] flex-col justify-center overflow-hidden pb-4"
        >
          <BusinessCategories
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
            labels={labels}
          />

          {businesses.length === 0 && activeCategory !== "all" && (
            <div className="mt-6 rounded-[32px] bg-white p-8 text-center shadow-soft-airy dark:border dark:border-white/10 dark:bg-black dark:text-white dark:shadow-none">
              <p className="font-sans text-sm text-[#222222]/45 dark:text-white/45">
                No businesses found in this category yet.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
