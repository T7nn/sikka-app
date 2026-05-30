"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { BusinessCategories } from "@/components/home/BusinessCategories";
import { ExpandableMapWidget } from "@/components/home/ExpandableMapWidget";
import type { BusinessRecord } from "@/types/business";
import type { ActiveCategory, BusinessType } from "@/types/category";
import type { Translations } from "@/types/i18n";

const mapHeightTransition = {
  type: "spring" as const,
  bounce: 0,
  duration: 0.4,
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
  const safeZoneRef = useRef<HTMLDivElement>(null);
  const mapShellRef = useRef<HTMLDivElement>(null);
  const [mapPixelHeight, setMapPixelHeight] = useState(0);
  const lastMeasuredHeight = useRef(0);

  const measureMapHeight = useCallback(() => {
    const node = mapShellRef.current;
    if (!node) return;

    const nextHeight = Math.floor(node.getBoundingClientRect().height);
    if (nextHeight <= 0 || nextHeight === lastMeasuredHeight.current) return;

    lastMeasuredHeight.current = nextHeight;
    setMapPixelHeight(nextHeight);
  }, []);

  useEffect(() => {
    const zone = safeZoneRef.current;
    if (!zone) return;

    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measureMapHeight);
    });

    observer.observe(zone);
    measureMapHeight();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [measureMapHeight, isMapExpanded]);

  return (
    <div
      ref={safeZoneRef}
      className="fixed inset-x-4 top-16 bottom-20 z-0 flex flex-col overflow-hidden"
    >
        <motion.div
          ref={mapShellRef}
          animate={{ height: isMapExpanded ? "100%" : "60%" }}
          transition={mapHeightTransition}
          onAnimationComplete={measureMapHeight}
          className="relative z-10 w-full shrink-0 overflow-hidden rounded-[32px] bg-white shadow-soft-airy dark:border dark:border-white/10 dark:bg-black dark:shadow-none"
        >
          <ExpandableMapWidget
            businesses={businesses}
            mapPreviewBusiness={mapPreviewBusiness}
            mapHeight={mapPixelHeight}
            isMapExpanded={isMapExpanded}
            onMapExpandedChange={setIsMapExpanded}
            onMapPinSelect={onMapPinSelect}
          />
        </motion.div>

        <AnimatePresence initial={false}>
          {!isMapExpanded && (
            <motion.div
              key="home-categories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-1 flex-col items-center justify-center overflow-hidden pb-4"
            >
              <BusinessCategories
                activeCategory={activeCategory}
                onCategoryChange={onCategoryChange}
                labels={labels}
              />

              {businesses.length === 0 && activeCategory !== "all" && (
                <div className="mt-6 w-full rounded-[32px] bg-white p-8 text-center shadow-soft-airy dark:border dark:border-white/10 dark:bg-black dark:text-white dark:shadow-none">
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
