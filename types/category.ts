import type { BusinessType } from "./businessForm";

export type { BusinessType };
export type ActiveCategory = "all" | BusinessType;

export const CATEGORY_FILTERS: { id: ActiveCategory; label: string }[] = [
  { id: "all", label: "Nearby" },
  { id: "digital", label: "Digital" },
  { id: "physical", label: "Physical" },
  { id: "services", label: "Services" },
];

export function categoryMatchesFilter(
  businessType: string,
  activeCategory: ActiveCategory,
): boolean {
  if (activeCategory === "all") return true;
  return businessType.toLowerCase() === activeCategory;
}
