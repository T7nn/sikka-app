"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { Map, Marker } from "pigeon-maps";
import { useEffect, useRef, useState } from "react";
import type { BusinessRecord } from "@/types/business";

const ABU_DHABI: [number, number] = [24.4539, 54.3773];
const DEFAULT_ZOOM = 11;

interface ExpandableMapWidgetProps {
  businesses: BusinessRecord[];
  mapPreviewBusiness: BusinessRecord | null;
  isMapExpanded: boolean;
  onMapExpandedChange: (expanded: boolean) => void;
  onMapPinSelect?: (business: BusinessRecord) => void;
}

export function ExpandableMapWidget({
  businesses,
  mapPreviewBusiness,
  isMapExpanded,
  onMapExpandedChange,
  onMapPinSelect,
}: ExpandableMapWidgetProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessRecord | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(ABU_DHABI);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapHeight, setMapHeight] = useState(320);

  useEffect(() => {
    if (mapPreviewBusiness === null) {
      setSelectedBusiness(null);
    }
  }, [mapPreviewBusiness]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setMapCenter(coords);
        setUserLocation(coords);
      },
      () => {
        // Keep default center when permission is denied or unavailable.
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60_000 },
    );
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      const nextHeight = Math.floor(entry.contentRect.height);
      if (nextHeight > 0) {
        setMapHeight(nextHeight);
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [isMapExpanded]);

  const selectBusiness = (business: BusinessRecord) => {
    setSelectedBusiness(business);
    onMapPinSelect?.(business);
  };

  const expandMap = () => onMapExpandedChange(true);
  const collapseMap = () => onMapExpandedChange(false);

  return (
    <div ref={containerRef} className="relative h-full min-h-0 w-full">
      <Map
        center={mapCenter}
        zoom={DEFAULT_ZOOM}
        height={mapHeight}
        mouseEvents={isMapExpanded}
        touchEvents={isMapExpanded}
        metaWheelZoom={isMapExpanded}
      >
        {userLocation && (
          <Marker anchor={userLocation} width={20} style={{ pointerEvents: "none" }}>
            <span
              className="relative z-10 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#2563EB] shadow-soft-airy dark:border-white/20 dark:shadow-none"
              aria-hidden
            />
          </Marker>
        )}

        {businesses.map((business) => {
          const isSelected = selectedBusiness?.id === business.id;

          return (
            <Marker
              key={business.id}
              anchor={[business.latitude, business.longitude]}
              width={28}
              style={{ pointerEvents: "auto" }}
              onClick={({ event }) => {
                event.stopPropagation();
                selectBusiness(business);
              }}
            >
              <button
                type="button"
                aria-label={`Preview ${business.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  selectBusiness(business);
                }}
                className={`pigeon-click-block pointer-events-auto relative z-20 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 shadow-soft-airy transition-transform hover:scale-110 active:scale-95 dark:shadow-none ${
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

      <button
        type="button"
        aria-label={isMapExpanded ? "Collapse map" : "Expand map"}
        onClick={isMapExpanded ? collapseMap : expandMap}
        className="absolute start-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#222222] shadow-soft-airy transition-transform active:scale-95 dark:border dark:border-white/10 dark:bg-black dark:text-white dark:shadow-none"
      >
        {isMapExpanded ? (
          <Minimize2 size={18} strokeWidth={1.75} aria-hidden />
        ) : (
          <Maximize2 size={18} strokeWidth={1.75} aria-hidden />
        )}
      </button>
    </div>
  );
}
