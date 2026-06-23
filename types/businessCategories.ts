import type { BusinessRecord } from "@/types/business";
import { filterVisibleEvents, type EventRecord } from "@/types/event";

export type MainCategory = "Food" | "Services";

export type CatalogCategoryFilter = "All" | MainCategory;

export type MapViewFilter = "All" | "Events" | MainCategory;

export const MAIN_CATEGORIES: MainCategory[] = ["Food", "Services"];

export const MAP_VIEW_DROPDOWN_OPTIONS = ["Events", "Food", "Services"] as const;

export type MapViewDropdownOption = (typeof MAP_VIEW_DROPDOWN_OPTIONS)[number];

export const CATALOG_CATEGORY_FILTERS: CatalogCategoryFilter[] = [
  "All",
  "Food",
  "Services",
];

export const ALL_FOOD_FILTER = "all-food";
export const ALL_SERVICES_FILTER = "all-services";
export const ALL_MAP_ACTIVITIES_FILTER = "all-activities";
export const ALL_EVENTS_FILTER = "all-events";

export const EVENT_SUB_TYPES = [
  "Festival",
  "Pop-up",
  "Market",
  "Workshop",
  "Concert",
] as const;

export type EventSubType = (typeof EVENT_SUB_TYPES)[number];

export interface ActivityFilterOption {
  value: string;
  label: string;
}

export const FOOD_ACTIVITIES = [
  "Coffee",
  "Dessert",
  "Pastry",
  "Lemonade",
  "Beverages",
] as const;

export const SERVICES_ACTIVITIES = [
  "Consulting",
  "Maintenance",
  "Tech Support",
  "Design",
  "Legal",
] as const;

export function getActivitiesForMainCategory(category: MainCategory): readonly string[] {
  return category === "Food" ? FOOD_ACTIVITIES : SERVICES_ACTIVITIES;
}

export function buildActivitiesPayload(
  selected: Record<string, boolean>,
  predefined: readonly string[],
  otherEnabled: boolean,
  otherText: string,
): string[] {
  const activities = predefined.filter((activity) => selected[activity]);

  if (otherEnabled) {
    const custom = otherText.trim();
    if (custom) {
      activities.push(custom);
    }
  }

  return activities;
}

export function getAllFilterForCategory(category: MainCategory): string {
  return category === "Food" ? ALL_FOOD_FILTER : ALL_SERVICES_FILTER;
}

export function getAllFilterLabel(category: MainCategory): string {
  return category === "Food" ? "All Food" : "All Services";
}

export function businessMatchesCatalogCategory(
  business: BusinessRecord,
  filter: CatalogCategoryFilter,
): boolean {
  if (filter === "All") return true;

  const raw = business.main_category?.trim();
  if (raw === "Food" || raw === "Services") {
    return raw === filter;
  }

  return resolveBusinessMainCategory(business) === filter;
}

