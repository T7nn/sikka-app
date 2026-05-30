import type { BusinessRecord } from "@/types/business";

export type MainCategory = "Food" | "Services";

export const MAIN_CATEGORIES: MainCategory[] = ["Food", "Services"];

export const ALL_FOOD_FILTER = "all-food";
export const ALL_SERVICES_FILTER = "all-services";

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

export function buildActivityFilterOptions(
  category: MainCategory,
  businesses: BusinessRecord[],
): ActivityFilterOption[] {
  const predefined = getActivitiesForMainCategory(category);
  const custom = collectCustomActivities(businesses, category, predefined);

  return [
    { value: getAllFilterForCategory(category), label: getAllFilterLabel(category) },
    ...predefined.map((activity) => ({ value: activity, label: activity })),
    ...custom.map((activity) => ({ value: activity, label: activity })),
  ];
}

export function filterBusinessesForMap(
  businesses: BusinessRecord[],
  mainCategory: MainCategory,
  activityFilter: string,
): BusinessRecord[] {
  const inCategory = businesses.filter(
    (business) => resolveBusinessMainCategory(business) === mainCategory,
  );

  const allFilter = getAllFilterForCategory(mainCategory);
  if (activityFilter === allFilter) {
    return inCategory;
  }

  const normalizedFilter = activityFilter.trim().toLowerCase();

  return inCategory.filter((business) =>
    (business.activities ?? []).some(
      (activity) => activity.trim().toLowerCase() === normalizedFilter,
    ),
  );
}
