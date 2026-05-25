import { Briefcase, Monitor, Store, type LucideIcon } from "lucide-react";

export function getIconForBusinessType(type: string): LucideIcon {
  const normalized = type.trim().toLowerCase();

  if (normalized === "digital") return Monitor;
  if (normalized === "physical") return Store;
  if (normalized === "services") return Briefcase;

  return Store;
}
