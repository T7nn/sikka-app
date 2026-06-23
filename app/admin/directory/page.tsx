"use client";

import { Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DirectoryFilter, type DirectoryFilterChange } from "@/components/admin/DirectoryFilter";
import { SafeDeleteModal } from "@/components/account/SafeDeleteModal";
import { normalizeBusiness, type BusinessRecord } from "@/types/business";
import { resolveBusinessMainCategory } from "@/types/businessCategories";
import {
  DIRECTORY_SUBTYPE_ALL,
  filterDirectoryList,
  getDefaultEntityForPrimary,
  type DirectoryEntityType,
  type DirectoryPrimaryFilter,
} from "@/types/adminDirectoryFilters";
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

export default function AdminDirectoryPage() {
  const [language] = useState<Language>("en");
  const labels = translations[language];

  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [directorySearch, setDirectorySearch] = useState("");

  const [mainCategory, setMainCategory] = useState<DirectoryPrimaryFilter>("Food");
  const [entityType, setEntityType] = useState<DirectoryEntityType>("Store");
  const [subCategory, setSubCategory] = useState(DIRECTORY_SUBTYPE_ALL);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DirectoryDeleteTarget | null>(null);
  const [affectedItemsList, setAffectedItemsList] = useState<string[]>([]);

  const fetchBusinesses = useCallback(async () => {
    const { data, error } = await supabase.from("businesses").select("*");
    if (error) {
      console.error("Failed to fetch businesses:", error.message);
      return;
    }

    const normalized = (data ?? [])
      .map((row) => normalizeBusiness(row as Record<string, unknown>))
      .filter((business): business is BusinessRecord => business !== null);

    setBusinesses(normalized);
  }, []);

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase.from("events").select("*");
    if (error) {
      console.error("Failed to fetch events:", error.message);
      return;
    }

    const normalized = (data ?? [])
      .map((row) => normalizeEvent(row as Record<string, unknown>))
      .filter((event): event is EventRecord => event !== null);

    setEvents(normalized);
  }, []);

  const refreshDirectoryData = useCallback(async () => {
    await Promise.all([fetchBusinesses(), fetchEvents()]);
  }, [fetchBusinesses, fetchEvents]);

  useEffect(() => {
    void refreshDirectoryData();
  }, [refreshDirectoryData]);

  const handleFilterChange = ({
    mainCategory: nextMain,
    subCategory: nextSub,
    entityType: nextEntity,
  }: DirectoryFilterChange) => {
    setMainCategory(nextMain);
    setSubCategory(nextSub);
    setEntityType(nextEntity);
  };

  const filteredDirectoryItems = useMemo(
    () =>
      filterDirectoryList(
        businesses,
        events,
        mainCategory,
        entityType,
        subCategory,
        directorySearch,
      ),
    [businesses, events, mainCategory, entityType, subCategory, directorySearch],
  );

  const openDeleteModal = (target: DirectoryDeleteTarget) => {
    setItemToDelete(target);
    setAffectedItemsList(getAffectedDirectoryItems(target, businesses));
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
      setBusinesses((previous) => previous.filter((business) => business.id !== itemToDelete.id));
      return;
    }

    if (itemToDelete.kind === "event") {
      const { error } = await supabase.from("events").delete().eq("id", itemToDelete.id);
      if (error) {
        console.error("Failed to delete event:", error.message);
        alert("Failed to delete: " + error.message);
        return;
      }
      setEvents((previous) => previous.filter((event) => event.id !== itemToDelete.id));
      return;
    }

    const normalizedActivity = itemToDelete.name.trim().toLowerCase();
    const affected = businesses.filter((business) =>
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

    setBusinesses((previous) =>
      previous.map((business) => ({
        ...business,
        activities: (business.activities ?? []).filter(
          (activity) => activity.trim().toLowerCase() !== normalizedActivity,
        ),
      })),
    );
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col bg-white px-6 py-8 dark:bg-black">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/55 transition-colors hover:text-[#222222] dark:text-white/55 dark:hover:text-white"
        >
          ← {labels.home}
        </Link>
      </div>

      <section className={`p-6 ${ui.card}`}>
        <div className="flex items-start gap-4 px-2">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F9F9F9] dark:bg-white/10">
            <ShieldCheck size={20} strokeWidth={1.5} className="text-[#222222]/70 dark:text-white/70" />
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

        <div className="mt-5">
          <DirectoryFilter
            businesses={businesses}
            labels={labels}
            mainCategory={mainCategory}
            entityType={entityType}
            subCategory={subCategory}
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className="mt-4 max-h-[28rem] overflow-y-auto rounded-[32px] bg-white [-ms-overflow-style:none] scrollbar-none dark:border dark:border-white/10 dark:bg-black [&::-webkit-scrollbar]:hidden">
          {filteredDirectoryItems.length === 0 ? (
            <p className="px-5 py-8 text-center font-sans text-sm text-[#222222]/45 dark:text-white/45">
              {directorySearch.trim() ? labels.directoryNoResults : labels.directoryEmpty}
            </p>
          ) : (
            <ul className="divide-y divide-[#222222]/10 dark:divide-white/10">
              {filteredDirectoryItems.map((item) => {
                if (item.kind === "store") {
                  const business = item.business;
                  return (
                    <li
                      key={business.id}
                      className="flex items-center gap-3 bg-white px-4 py-3.5 dark:bg-black"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-sans text-sm font-medium text-[#222222] dark:text-white">
                          {business.name}
                        </p>
                        <p className="mt-1 truncate font-sans text-xs text-[#222222]/55 dark:text-white/55">
                          {business.description}
                        </p>
                        <span className="mt-1 inline-block rounded-full bg-[#F9F9F9] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#222222]/60 dark:bg-white/10 dark:text-white/60">
                          {formatDirectoryCategory(business, labels)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          openDeleteModal({ kind: "store", id: business.id, name: business.name })
                        }
                        className="shrink-0 font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/40 transition-colors hover:text-red-500 dark:text-white/40 dark:hover:text-red-400"
                      >
                        {labels.remove}
                      </button>
                    </li>
                  );
                }

                if (item.kind === "activity") {
                  return (
                    <li
                      key={`activity-${item.name}`}
                      className="flex items-center gap-3 bg-white px-4 py-3.5 dark:bg-black"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-sans text-sm font-medium text-[#222222] dark:text-white">
                          {getActivityLabel(item.name, labels)}
                        </p>
                        <span className="mt-1 inline-block rounded-full bg-[#F9F9F9] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#222222]/60 dark:bg-white/10 dark:text-white/60">
                          {labels.activityTag}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openDeleteModal({ kind: "activity", name: item.name })}
                        className="shrink-0 font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/40 transition-colors hover:text-red-500 dark:text-white/40 dark:hover:text-red-400"
                      >
                        {labels.remove}
                      </button>
                    </li>
                  );
                }

                const event = item.event;
                return (
                  <li
                    key={`event-${event.id}`}
                    className="flex items-center gap-3 bg-white px-4 py-3.5 dark:bg-black"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-sans text-sm font-medium text-[#222222] dark:text-white">
                        {event.name}
                      </p>
                      <p className="mt-1 font-sans text-xs text-[#222222]/55 dark:text-white/55">
                        {labels.eventDates}: {event.start_date} – {event.end_date}
                      </p>
                      <p className="mt-0.5 font-sans text-xs text-[#222222]/55 dark:text-white/55">
                        {labels.operatingHours}: {event.open_time} – {event.close_time}
                      </p>
                      {event.event_type && (
                        <span className="mt-1 inline-block rounded-full bg-[#F9F9F9] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#222222]/60 dark:bg-white/10 dark:text-white/60">
                          {getEventSubTypeLabel(event.event_type, labels)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        openDeleteModal({
                          kind: "event",
                          id: event.id,
                          name: event.name,
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
