"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { BusinessCategories } from "@/components/home/BusinessCategories";
import { ExpandableMapWidget } from "@/components/home/ExpandableMapWidget";
import { OrderTrackingCard } from "@/components/home/OrderTrackingCard";
import type { BusinessRecord } from "@/types/business";
import type { ActiveCategory, BusinessType } from "@/types/category";
import type { Translations } from "@/types/i18n";

interface HomeViewProps {
  businesses: BusinessRecord[];
  activeCategory: ActiveCategory;
  onCategoryChange: (category: BusinessType) => void;
  onBusinessSelect: (business: BusinessRecord) => void;
  isOrderActive: boolean;
  orderBusinessName?: string;
  onDismissOrder: () => void;
  labels: Translations;
}

export function HomeView({
  businesses,
  activeCategory,
  onCategoryChange,
  onBusinessSelect,
  isOrderActive,
  orderBusinessName,
  onDismissOrder,
  labels,
}: HomeViewProps) {
  const [mapExpanded, setMapExpanded] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <ExpandableMapWidget
        businesses={businesses}
        onExpandedChange={setMapExpanded}
        onBusinessSelect={onBusinessSelect}
      />

      {!mapExpanded && (
        <OrderTrackingCard
          visible={isOrderActive}
          businessName={orderBusinessName}
          onDismiss={onDismissOrder}
        />
      )}

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
              <div className="mt-6 rounded-[32px] bg-white p-8 text-center shadow-soft-airy">
                <p className="font-sans text-sm text-[#222222]/45">
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
