"use server";

export type ExtractCoordinatesResult =
  | {
      success: true;
      latitude: number;
      longitude: number;
      expandedUrl: string;
    }
  | {
      success: false;
      error: string;
    };

export async function extractCoordinatesFromMapsUrl(
  shortUrl: string,
): Promise<ExtractCoordinatesResult> {
  try {
    const response = await fetch(shortUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const finalUrl = response.url;
    const coordinateRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = finalUrl.match(coordinateRegex);

    if (match) {
      return {
        success: true,
        latitude: parseFloat(match[1]),
        longitude: parseFloat(match[2]),
        expandedUrl: finalUrl,
      };
    }

    return {
      success: false,
      error: "Could not pinpoint coordinates in this specific Google Maps link.",
    };
  } catch (error) {
    console.error("Error fetching Maps URL:", error);
    return {
      success: false,
      error: "Failed to connect to Google Maps to verify the link.",
    };
  }
}
