"use client";

import { Loader2, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DirectoryFilter } from "@/components/admin/DirectoryFilter";
import { SafeDeleteModal } from "@/components/account/SafeDeleteModal";
import { normalizeBusiness, type BusinessRecord } from "@/types/business";
import { resolveBusinessMainCategory } from "@/types/businessCategories";
import {
  DIRECTORY_ALL_CATEGORY,
  DIRECTORY_ALL_TYPES,
  filterDirectoryRowsBySearch,
  type AdminDirectoryRow,
  type DirectorySector,
} from "@/types/adminDirectoryQuery";
import { getAffectedDirectoryItems, type DirectoryDeleteTarget } from "@/types/directoryDelete";
import { normalizeEvent, type EventRecord } from "@/types/event";
import {
  getActivityLabel,
  getCatalogCategoryLabel,
  getEventSubTypeLabel,
  translations,
  type Language,
  type Translations,
} from "@/types/i18n";
import { supabase } from "@/utils/supabase";
import { ui } from "@/utils/ui";

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
  sector: DirectorySector,
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

async function fetchEventsDirectory(
  activeType: string,
  activeCategory: string,
): Promise<AdminDirectoryRow[]> {
  let query = supabase.from("events").select("*");

  if (activeType !== DIRECTORY_ALL_TYPES) {
    query = query.eq("event_type", activeType);
  }

  if (activeCategory !== DIRECTORY_ALL_CATEGORY) {
    query = query.eq("category", activeCategory);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch events:", error.message);

    const { data: fallbackData, error: fallbackError } = await supabase
      .from("events")
      .select("*");

    if (fallbackError) {
      console.error("Failed to fetch events fallback:", fallbackError.message);
      return [];
    }

    let events = (fallbackData ?? [])
      .map((row) => normalizeEvent(row as Record<string, unknown>))
      .filter((event): event is EventRecord => event !== null);

    if (activeType !== DIRECTORY_ALL_TYPES) {
      events = events.filter((event) => event.event_type === activeType);
    }

    if (activeCategory !== DIRECTORY_ALL_CATEGORY) {
      events = events.filter(
        (event) =>
          event.category === activeCategory ||
          event.event_type === activeCategory ||
          `${event.name} ${event.description}`.toLowerCase().includes(activeCategory.toLowerCase()),
      );
    }

    return eventRowsFromRecords(events);
  }

  const events = (data ?? [])
    .map((row) => normalizeEvent(row as Record<string, unknown>))
    .filter((event): event is EventRecord => event !== null);

  return eventRowsFromRecords(events);
}

async function fetchBusinessDirectory(
  sector: DirectorySector,
  activeType: string,
  activeCategory: string,
  labels: Translations,
): Promise<AdminDirectoryRow[]> {
  let query = supabase.from("businesses").select("*").eq("main_category", sector);

  if (activeCategory !== DIRECTORY_ALL_CATEGORY) {
    query = query.contains("activities", [activeCategory]);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch businesses:", error.message);
    return [];
  }

  const businesses = (data ?? [])
    .map((row) => normalizeBusiness(row as Record<string, unknown>))
    .filter((business): business is BusinessRecord => business !== null);

  if (activeType === "Activities") {
    return activityRowsFromBusinesses(businesses, sector);
  }

  if (activeType === "Stores") {
    return businessRowsFromRecords(businesses, labels);
  }

  const storeRows = businessRowsFromRecords(businesses, labels);
  const activityRows = activityRowsFromBusinesses(businesses, sector);
  return [...storeRows, ...activityRows];
}

