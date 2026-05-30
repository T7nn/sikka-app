"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { BusinessCategories } from "@/components/home/BusinessCategories";
import { ExpandableMapWidget } from "@/components/home/ExpandableMapWidget";
import type { BusinessRecord } from "@/types/business";
import type { ActiveCategory, BusinessType } from "@/types/category";
import type { Translations } from "@/types/i18n";

const MAP_HEIGHT_COLLAPSED = "50vh";
const MAP_HEIGHT_EXPANDED = "calc(100vh - 160px)";

const mapHeightTransition = {
  type: "tween" as const,
  ease: "easeInOut" as const,
  duration: 0.35,
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
    const node = mapShellRef.current;
    if (!node) return;

    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measureMapHeight);
    });

    observer.observe(node);
    measureMapHeight();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [measureMapHeight, isMapExpanded]);

  return (
    <div className="pointer-events-none fixed inset-x-4 top-16 bottom-20 z-0">
      <motion.div
        ref={mapShellRef}
        animate={{
          height: isMapExpanded ? MAP_HEIGHT_EXPANDED : MAP_HEIGHT_COLLAPSED,
        }}
        transition={mapHeightTransition}
        onAnimationComplete={measureMapHeight}
        className="pointer-events-auto relative left-0 right-0 top-0 z-10 w-full shrink-0 overflow-hidden rounded-[32px] bg-white shadow-soft-airy dark:border dark:border-white/10 dark:bg-black dark:shadow-none"
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
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="pointer-events-auto absolute bottom-4 left-0 right-0 flex items-center justify-center"
          >
            <div className="w-full max-w-md px-1">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
