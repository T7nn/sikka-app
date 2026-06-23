import type { BusinessRecord } from "@/types/business";
import {
  EVENT_SUB_TYPES,
  FOOD_ACTIVITIES,
  SERVICES_ACTIVITIES,
} from "@/types/businessCategories";
import type { EventRecord } from "@/types/event";

export type DirectorySector = "Food" | "Services" | "Events";

export const DIRECTORY_SECTORS: DirectorySector[] = ["Food", "Services", "Events"];

export const DIRECTORY_ALL_TYPES = "All Types";
export const DIRECTORY_ALL_CATEGORY = "All";

export const BUSINESS_DIRECTORY_TYPES = [
  DIRECTORY_ALL_TYPES,
  "Stores",
  "Activities",
] as const;

export type BusinessDirectoryType = (typeof BUSINESS_DIRECTORY_TYPES)[number];

export type AdminDirectoryRow =
  | {
      kind: "store";
      id: string;
      name: string;
      description: string;
      sectorLabel: string;
      categoryTags: string[];
      business: BusinessRecord;
    }
  | {
      kind: "activity";
      name: string;
      sector: DirectorySector;
    }
  | {
      kind: "event";
      id: string;
      name: string;
      description: string;
      eventType: string | null;
      eventCategory: string | null;
      startDate: string;
      endDate: string;
      openTime: string;
      closeTime: string;
      event: EventRecord;
    };

export function getTypeOptionsForSector(sector: DirectorySector): string[] {
  if (sector === "Events") {
    return [DIRECTORY_ALL_TYPES, ...EVENT_SUB_TYPES];
  }
  return [...BUSINESS_DIRECTORY_TYPES];
}

export function getCategoryOptionsForSector(sector: DirectorySector): string[] {
  if (sector === "Events") {
    return [DIRECTORY_ALL_CATEGORY, ...EVENT_SUB_TYPES];
  }
  if (sector === "Food") {
    return [DIRECTORY_ALL_CATEGORY, ...FOOD_ACTIVITIES];
  }
  return [DIRECTORY_ALL_CATEGORY, ...SERVICES_ACTIVITIES];
}

export function getDefaultTypeForSector(sector: DirectorySector): string {
  return DIRECTORY_ALL_TYPES;
}

export function filterDirectoryRowsBySearch(
  rows: AdminDirectoryRow[],
  query: string,
): AdminDirectoryRow[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return rows;

  return rows.filter((row) => {
    if (row.kind === "store") {
      const activities = row.categoryTags.join(" ").toLowerCase();
      return (
        row.name.toLowerCase().includes(normalized) ||
        row.description.toLowerCase().includes(normalized) ||
        activities.includes(normalized) ||
        row.sectorLabel.toLowerCase().includes(normalized)
      );
    }

    if (row.kind === "activity") {
      return row.name.toLowerCase().includes(normalized);
    }

    return (
      row.name.toLowerCase().includes(normalized) ||
      row.description.toLowerCase().includes(normalized) ||
      (row.eventType?.toLowerCase().includes(normalized) ?? false) ||
      (row.eventCategory?.toLowerCase().includes(normalized) ?? false)
    );
  });
}