export function resolveBusinessMainCategory(business: BusinessRecord): MainCategory {
  const raw = business.main_category?.trim();

  if (raw === "Food" || raw === "Services") {
    return raw;
  }

  if (business.type.trim().toLowerCase() === "services") {
    return "Services";
  }

  return "Food";
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

function collectAllCustomActivities(
  businesses: BusinessRecord[],
  predefined: readonly string[],
): string[] {
  const predefinedKeys = new Set(predefined.map((activity) => activity.toLowerCase()));
  const custom = new Set<string>();

  for (const business of businesses) {
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

export function getDefaultActivityFilter(category: CatalogCategoryFilter): string {
  if (category === "All") return ALL_MAP_ACTIVITIES_FILTER;
  return getAllFilterForCategory(category);
}

export function buildActivityFilterOptions(
  category: CatalogCategoryFilter,
  businesses: BusinessRecord[],
): ActivityFilterOption[] {
  if (category === "All") {
    const predefined = [...FOOD_ACTIVITIES, ...SERVICES_ACTIVITIES] as const;
    const custom = collectAllCustomActivities(businesses, predefined);

    return [
      { value: ALL_MAP_ACTIVITIES_FILTER, label: "All Activities" },
      ...predefined.map((activity) => ({ value: activity, label: activity })),
      ...custom.map((activity) => ({ value: activity, label: activity })),
    ];
  }

  const predefined = getActivitiesForMainCategory(category);
  const custom = collectCustomActivities(businesses, category, predefined);

  return [
    { value: getAllFilterForCategory(category), label: getAllFilterLabel(category) },
    ...predefined.map((activity) => ({ value: activity, label: activity })),
    ...custom.map((activity) => ({ value: activity, label: activity })),
  ];
}

export function shouldShowBusinessesOnMap(filter: MapViewFilter): boolean {
  return filter === "All" || filter === "Food" || filter === "Services";
}

export function shouldShowEventsOnMap(filter: MapViewFilter): boolean {
  return filter === "All" || filter === "Events";
}

export interface SubTypeFilterOption {
  value: string;
  label: string;
}

export function getDefaultSubTypeFilter(filter: MapViewFilter): string {
  if (filter === "Events") return ALL_EVENTS_FILTER;
  if (filter === "Food") return ALL_FOOD_FILTER;
  if (filter === "Services") return ALL_SERVICES_FILTER;
  return ALL_MAP_ACTIVITIES_FILTER;
}

export function buildSubTypeFilterOptions(
  filter: MapViewFilter,
  businesses: BusinessRecord[],
): SubTypeFilterOption[] {
  if (filter === "Events") {
    return [
      { value: ALL_EVENTS_FILTER, label: "All Events" },
      ...EVENT_SUB_TYPES.map((subType) => ({ value: subType, label: subType })),
    ];
  }

  if (filter === "Food" || filter === "Services") {
    return buildActivityFilterOptions(filter, businesses);
  }

  return [];
}

export function eventMatchesSubType(event: EventRecord, subTypeFilter: string): boolean {
  if (subTypeFilter === ALL_EVENTS_FILTER) return true;

  const normalizedFilter = subTypeFilter.trim().toLowerCase();
  const eventType = event.event_type?.trim().toLowerCase();

  if (eventType && eventType === normalizedFilter) {
    return true;
  }

  const haystack = `${event.name} ${event.description}`.toLowerCase();
  return haystack.includes(normalizedFilter);
}

export function filterEventsForMapView(
  events: EventRecord[],
  filter: MapViewFilter,
  subTypeFilter: string,
): EventRecord[] {
  if (!shouldShowEventsOnMap(filter)) return [];

  let visible = filterVisibleEvents(events);

  if (filter === "Events" && subTypeFilter !== ALL_EVENTS_FILTER) {
    visible = visible.filter((event) => eventMatchesSubType(event, subTypeFilter));
  }

  return visible;
}

export function filterBusinessesForMapView(
  businesses: BusinessRecord[],
  filter: MapViewFilter,
  subTypeFilter?: string,
): BusinessRecord[] {
  if (filter === "All") return businesses;
  if (filter === "Events") return [];

  const categoryFilter = filter as CatalogCategoryFilter;
  const activityFilter = subTypeFilter ?? getDefaultSubTypeFilter(filter);
  return filterBusinessesForMap(businesses, categoryFilter, activityFilter);
}

export type SearchResultItem =
  | { kind: "business"; data: BusinessRecord }
  | { kind: "event"; data: EventRecord };

export function buildSearchResults(
  businesses: BusinessRecord[],
  events: EventRecord[],
  filter: MapViewFilter,
  subTypeFilter: string,
  query: string,
): SearchResultItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  const items: SearchResultItem[] = [];

  const filteredBusinesses = filterBusinessesForMapView(businesses, filter, subTypeFilter);
  const filteredEvents = filterEventsForMapView(events, filter, subTypeFilter);

  if (filter === "All" || filter === "Food" || filter === "Services") {
    for (const business of filteredBusinesses) {
      items.push({ kind: "business", data: business });
    }
  }

  if (filter === "All" || filter === "Events") {
    for (const event of filteredEvents) {
      items.push({ kind: "event", data: event });
    }
  }

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => {
    if (item.kind === "business") {
      const business = item.data;
      const mainCategory = business.main_category?.trim() || resolveBusinessMainCategory(business);
      const activities = (business.activities ?? []).join(" ").toLowerCase();

      return (
        business.name.toLowerCase().includes(normalizedQuery) ||
        business.description.toLowerCase().includes(normalizedQuery) ||
        mainCategory.toLowerCase().includes(normalizedQuery) ||
        activities.includes(normalizedQuery)
      );
    }

    const event = item.data;
    const eventType = event.event_type?.toLowerCase() ?? "";

    return (
      event.name.toLowerCase().includes(normalizedQuery) ||
      event.description.toLowerCase().includes(normalizedQuery) ||
      eventType.includes(normalizedQuery)
    );
  });
}

export function filterBusinessesForMap(
  businesses: BusinessRecord[],
  categoryFilter: CatalogCategoryFilter,
  activityFilter: string,
): BusinessRecord[] {
  const inCategory =
    categoryFilter === "All"
      ? businesses
      : businesses.filter((business) => businessMatchesCatalogCategory(business, categoryFilter));

  const bypassActivityFilter =
    categoryFilter === "All"
      ? activityFilter === ALL_MAP_ACTIVITIES_FILTER
      : activityFilter === getAllFilterForCategory(categoryFilter);

  if (bypassActivityFilter) {
    return inCategory;
  }

  const normalizedFilter = activityFilter.trim().toLowerCase();

  return inCategory.filter((business) =>
    (business.activities ?? []).some(
      (activity) => activity.trim().toLowerCase() === normalizedFilter,
    ),
  );
}
