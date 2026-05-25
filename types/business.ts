export interface BusinessRecord {
  id: string;
  name: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
}

export function normalizeBusiness(row: Record<string, unknown>): BusinessRecord | null {
  const id = row.id;
  const name = row.name;
  const type = row.type;
  const description = row.description;
  const latitude = row.latitude ?? row.lat;
  const longitude = row.longitude ?? row.lng;

  if (
    typeof id !== "string" &&
    typeof id !== "number"
  ) {
    return null;
  }

  if (
    typeof name !== "string" ||
    typeof type !== "string" ||
    typeof description !== "string" ||
    (typeof latitude !== "number" && typeof latitude !== "string") ||
    (typeof longitude !== "number" && typeof longitude !== "string")
  ) {
    return null;
  }

  const parsedLat = typeof latitude === "number" ? latitude : parseFloat(latitude);
  const parsedLng = typeof longitude === "number" ? longitude : parseFloat(longitude);

  if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
    return null;
  }

  return {
    id: String(id),
    name,
    type,
    description,
    latitude: parsedLat,
    longitude: parsedLng,
  };
}
