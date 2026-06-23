import type { BusinessRecord } from "@/types/business";
import {
  EVENT_SUB_TYPES,
  FOOD_ACTIVITIES,
  SERVICES_ACTIVITIES,
  businessMatchesCatalogCategory,
  eventMatchesSubType,
  resolveBusinessMainCategory,
  type MainCategory,
} from "@/types/businessCategories";
import type { EventRecord } from "@/types/event";

export type DirectoryPrimaryFilter = "Food" | "Services" | "Events";
export type DirectoryEntityType = "Store" | "Service" | "Event";

export const DIRECTORY_SUBTYPE_ALL = "All";

export const DIRECTORY_PRIMARY_FILTERS: DirectoryPrimaryFilter[] = [
  "Food",
  "Services",
  "Events",
];

export const DIRECTORY_ENTITY_TYPES: DirectoryEntityType[] = [
  "Store",
  "Service",
  "Event",
];

export function getDefaultEntityForPrimary(
  primary: DirectoryPrimaryFilter,
): DirectoryEntityType {
  if (primary === "Events") return "Event";
  if (primary === "Services") return "Service";
  return "Store";
}

function isValidPrimaryEntityPair(
  primary: DirectoryPrimaryFilter,
  entity: DirectoryEntityType,
): boolean {
  if (entity === "Event") return primary === "Events";
  if (entity === "Store") return primary === "Food";
  if (entity === "Service") return primary === "Services";
  return false;
}

function collectCustomActivities(
  businesses: BusinessRecord[],
  category: MainCategory,
  predefined: readonly string[],
): string[] {
  const predefinedKeys = new Set(predefined.map((activity) => activity.toLowerCase()));
  const custom = new Set<string>();

  for (const business of businesses) {
    if (resolveBusinessMainCategory(business) !== category) continue;

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
  entity: DirectoryEntityType,
  businesses: BusinessRecord[],
): string[] {
  if (!isValidPrimaryEntityPair(primary, entity)) {
    return [DIRECTORY_SUBTYPE_ALL];
  }

  if (entity === "Event") {
    return [DIRECTORY_SUBTYPE_ALL, ...EVENT_SUB_TYPES];
  }

  if (entity === "Store") {
    const custom = collectCustomActivities(businesses, "Food", FOOD_ACTIVITIES);
    return [DIRECTORY_SUBTYPE_ALL, ...FOOD_ACTIVITIES, ...custom];
  }

  const custom = collectCustomActivities(businesses, "Services", SERVICES_ACTIVITIES);
  return [DIRECTORY_SUBTYPE_ALL, ...SERVICES_ACTIVITIES, ...custom];
}

export type DirectoryListItem =
  | { kind: "store"; business: BusinessRecord }
  | { kind: "event"; event: EventRecord };

function businessMatchesSubType(business: BusinessRecord, subType: string): boolean {
  if (subType === DIRECTORY_SUBTYPE_ALL) return true;

  const normalized = subType.trim().toLowerCase();
  return (business.activities ?? []).some(
    (activity) => activity.trim().toLowerCase() === normalized,
  );
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
  if (!isValidPrimaryEntityPair(primary, entity)) {
    return [];
  }

  const query = searchQuery.trim().toLowerCase();
  const items: DirectoryListItem[] = [];

  if (entity === "Event") {
    for (const event of events) {
      if (subType !== DIRECTORY_SUBTYPE_ALL && !eventMatchesSubType(event, subType)) {
        continue;
      }
      items.push({ kind: "event", event });
    }
  } else {
    const category: MainCategory = entity === "Store" ? "Food" : "Services";

    for (const business of businesses) {
      if (!businessMatchesCatalogCategory(business, category)) continue;
      if (!businessMatchesSubType(business, subType)) continue;
      items.push({ kind: "store", business });
    }
  }

  if (!query) return items;

  return items.filter((item) => matchesSearchQuery(item, query, primary));
}
