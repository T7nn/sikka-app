export interface BusinessRecord {
  id: string;
  name: string;
  type: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  google_maps_url?: string | null;
  instagram_url?: string | null;
  whatsapp_number?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
  main_category?: string | null;
  activities?: string[] | null;
}

function parseCoordinate(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "number" && typeof value !== "string") return null;

  const parsed = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function businessHasMapCoordinates(business: BusinessRecord): boolean {
  return business.latitude !== null && business.longitude !== null;
}

function optionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeBusiness(row: Record<string, unknown>): BusinessRecord | null {
  const id = row.id;
  const name = row.name;
  const type = row.type;
  const description = row.description;
  const latitude = row.latitude ?? row.lat;
  const longitude = row.longitude ?? row.lng;

  if (typeof id !== "string" && typeof id !== "number") {
    return null;
  }

  if (typeof name !== "string" || typeof type !== "string" || typeof description !== "string") {
    return null;
  }

  const parsedLat = parseCoordinate(latitude);
  const parsedLng = parseCoordinate(longitude);

  return {
    id: String(id),
    name,
    type,
    description,
    latitude: parsedLat,
    longitude: parsedLng,
    google_maps_url: optionalString(row.google_maps_url),
    instagram_url: optionalString(row.instagram_url),
    whatsapp_number: optionalString(row.whatsapp_number),
    website_url: optionalString(row.website_url),
    logo_url: optionalString(row.logo_url),
    main_category: optionalString(row.main_category),
    activities: normalizeActivities(row.activities),
  };
}

function normalizeActivities(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;

  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return items.length > 0 ? items : null;
}

export function formatBusinessTypeLabel(type: string): string {
  return type.trim().charAt(0).toUpperCase() + type.trim().slice(1).toLowerCase();
}
