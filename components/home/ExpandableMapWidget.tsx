"use client";

import { Map, Marker } from "pigeon-maps";
import { Minus, Navigation, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { businessHasMapCoordinates, type BusinessRecord } from "@/types/business";

const ABU_DHABI: [number, number] = [24.4539, 54.3773];
const DEFAULT_ZOOM = 13;
const MIN_ZOOM = 1;
const MAX_ZOOM = 18;
const LOCATE_ZOOM = 15;

const mapControlPillClassName =
  "pointer-events-auto absolute right-4 bottom-24 z-20 flex flex-col items-center gap-2 rounded-full bg-white/90 p-1.5 shadow-soft-airy backdrop-blur-md dark:border dark:border-white/10 dark:bg-black/90 dark:shadow-none";

const mapControlButtonClassName =
  "flex h-10 w-10 items-center justify-center rounded-full text-[#222222] transition-all hover:bg-[#F9F9F9] active:scale-95 dark:text-white dark:hover:bg-white/10";

interface ExpandableMapWidgetProps {
  businesses: BusinessRecord[];
  mapPreviewBusiness: BusinessRecord | null;
  onMapPinSelect?: (business: BusinessRecord) => void;
}

export function ExpandableMapWidget({
  businesses,
  mapPreviewBusiness,
  onMapPinSelect,
}: ExpandableMapWidgetProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessRecord | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(ABU_DHABI);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapHeight, setMapHeight] = useState(0);
  const lastMeasuredHeight = useRef(0);

  const measureMapHeight = useCallback(() => {
    const node = containerRef.current;
    if (!node) return;

    const nextHeight = Math.floor(node.getBoundingClientRect().height);
    if (nextHeight <= 0 || nextHeight === lastMeasuredHeight.current) return;

    lastMeasuredHeight.current = nextHeight;
    setMapHeight(nextHeight);
  }, []);

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
  }, [measureMapHeight]);

  const selectBusiness = (business: BusinessRecord) => {
    setSelectedBusiness(business);
    onMapPinSelect?.(business);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setMapCenter(coords);
        setUserLocation(coords);
        setZoom(LOCATE_ZOOM);
      },
      () => {
        // Fail gracefully when permission is denied or unavailable.
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60_000 },
    );
  };

  const mappableBusinesses = businesses.filter((business) => businessHasMapCoordinates(business));

  return (
    <div ref={containerRef} className="relative z-10 h-full w-full">
      {mapHeight > 0 && (
        <Map
          center={mapCenter}
          zoom={zoom}
          height={mapHeight}
          mouseEvents
          touchEvents
          metaWheelZoom
          onBoundsChanged={({ center, zoom: nextZoom }) => {
            setMapCenter(center);
            setZoom(nextZoom);
          }}
        >
          {userLocation && (
            <Marker anchor={userLocation} width={20} style={{ pointerEvents: "none" }}>
              <span
                className="relative z-10 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#2563EB] shadow-soft-airy dark:border-white/20 dark:shadow-none"
                aria-hidden
              />
            </Marker>
          )}

          {mappableBusinesses.map((business) => {
            const isSelected = selectedBusiness?.id === business.id;

            return (
              <Marker
                key={business.id}
                anchor={[business.latitude!, business.longitude!]}
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
      )}

      <div className={mapControlPillClassName} role="toolbar" aria-label="Map controls">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => setZoom((current) => Math.min(current + 1, MAX_ZOOM))}
          className={mapControlButtonClassName}
        >
          <Plus size={20} strokeWidth={1.75} aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => setZoom((current) => Math.max(current - 1, MIN_ZOOM))}
          className={mapControlButtonClassName}
        >
          <Minus size={20} strokeWidth={1.75} aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Locate me"
          onClick={handleLocateMe}
          className={mapControlButtonClassName}
        >
          <Navigation size={20} strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </div>
  );
}
