"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
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
  onOpenBusinessDetails: (business: BusinessRecord) => void;
  labels: Translations;
}

export function HomeView({
  businesses,
  activeCategory,
  onCategoryChange,
  mapPreviewBusiness,
  onMapPinSelect,
  onOpenBusinessDetails,
  labels,
}: HomeViewProps) {
  const [mapExpanded, setMapExpanded] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <ExpandableMapWidget
        businesses={businesses}
        mapPreviewBusiness={mapPreviewBusiness}
        onMapPinSelect={onMapPinSelect}
        onViewDetails={onOpenBusinessDetails}
        onExpandedChange={setMapExpanded}
      />

      <AnimatePresence>
        {!mapExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
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
      </AnimatePresence>
    </div>
  );
}