export default function AdminDirectoryPage() {
  const [language] = useState<Language>("en");
  const labels = translations[language];

  const [activeSector, setActiveSector] = useState<DirectorySector>("Food");
  const [activeType, setActiveType] = useState(DIRECTORY_ALL_TYPES);
  const [activeCategory, setActiveCategory] = useState(DIRECTORY_ALL_CATEGORY);

  const [directorySearch, setDirectorySearch] = useState("");
  const [directoryRows, setDirectoryRows] = useState<AdminDirectoryRow[]>([]);
  const [businessesCache, setBusinessesCache] = useState<BusinessRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DirectoryDeleteTarget | null>(null);
  const [affectedItemsList, setAffectedItemsList] = useState<string[]>([]);

  const loadDirectory = useCallback(async () => {
    setIsLoading(true);

    try {
      if (activeSector === "Events") {
        const rows = await fetchEventsDirectory(activeType, activeCategory);
        setDirectoryRows(rows);
        return;
      }

      const rows = await fetchBusinessDirectory(
        activeSector,
        activeType,
        activeCategory,
        labels,
      );
      setDirectoryRows(rows);

      const { data } = await supabase.from("businesses").select("*");
      const businesses = (data ?? [])
        .map((row) => normalizeBusiness(row as Record<string, unknown>))
        .filter((business): business is BusinessRecord => business !== null);
      setBusinessesCache(businesses);
    } finally {
      setIsLoading(false);
    }
  }, [activeSector, activeType, activeCategory, labels]);

  useEffect(() => {
    void loadDirectory();
  }, [loadDirectory]);

  const handleFilterChange = (
    sector: DirectorySector,
    type: string,
    category: string,
  ) => {
    setActiveSector(sector);
    setActiveType(type);
    setActiveCategory(category);
  };

  const visibleRows = useMemo(
    () => filterDirectoryRowsBySearch(directoryRows, directorySearch),
    [directoryRows, directorySearch],
  );

  const openDeleteModal = (target: DirectoryDeleteTarget) => {
    setItemToDelete(target);
    setAffectedItemsList(getAffectedDirectoryItems(target, businessesCache));
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    setAffectedItemsList([]);
  };

  const executePermanentDelete = async () => {
    if (!itemToDelete) return;

    if (itemToDelete.kind === "store") {
      const { error } = await supabase.from("businesses").delete().eq("id", itemToDelete.id);
      if (error) {
        console.error("Failed to delete business:", error.message);
        alert("Failed to delete: " + error.message);
        return;
      }
    } else if (itemToDelete.kind === "event") {
      const { error } = await supabase.from("events").delete().eq("id", itemToDelete.id);
      if (error) {
        console.error("Failed to delete event:", error.message);
        alert("Failed to delete: " + error.message);
        return;
      }
    } else {
      const normalizedActivity = itemToDelete.name.trim().toLowerCase();
      const affected = businessesCache.filter((business) =>
        (business.activities ?? []).some(
          (activity) => activity.trim().toLowerCase() === normalizedActivity,
        ),
      );

      for (const business of affected) {
        const nextActivities = (business.activities ?? []).filter(
          (activity) => activity.trim().toLowerCase() !== normalizedActivity,
        );

        const { error } = await supabase
          .from("businesses")
          .update({ activities: nextActivities })
          .eq("id", business.id);

        if (error) {
          console.error("Failed to remove activity:", error.message);
          alert("Failed to delete: " + error.message);
          return;
        }
      }
    }

    closeDeleteModal();
    await loadDirectory();
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col overflow-x-hidden bg-white px-6 py-8 dark:bg-black">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/55 transition-colors hover:text-[#222222] dark:text-white/55 dark:hover:text-white"
        >
          ← {labels.home}
        </Link>
      </div>

      <section className={`relative p-6 ${ui.card}`}>
        <div className="flex items-start gap-4 px-2">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F9F9F9] dark:bg-white/10">
            <ShieldCheck size={20} strokeWidth={1.75} className="text-[#222222]/70 dark:text-white/70" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-sans text-base font-semibold text-[#222222] dark:text-white">
              {labels.directoryManagement}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#222222]/55 dark:text-white/55">
              {labels.directoryManagementSubtitle}
            </p>
          </div>
        </div>

        <div className="relative mt-5">
          <Search
            size={18}
            strokeWidth={1.75}
            className="pointer-events-none absolute inset-s-5 top-1/2 -translate-y-1/2 text-[#222222]/40 dark:text-white/40"
            aria-hidden
          />
          <input
            type="search"
            value={directorySearch}
            onChange={(event) => setDirectorySearch(event.target.value)}
            placeholder={labels.directorySearchPlaceholder}
            className={`w-full rounded-full py-4 ps-12 pe-6 font-sans text-sm font-medium ${ui.input}`}
            aria-label={labels.directorySearchPlaceholder}
          />
        </div>

        <div className="relative z-20 mt-5">
          <DirectoryFilter
            labels={labels}
            activeSector={activeSector}
            activeType={activeType}
            activeCategory={activeCategory}
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className="relative z-10 mt-4 max-h-[28rem] min-h-[12rem] overflow-y-auto rounded-[32px] bg-white [-ms-overflow-style:none] scrollbar-none dark:border dark:border-white/10 dark:bg-black [&::-webkit-scrollbar]:hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-16">
              <Loader2
                size={28}
                strokeWidth={1.75}
                className="animate-spin text-[#222222]/40 dark:text-white/40"
                aria-hidden
              />
              <p className="font-sans text-sm text-[#222222]/45 dark:text-white/45">
                {labels.directoryLoading}
              </p>
            </div>
          ) : visibleRows.length === 0 ? (
            <p className="px-5 py-8 text-center font-sans text-sm text-[#222222]/45 dark:text-white/45">
              {directorySearch.trim() ? labels.directoryNoResults : labels.directoryEmpty}
            </p>
          ) : (
            <ul className="divide-y divide-[#222222]/10 dark:divide-white/10">
              {visibleRows.map((row) => {
                if (row.kind === "store") {
                  return (
                    <li
                      key={`store-${row.id}`}
                      className="flex items-center gap-3 bg-white px-4 py-3.5 dark:bg-black"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-sans text-sm font-medium text-[#222222] dark:text-white">
                          {row.name}
                        </p>
                        <p className="mt-1 truncate font-sans text-xs text-[#222222]/55 dark:text-white/55">
                          {row.description}
                        </p>
                        <span className="mt-1 inline-block rounded-full bg-[#F9F9F9] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#222222]/60 dark:bg-white/10 dark:text-white/60">
                          {row.sectorLabel}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          openDeleteModal({ kind: "store", id: row.id, name: row.name })
                        }
                        className="shrink-0 font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/40 transition-colors hover:text-red-500 dark:text-white/40 dark:hover:text-red-400"
                      >
                        {labels.remove}
                      </button>
                    </li>
                  );
                }

                if (row.kind === "activity") {
                  return (
                    <li
                      key={`activity-${row.name}`}
                      className="flex items-center gap-3 bg-white px-4 py-3.5 dark:bg-black"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-sans text-sm font-medium text-[#222222] dark:text-white">
                          {getActivityLabel(row.name, labels)}
                        </p>
                        <span className="mt-1 inline-block rounded-full bg-[#F9F9F9] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#222222]/60 dark:bg-white/10 dark:text-white/60">
                          {labels.activityTag}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openDeleteModal({ kind: "activity", name: row.name })}
                        className="shrink-0 font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/40 transition-colors hover:text-red-500 dark:text-white/40 dark:hover:text-red-400"
                      >
                        {labels.remove}
                      </button>
                    </li>
                  );
                }

                return (
                  <li
                    key={`event-${row.id}`}
                    className="flex items-center gap-3 bg-white px-4 py-3.5 dark:bg-black"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-sans text-sm font-medium text-[#222222] dark:text-white">
                        {row.name}
                      </p>
                      <p className="mt-1 font-sans text-xs text-[#222222]/55 dark:text-white/55">
                        {labels.eventDates}: {row.startDate} – {row.endDate}
                      </p>
                      <p className="mt-0.5 font-sans text-xs text-[#222222]/55 dark:text-white/55">
                        {labels.operatingHours}: {row.openTime} – {row.closeTime}
                      </p>
                      {row.eventType && (
                        <span className="mt-1 inline-block rounded-full bg-[#F9F9F9] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#222222]/60 dark:bg-white/10 dark:text-white/60">
                          {getEventSubTypeLabel(row.eventType, labels)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        openDeleteModal({
                          kind: "event",
                          id: row.id,
                          name: row.name,
                        })
                      }
                      className="shrink-0 font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/40 transition-colors hover:text-red-500 dark:text-white/40 dark:hover:text-red-400"
                    >
                      {labels.remove}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <SafeDeleteModal
        isOpen={isDeleteModalOpen}
        itemName={itemToDelete?.name ?? ""}
        affectedItems={affectedItemsList}
        onClose={closeDeleteModal}
        onConfirm={executePermanentDelete}
        labels={{
          cancel: labels.cancel,
          deleteWarningPrefix: labels.deleteWarningAffected,
          confirmDeletionCountdown: (seconds) =>
            labels.confirmDeletionCountdown.replace("{seconds}", String(seconds)),
          permanentlyDeleteItem: labels.permanentlyDeleteItem,
        }}
      />
    </div>
  );
}
