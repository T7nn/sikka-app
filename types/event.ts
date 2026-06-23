export interface EventRecord {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  google_maps_url?: string | null;
  start_date: string;
  end_date: string;
  open_time: string;
  close_time: string;
  event_type?: string | null;
  category?: string | null;
}

export type EventStatus = "open" | "closed" | "ended";

function optionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseCoordinate(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "number" && typeof value !== "string") return null;
  const parsed = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function normalizeTime(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed.slice(0, 5);
  return null;
}

export function normalizeEvent(row: Record<string, unknown>): EventRecord | null {
  const id = row.id;
  const name = row.name;
  const description = row.description;
  const latitude = parseCoordinate(row.latitude ?? row.lat);
  const longitude = parseCoordinate(row.longitude ?? row.lng);
  const startDate = normalizeDate(row.start_date);
  const endDate = normalizeDate(row.end_date);
  const openTime = normalizeTime(row.open_time);
  const closeTime = normalizeTime(row.close_time);

  if (
    (typeof id !== "string" && typeof id !== "number") ||
    typeof name !== "string" ||
    typeof description !== "string" ||
    latitude === null ||
    longitude === null ||
    !startDate ||
    !endDate ||
    !openTime ||
    !closeTime
  ) {
    return null;
  }

  return {
    id: String(id),
    name,
    description,
    latitude,
    longitude,
    google_maps_url: optionalString(row.google_maps_url),
    start_date: startDate,
    end_date: endDate,
    open_time: openTime,
    close_time: closeTime,
    event_type: optionalString(row.event_type),
    category: optionalString(row.category ?? row.event_category),
  };
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeLocal(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function combineDateAndTime(date: string, time: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function getEventStatus(event: EventRecord, now: Date = new Date()): EventStatus {
  const endDateTime = combineDateAndTime(event.end_date, event.close_time);
  if (now > endDateTime) {
    return "ended";
  }

  const startDateTime = combineDateAndTime(event.start_date, event.open_time);
  if (now < startDateTime) {
    return "ended";
  }

  const today = formatDateLocal(now);
  if (today < event.start_date || today > event.end_date) {
    return "ended";
  }

  const currentMinutes = toMinutes(formatTimeLocal(now));
  const openMinutes = toMinutes(event.open_time);
  const closeMinutes = toMinutes(event.close_time);

  if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
    return "open";
  }

  return "closed";
}

export function filterVisibleEvents(events: EventRecord[], now: Date = new Date()): EventRecord[] {
  return events.filter((event) => getEventStatus(event, now) !== "ended");
}
