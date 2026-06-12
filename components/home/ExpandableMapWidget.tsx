"use client";

import Map, { GeolocateControl, Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { businessHasMapCoordinates, type BusinessRecord } from "@/types/business";

const ABU_DHABI = { longitude: 54.3773, latitude: 24.4539 };
const DEFAULT_ZOOM = 13;

function getMapStyle(isDark: boolean): string {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";
  const variant = isDark ? "basic-v2-dark" : "basic-v2-light";
  return `https://api.maptiler.com/maps/${variant}/style.json?key=${key}`;
}

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
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessRecord | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mapPreviewBusiness === null) {
      setSelectedBusiness(null);
    }
  }, [mapPreviewBusiness]);

  const mapStyle = useMemo(() => {
    const isDark = resolvedTheme === "dark";
    return getMapStyle(isDark);
  }, [resolvedTheme]);

  const selectBusiness = (business: BusinessRecord) => {
    setSelectedBusiness(business);
    onMapPinSelect?.(business);
  };

  const mappableBusinesses = businesses.filter((business) => businessHasMapCoordinates(business));

  if (!mounted) {
    return <div className="relative z-10 h-full w-full bg-white dark:bg-black" />;
  }

  return (
    <div className="relative z-10 h-full w-full">
      <Map
        mapStyle={mapStyle}
        initialViewState={{
          ...ABU_DHABI,
          zoom: DEFAULT_ZOOM,
        }}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <GeolocateControl position="bottom-right" trackUserLocation showAccuracyCircle={false} />

        {mappableBusinesses.map((business) => {
          const isSelected = selectedBusiness?.id === business.id;

          return (
            <Marker
              key={business.id}
              longitude={business.longitude!}
              latitude={business.latitude!}
              anchor="center"
            >
              <button
                type="button"
                aria-label={`Preview ${business.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  selectBusiness(business);
                }}
                className={`pointer-events-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 shadow-soft-airy transition-transform hover:scale-110 active:scale-95 dark:shadow-none ${
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
    </div>
  );
}
