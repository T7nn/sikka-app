import type { BusinessRecord } from "@/types/business";
import {
  EVENT_SUB_TYPES,
  FOOD_ACTIVITIES,
  SERVICES_ACTIVITIES,
  businessMatchesCatalogCategory,
  eventMatchesSubType,
  type MainCategory,
} from "@/types/businessCategories";
import type { EventRecord } from "@/types/event";

export type DirectoryPrimaryFilter = "Food" | "Services" | "Events";
export type DirectoryEntityType = "Store" | "Activity" | "Event";

export const DIRECTORY_SUBTYPE_ALL = "All";

export const DIRECTORY_PRIMARY_FILTERS: DirectoryPrimaryFilter[] = [
  "Food",
  "Services",
  "Events",
];

export const DIRECTORY_ENTITY_TYPES: DirectoryEntityType[] = [
  "Store",
  "Activity",
  "Event",
];

export function getDefaultEntityForPrimary(
  primary: DirectoryPrimaryFilter,
): DirectoryEntityType {
  if (primary === "Events") return "Event";
  return "Store";
}

function collectCustomActivities(
  businesses: BusinessRecord[],
  category: MainCategory,
  predefined: readonly string[],
): string[] {
  const predefinedKeys = new Set(predefined.map((activity) => activity.toLowerCase()));
  const custom = new Set<string>();

  for (const business of businesses) {
    if (!businessMatchesCatalogCategory(business, category)) continue;

    for (const activity of business.activities ?? []) {
      const trimmed = activity.trim();
      if (!trimmed) continue;
      if (!predefinedKeys.has(trimmed.toLowerCase())) {
        custom.add(trimmed);
      }
    }
  }

  return [...custom].sort((a, b) => a.localeCompare(b));
}

export function buildDirectorySubTypeOptions(
  primary: DirectoryPrimaryFilter,
  businesses: BusinessRecord[],
): string[] {
  if (primary === "Events") {
    return [DIRECTORY_SUBTYPE_ALL, ...EVENT_SUB_TYPES];
  }

  if (primary === "Food") {
    const custom = collectCustomActivities(businesses, "Food", FOOD_ACTIVITIES);
    return [DIRECTORY_SUBTYPE_ALL, ...FOOD_ACTIVITIES, ...custom];
  }

  const custom = collectCustomActivities(businesses, "Services", SERVICES_ACTIVITIES);
  return [DIRECTORY_SUBTYPE_ALL, ...SERVICES_ACTIVITIES, ...custom];
}

export type DirectoryListItem =
  | { kind: "store"; business: BusinessRecord }
  | { kind: "activity"; name: string }
  | { kind: "event"; event: EventRecord };

function businessMatchesSubType(business: BusinessRecord, subType: string): boolean {
  if (subType === DIRECTORY_SUBTYPE_ALL) return true;

  const normalized = subType.trim().toLowerCase();
  return (business.activities ?? []).some(
    (activity) => activity.trim().toLowerCase() === normalized,
  );
}

function collectActivityNames(
  businesses: BusinessRecord[],
  category: MainCategory,
  subType: string,
): string[] {
  const names = new Set<string>();

  for (const business of businesses) {
    if (!businessMatchesCatalogCategory(business, category)) continue;

    for (const activity of business.activities ?? []) {
      const trimmed = activity.trim();
      if (!trimmed) continue;

      if (subType !== DIRECTORY_SUBTYPE_ALL) {
        if (trimmed.toLowerCase() !== subType.trim().toLowerCase()) continue;
      }

      names.add(trimmed);
    }
  }

  return [...names].sort((a, b) => a.localeCompare(b));
}

function matchesSearchQuery(
  item: DirectoryListItem,
  query: string,
  primary: DirectoryPrimaryFilter,
): boolean {
  if (!query) return true;

  if (item.kind === "store") {
    const business = item.business;
    const activities = (business.activities ?? []).join(" ").toLowerCase();

    return (
      business.name.toLowerCase().includes(query) ||
      business.description.toLowerCase().includes(query) ||
      activities.includes(query) ||
      primary.toLowerCase().includes(query)
    );
  }

  if (item.kind === "activity") {
    return item.name.toLowerCase().includes(query);
  }

  const event = item.event;
  const eventType = event.event_type?.toLowerCase() ?? "";

  return (
    event.name.toLowerCase().includes(query) ||
    event.description.toLowerCase().includes(query) ||
    eventType.includes(query)
  );
}

export function filterDirectoryList(
  businesses: BusinessRecord[],
  events: EventRecord[],
  primary: DirectoryPrimaryFilter,
  entity: DirectoryEntityType,
  subType: string,
  searchQuery: string,
): DirectoryListItem[] {
  const query = searchQuery.trim().toLowerCase();
  const items: DirectoryListItem[] = [];

  if (entity === "Event") {
    if (primary !== "Events") return [];

    for (const event of events) {
      if (subType !== DIRECTORY_SUBTYPE_ALL && !eventMatchesSubType(event, subType)) {
        continue;
      }
      items.push({ kind: "event", event });
    }
  } else if (entity === "Activity") {
    if (primary === "Events") return [];

    const category: MainCategory = primary === "Food" ? "Food" : "Services";
    for (const name of collectActivityNames(businesses, category, subType)) {
      items.push({ kind: "activity", name });
    }
  } else {
    if (primary === "Events") return [];

    const category: MainCategory = primary === "Food" ? "Food" : "Services";

    for (const business of businesses) {
      if (!businessMatchesCatalogCategory(business, category)) continue;
      if (!businessMatchesSubType(business, subType)) continue;
      items.push({ kind: "store", business });
    }
  }

  if (!query) return items;

  return items.filter((item) => matchesSearchQuery(item, query, primary));
}
