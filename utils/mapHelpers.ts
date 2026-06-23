export interface ParsedCoordinates {
  latitude: number;
  longitude: number;
}

const COORDINATE_PATTERNS: Array<{
  regex: RegExp;
  latIndex: number;
  lngIndex: number;
}> = [
  { regex: /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:[,/]|$)/, latIndex: 1, lngIndex: 2 },
  { regex: /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/i, latIndex: 1, lngIndex: 2 },
  {
    regex: /[?&]q=(-?\d+(?:\.\d+)?)[,%2C\s+]+(-?\d+(?:\.\d+)?)/i,
    latIndex: 1,
    lngIndex: 2,
  },
  { regex: /[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i, latIndex: 1, lngIndex: 2 },
  { regex: /[?&]center=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i, latIndex: 1, lngIndex: 2 },
  { regex: /\/(-?\d+\.\d{4,}),(-?\d+\.\d{4,})(?:\/|$)/, latIndex: 1, lngIndex: 2 },
  {
    regex: /maps\.google\.com\/.*@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i,
    latIndex: 1,
    lngIndex: 2,
  },
  {
    regex: /googleusercontent\.com\/.*@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i,
    latIndex: 1,
    lngIndex: 2,
  },
  {
    regex: /googleusercontent\.com\/maps\.google\.com\/.*[?&]q=(-?\d+(?:\.\d+)?)[,%2C\s+]+(-?\d+(?:\.\d+)?)/i,
    latIndex: 1,
    lngIndex: 2,
  },
];

function isValidCoordinate(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0)
  );
}

function matchCoordinates(input: string): ParsedCoordinates | null {
  const decoded = decodeURIComponent(input);

  for (const { regex, latIndex, lngIndex } of COORDINATE_PATTERNS) {
    const match = decoded.match(regex) ?? input.match(regex);
    if (!match) continue;

    const latitude = parseFloat(match[latIndex]);
    const longitude = parseFloat(match[lngIndex]);

    if (isValidCoordinate(latitude, longitude)) {
      return { latitude, longitude };
    }
  }

  return null;
}

export function isShortMapsUrl(url: string): boolean {
  const trimmed = url.trim();
  return /^(https?:\/\/)?(maps\.app\.goo\.gl|goo\.gl\/maps)\//i.test(trimmed);
}

export function isGoogleMapsUrl(url: string): boolean {
  const trimmed = url.trim();
  return (
    /google\.com\/maps/i.test(trimmed) ||
    /maps\.google\.com/i.test(trimmed) ||
    isShortMapsUrl(trimmed) ||
    /googleusercontent\.com\/maps/i.test(trimmed)
  );
}

/** Attempt to extract coordinates directly from a URL string without network I/O. */
export function parseCoordinatesFromMapsUrl(url: string): ParsedCoordinates | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  return matchCoordinates(trimmed);
}

export function parseManualCoordinates(
  latitudeInput: string,
  longitudeInput: string,
): ParsedCoordinates | null {
  const latitude = parseFloat(latitudeInput.trim());
  const longitude = parseFloat(longitudeInput.trim());

  if (!isValidCoordinate(latitude, longitude)) {
    return null;
  }

  return { latitude, longitude };
}
