import type { BusinessRecord } from "@/types/business";

export type DirectoryDeleteTarget =
  | { kind: "store"; id: string; name: string }
  | { kind: "event"; id: string; name: string }
  | { kind: "activity"; name: string };

export function getAffectedDirectoryItems(
  target: DirectoryDeleteTarget,
  businesses: BusinessRecord[],
): string[] {
  if (target.kind === "activity") {
    const normalized = target.name.trim().toLowerCase();
    return businesses
      .filter((business) =>
        (business.activities ?? []).some(
          (activity) => activity.trim().toLowerCase() === normalized,
        ),
      )
      .map((business) => business.name);
  }

  return [];
}
