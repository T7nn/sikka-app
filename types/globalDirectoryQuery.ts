import type { BusinessRecord } from "@/types/business";
import { resolveBusinessMainCategory } from "@/types/businessCategories";
import type { EventRecord } from "@/types/event";
import {
  GLOBAL_ALL_CATEGORY,
  GLOBAL_CONTEXT_ACTIVITIES,
  GLOBAL_CONTEXT_STORES,
  type GlobalFilterState,
  type GlobalFilterSector,
  type TaxonomySector,
} from "@/types/taxonomy";
import type { AdminDirectoryRow } from "@/types/adminDirectoryQuery";
import type { Translations } from "@/types/i18n";
import { getCatalogCategoryLabel } from "@/types/i18n";

function formatDirectoryCategory(business: BusinessRecord, labels: Translations): string {
  return getCatalogCategoryLabel(resolveBusinessMainCategory(business), labels);
}

function businessRowsFromRecords(
  businesses: BusinessRecord[],
  labels: Translations,
): AdminDirectoryRow[] {
  return businesses.map((business) => ({
    kind: "store",
    id: business.id,
    name: business.name,
    description: business.description,
    sectorLabel: formatDirectoryCategory(business, labels),
    categoryTags: business.activities ?? [],
    business,
  }));
}

function activityRowsFromBusinesses(
  businesses: BusinessRecord[],
  sector: TaxonomySector,
): AdminDirectoryRow[] {
  const names = new Set<string>();

  for (const business of businesses) {
    for (const activity of business.activities ?? []) {
      const trimmed = activity.trim();
      if (trimmed) names.add(trimmed);
    }
  }

  return [...names].sort().map((name) => ({
    kind: "activity",
    name,
    sector,
  }));
}

function eventRowsFromRecords(events: EventRecord[]): AdminDirectoryRow[] {
  return events.map((event) => ({
    kind: "event",
    id: event.id,
    name: event.name,
    description: event.description,
    eventType: event.event_type ?? null,
    eventCategory: event.category ?? null,
    startDate: event.start_date,
    endDate: event.end_date,
    openTime: event.open_time,
    closeTime: event.close_time,
    event,
  }));
}

function filterBusinessesByCategory(
  businesses: BusinessRecord[],
  category: string,
): BusinessRecord[] {
  if (category === GLOBAL_ALL_CATEGORY) return businesses;

  const normalized = category.trim().toLowerCase();
  return businesses.filter((business) =>
    (business.activities ?? []).some(
      (activity) => activity.trim().toLowerCase() === normalized,
    ),
  );
}

function filterEventsByCategory(events: EventRecord[], category: string): EventRecord[] {
  if (category === GLOBAL_ALL_CATEGORY) return events;

  const normalized = category.trim().toLowerCase();
  return events.filter((event) => {
    const eventType = event.event_type?.trim().toLowerCase() ?? "";
    const eventCategory = event.category?.trim().toLowerCase() ?? "";
    return eventType === normalized || eventCategory === normalized;
  });
}

export function buildAdminDirectoryRows(
  businesses: BusinessRecord[],
  events: EventRecord[],
  filter: GlobalFilterState,
  labels: Translations,
): AdminDirectoryRow[] {
  const { sector, contextTab, category } = filter;

  if (sector === "Events") {
    const filteredEvents = filterEventsByCategory(events, category);
    return eventRowsFromRecords(filteredEvents);
  }

  let scopedBusinesses = businesses;

  if (sector === "Food" || sector === "Services") {
    scopedBusinesses = scopedBusinesses.filter(
      (business) => resolveBusinessMainCategory(business) === sector,
    );
  }

  scopedBusinesses = filterBusinessesByCategory(scopedBusinesses, category);

  if (contextTab === GLOBAL_CONTEXT_ACTIVITIES) {
    const activitySector: TaxonomySector =
      sector === "Food" || sector === "Services" ? sector : "Food";
    return activityRowsFromBusinesses(scopedBusinesses, activitySector);
  }

  if (contextTab === GLOBAL_CONTEXT_STORES) {
    return businessRowsFromRecords(scopedBusinesses, labels);
  }

  if (sector === "ALL") {
    const storeRows = businessRowsFromRecords(scopedBusinesses, labels);
    const activityRows = [
      ...activityRowsFromBusinesses(
        scopedBusinesses.filter((b) => resolveBusinessMainCategory(b) === "Food"),
        "Food",
      ),
      ...activityRowsFromBusinesses(
        scopedBusinesses.filter((b) => resolveBusinessMainCategory(b) === "Services"),
        "Services",
      ),
    ];
    const eventRows = eventRowsFromRecords(filterEventsByCategory(events, category));
    return [...storeRows, ...activityRows, ...eventRows];
  }

  const storeRows = businessRowsFromRecords(scopedBusinesses, labels);
  const activityRows = activityRowsFromBusinesses(scopedBusinesses, sector);
  return [...storeRows, ...activityRows];
}

export function sectorToMainCategory(sector: GlobalFilterSector): string | null {
  if (sector === "Food" || sector === "Services") return sector;
  return null;
}
