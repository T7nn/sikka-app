"use client";

import { useMemo } from "react";
import { isShortMapsUrl } from "@/utils/mapHelpers";
import { ui } from "@/utils/ui";

interface MapsLocationInputProps {
  url: string;
  onUrlChange: (value: string) => void;
  useManualCoordinates: boolean;
  onUseManualCoordinatesChange: (value: boolean) => void;
  manualLatitude: string;
  onManualLatitudeChange: (value: string) => void;
  manualLongitude: string;
  onManualLongitudeChange: (value: string) => void;
  disabled?: boolean;
  inputClassName?: string;
  labelClassName?: string;
  labels: {
    googleMapsLink: string;
    enterCoordinatesManually: string;
    latitude: string;
    latitudePlaceholder: string;
    longitude: string;
    longitudePlaceholder: string;
    shortMapsUrlWarning: string;
  };
}

export function MapsLocationInput({
  url,
  onUrlChange,
  useManualCoordinates,
  onUseManualCoordinatesChange,
  manualLatitude,
  onManualLatitudeChange,
  manualLongitude,
  onManualLongitudeChange,
  disabled = false,
  inputClassName,
  labelClassName,
  labels,
}: MapsLocationInputProps) {
  const inputClass = inputClassName ?? ui.input;
  const fieldLabelClass =
    labelClassName ??
    "mb-2 block font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/45 dark:text-white/45";

  const showShortUrlWarning = useMemo(
    () => !useManualCoordinates && isShortMapsUrl(url),
    [url, useManualCoordinates],
  );

  return (
    <div className="flex flex-col gap-4">
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={useManualCoordinates}
          disabled={disabled}
          onChange={(event) => onUseManualCoordinatesChange(event.target.checked)}
          className="h-4 w-4 rounded border-[#222222]/30 accent-[#222222] dark:border-white/30 dark:accent-white"
        />
        <span className="font-sans text-sm text-[#222222] dark:text-white">
          {labels.enterCoordinatesManually}
        </span>
      </label>

      {useManualCoordinates ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={fieldLabelClass}>{labels.latitude}</span>
            <input
              type="text"
              inputMode="decimal"
              value={manualLatitude}
              onChange={(event) => onManualLatitudeChange(event.target.value)}
              placeholder={labels.latitudePlaceholder}
              disabled={disabled}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={fieldLabelClass}>{labels.longitude}</span>
            <input
              type="text"
              inputMode="decimal"
              value={manualLongitude}
              onChange={(event) => onManualLongitudeChange(event.target.value)}
              placeholder={labels.longitudePlaceholder}
              disabled={disabled}
              className={inputClass}
            />
          </label>
        </div>
      ) : (
        <label className="block">
          <span className={fieldLabelClass}>{labels.googleMapsLink}</span>
          <input
            type="url"
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="https://maps.app.goo.gl/…"
            disabled={disabled}
            className={inputClass}
          />
          {showShortUrlWarning && (
            <p className="mt-2 font-sans text-xs leading-relaxed text-[#222222]/55 dark:text-white/55">
              {labels.shortMapsUrlWarning}
            </p>
          )}
        </label>
      )}
    </div>
  );
}
