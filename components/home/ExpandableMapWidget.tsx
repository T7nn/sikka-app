"use client";

import { motion } from "framer-motion";
import { Maximize2, Minimize2 } from "lucide-react";
import { Map, Marker } from "pigeon-maps";
import { useEffect, useRef, useState } from "react";
import { BusinessMapMiniCard } from "@/components/business/BusinessMapMiniCard";
import type { BusinessRecord } from "@/types/business";

const ABU_DHABI: [number, number] = [24.4539, 54.3773];
const DEFAULT_ZOOM = 11;
const COLLAPSED_HEIGHT = 240;

interface ExpandableMapWidgetProps {
  businesses: BusinessRecord[];
  mapPreviewBusiness: BusinessRecord | null;
  onMapPinSelect?: (business: BusinessRecord) => void;
  onViewDetails?: (business: BusinessRecord) => void;
  onExpandedChange?: (expanded: boolean) => void;
}

export function ExpandableMapWidget({
  businesses,
  mapPreviewBusiness,
  onMapPinSelect,
  onViewDetails,
  onExpandedChange,
}: ExpandableMapWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapHeight, setMapHeight] = useState(COLLAPSED_HEIGHT);

  useEffect(() => {
    onExpandedChange?.(expanded);
  }, [expanded, onExpandedChange]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      setMapHeight(Math.floor(entry.contentRect.height));
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const collapse = () => setExpanded(false);
  const expand = () => setExpanded(true);

  return (
    <motion.div
      ref={containerRef}
      layout
      animate={{
        height: expanded ? "calc(100dvh - 15rem)" : COLLAPSED_HEIGHT,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="relative w-full shrink-0 overflow-hidden rounded-[32px] bg-white shadow-soft-airy dark:border dark:border-white/10 dark:bg-black dark:shadow-none"
    >
      <Map
        center={ABU_DHABI}
        zoom={DEFAULT_ZOOM}
        height={mapHeight}
        mouseEvents={expanded}
        touchEvents={expanded}
        metaWheelZoom={expanded}
      >
        {businesses.map((business) => {
          const isSelected = mapPreviewBusiness?.id === business.id;

          return (
            <Marker
              key={business.id}
              anchor={[business.latitude, business.longitude]}
              width={28}
            >
              <button
                type="button"
                aria-label={`Preview ${business.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onMapPinSelect?.(business);
                }}
                className={`relative z-20 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 shadow-soft-airy transition-transform hover:scale-110 active:scale-95 dark:shadow-none ${
                  isSelected
                    ? "border-[#222222] bg-[#222222] dark:border-white dark:bg-white"
                    : "border-[#222222] bg-white dark:border-white/10 dark:bg-black"
                }`}
                title={business.name}
              />
            </Marker>
          );
        })}
      </Map>

      <BusinessMapMiniCard
        business={mapPreviewBusiness}
        onViewDetails={(business) => onViewDetails?.(business)}
      />

      {!expanded && (
        <button
          type="button"
          aria-label="Expand map"
          onClick={expand}
          className="absolute inset-e-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-soft-airy transition-transform active:scale-95 dark:border dark:border-white/10 dark:bg-black dark:shadow-none"
        >
          <Maximize2 size={16} strokeWidth={1.75} className="text-[#222222]/70 dark:text-white/70" />
        </button>
      )}

      {expanded && (
        <button
          type="button"
          aria-label="Shrink map"
          onClick={collapse}
          className="absolute inset-e-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-soft-airy transition-transform active:scale-95 dark:border dark:border-white/10 dark:bg-black dark:shadow-none"
        >
          <Minimize2 size={16} strokeWidth={1.75} className="text-[#222222]/70 dark:text-white/70" />
        </button>
      )}
    </motion.div>
  );
}
