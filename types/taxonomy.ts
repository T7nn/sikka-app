import type { BusinessRecord } from "@/types/business";
import {
  filterVisibleEvents,
  type EventRecord,
} from "@/types/event";
import {
  resolveBusinessMainCategory,
  type SearchResultItem,
} from "@/types/businessCategories";

export type TaxonomySector = "Food" | "Services" | "Events";

export type GlobalFilterSector = "ALL" | TaxonomySector;

export const GLOBAL_FILTER_SECTORS: GlobalFilterSector[] = [
  "ALL",
  "Food",
  "Services",
  "Events",
];

export const GLOBAL_ALL_CATEGORY = "All";

export const GLOBAL_CONTEXT_ALL_DIRECTORY = "ALL DIRECTORY";
export const GLOBAL_CONTEXT_ALL_BUSINESSES = "ALL BUSINESSES";
export const GLOBAL_CONTEXT_ALL_SERVICES = "ALL SERVICES";
export const GLOBAL_CONTEXT_ALL_EVENTS = "ALL EVENTS";
export const GLOBAL_CONTEXT_STORES = "Stores";
export const GLOBAL_CONTEXT_ACTIVITIES = "Activities";

export interface CategoryRecord {
  id: string;
  name: string;
  sector: TaxonomySector;
  created_at?: string | null;
}

export interface GlobalFilterState {
  sector: GlobalFilterSector;
  contextTab: string;
  category: string;
}

export function getDefaultContextTab(sector: GlobalFilterSector): string {
  if (sector === "ALL") return GLOBAL_CONTEXT_ALL_DIRECTORY;
  if (sector === "Food") return GLOBAL_CONTEXT_ALL_BUSINESSES;
  if (sector === "Services") return GLOBAL_CONTEXT_ALL_SERVICES;
  return GLOBAL_CONTEXT_ALL_EVENTS;
}

export function getContextTabOptions(sector: GlobalFilterSector): string[] {
  if (sector === "ALL") return [GLOBAL_CONTEXT_ALL_DIRECTORY];
  if (sector === "Events") return [GLOBAL_CONTEXT_ALL_EVENTS];
  return [
    sector === "Food" ? GLOBAL_CONTEXT_ALL_BUSINESSES : GLOBAL_CONTEXT_ALL_SERVICES,
    GLOBAL_CONTEXT_STORES,
    GLOBAL_CONTEXT_ACTIVITIES,
  ];
}

export function getDefaultGlobalFilter(): GlobalFilterState {
  return {
    sector: "ALL",
    contextTab: GLOBAL_CONTEXT_ALL_DIRECTORY,
    category: GLOBAL_ALL_CATEGORY,
  };
}

export function resolveGlobalFilter(
  sector: GlobalFilterSector,
  contextTab: string,
  category: string,
): GlobalFilterState {
  const contextOptions = getContextTabOptions(sector);
  const resolvedContext = contextOptions.includes(contextTab)
    ? contextTab
    : getDefaultContextTab(sector);

  return {
    sector,
    contextTab: resolvedContext,
    category: category.trim() || GLOBAL_ALL_CATEGORY,
  };
}

export function sectorForCategoryFetch(sector: GlobalFilterSector): TaxonomySector | "ALL" {
  return sector;
}

export function categoryNamesForSector(
  categories: CategoryRecord[],
  sector: GlobalFilterSector,
): string[] {
  if (sector === "ALL") {
    return [...new Set(categories.map((category) => category.name))].sort((a, b) =>
      a.localeCompare(b),
    );
  }

  return categories
    .filter((category) => category.sector === sector)
    .map((category) => category.name)
    .sort((a, b) => a.localeCompare(b));
}

function businessMatchesCategory(business: BusinessRecord, category: string): boolean {
  if (category === GLOBAL_ALL_CATEGORY) return true;

  const normalized = category.trim().toLowerCase();
  return (business.activities ?? []).some(
    (activity) => activity.trim().toLowerCase() === normalized,
  );
}

function eventMatchesCategory(event: EventRecord, category: string): boolean {
  if (category === GLOBAL_ALL_CATEGORY) return true;

  const normalized = category.trim().toLowerCase();
  const eventType = event.event_type?.trim().toLowerCase() ?? "";
  const eventCategory = event.category?.trim().toLowerCase() ?? "";

  return eventType === normalized || eventCategory === normalized;
}

export function filterBusinessesForGlobalFilter(
  businesses: BusinessRecord[],
  filter: GlobalFilterState,
): BusinessRecord[] {
  const { sector, contextTab, category } = filter;

  if (sector === "Events") return [];

  let result = businesses;

  if (sector === "Food" || sector === "Services") {
    result = result.filter(
      (business) => resolveBusinessMainCategory(business) === sector,
    );
  }

  if (category !== GLOBAL_ALL_CATEGORY) {
    result = result.filter((business) => businessMatchesCategory(business, category));
  }

  if (
    contextTab === GLOBAL_CONTEXT_STORES ||
    (sector === "ALL" && contextTab === GLOBAL_CONTEXT_ALL_DIRECTORY)
  ) {
    return result;
  }

  if (contextTab === GLOBAL_CONTEXT_ACTIVITIES) {
    return [];
  }

  return result;
}

export function filterEventsForGlobalFilter(
  events: EventRecord[],
  filter: GlobalFilterState,
): EventRecord[] {
  const { sector, category } = filter;

  if (sector === "Food" || sector === "Services") return [];

  let visible = filterVisibleEvents(events);

  if (category !== GLOBAL_ALL_CATEGORY) {
    visible = visible.filter((event) => eventMatchesCategory(event, category));
  }

  return visible;
}

export function buildGlobalSearchResults(
  businesses: BusinessRecord[],
  events: EventRecord[],
  filter: GlobalFilterState,
  query: string,
): SearchResultItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  const items: SearchResultItem[] = [];

  const filteredBusinesses = filterBusinessesForGlobalFilter(businesses, filter);
  const filteredEvents = filterEventsForGlobalFilter(events, filter);

  for (const business of filteredBusinesses) {
    items.push({ kind: "business", data: business });
  }

  for (const event of filteredEvents) {
    items.push({ kind: "event", data: event });
  }

  if (!normalizedQuery) return items;

  return items.filter((item) => {
    if (item.kind === "business") {
      const business = item.data;
      const mainCategory =
        business.main_category?.trim() || resolveBusinessMainCategory(business);
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
    const eventCategory = event.category?.toLowerCase() ?? "";

    return (
      event.name.toLowerCase().includes(normalizedQuery) ||
      event.description.toLowerCase().includes(normalizedQuery) ||
      eventType.includes(normalizedQuery) ||
      eventCategory.includes(normalizedQuery)
    );
  });
}

export function normalizeCategoryRow(row: Record<string, unknown>): CategoryRecord | null {
  const id = typeof row.id === "string" ? row.id : null;
  const name = typeof row.name === "string" ? row.name.trim() : "";
  const sector = row.sector;

  if (!id || !name) return null;
  if (sector !== "Food" && sector !== "Services" && sector !== "Events") return null;

  return {
    id,
    name,
    sector,
    created_at: typeof row.created_at === "string" ? row.created_at : null,
  };
}
