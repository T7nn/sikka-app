"use server";

import {
  isShortMapsUrl,
  parseCoordinatesFromMapsUrl,
  type ParsedCoordinates,
} from "@/utils/mapHelpers";

export type ExtractCoordinatesResult =
  | {
      success: true;
      latitude: number;
      longitude: number;
      expandedUrl: string;
      resolvedVia: "local" | "redirect";
    }
  | {
      success: false;
      error: string;
      needsManualEntry?: boolean;
      isShortUrl?: boolean;
    };

function successResult(
  coords: ParsedCoordinates,
  expandedUrl: string,
  resolvedVia: "local" | "redirect",
): ExtractCoordinatesResult {
  return {
    success: true,
    latitude: coords.latitude,
    longitude: coords.longitude,
    expandedUrl,
    resolvedVia,
  };
}

export async function extractCoordinatesFromMapsUrl(
  inputUrl: string,
): Promise<ExtractCoordinatesResult> {
  const trimmed = inputUrl.trim();

  if (!trimmed) {
    return {
      success: false,
      error: "Please enter a Google Maps link or use manual coordinates.",
      needsManualEntry: true,
    };
  }

  const localCoords = parseCoordinatesFromMapsUrl(trimmed);
  if (localCoords) {
    return successResult(localCoords, trimmed, "local");
  }

  const shortUrl = isShortMapsUrl(trimmed);

  try {
    const response = await fetch(trimmed, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const finalUrl = response.url;
    const redirectedCoords = parseCoordinatesFromMapsUrl(finalUrl);

    if (redirectedCoords) {
      return successResult(redirectedCoords, finalUrl, "redirect");
    }

    if (shortUrl) {
      return {
        success: false,
        error:
          "This shortened Google Maps link could not be resolved automatically. Paste the full maps.google.com URL or enter coordinates manually.",
        needsManualEntry: true,
        isShortUrl: true,
      };
    }

    return {
      success: false,
      error:
        "Could not pinpoint coordinates in this Google Maps link. Paste a link containing @latitude,longitude or enter coordinates manually.",
      needsManualEntry: true,
    };
  } catch (error) {
    console.error("Error fetching Maps URL:", error);

    if (shortUrl) {
      return {
        success: false,
        error:
          "Could not resolve this shortened link. Paste the full Google Maps URL or enter coordinates manually.",
        needsManualEntry: true,
        isShortUrl: true,
      };
    }

    return {
      success: false,
      error: "Failed to connect to Google Maps. Enter coordinates manually instead.",
      needsManualEntry: true,
    };
  }
}
