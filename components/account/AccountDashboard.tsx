"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, ImagePlus, KeyRound, Search, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useMemo, useState, type ChangeEvent, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { extractCoordinatesFromMapsUrl } from "@/actions/extract-coordinates";
import { EventDateRangePicker } from "@/components/account/EventDateRangePicker";
import { MapsLocationInput } from "@/components/account/MapsLocationInput";
import { SafeDeleteModal } from "@/components/account/SafeDeleteModal";
import { GlobalFilter } from "@/components/shared/GlobalFilter";
import { CreatableCategorySelect, CreatableMultiCategorySelect } from "@/components/shared/CreatableCategorySelect";
import { filterDirectoryRowsBySearch } from "@/types/adminDirectoryQuery";
import { buildAdminDirectoryRows } from "@/types/globalDirectoryQuery";
import type { BusinessRecord } from "@/types/business";
import {
  EVENT_SUB_TYPES,
  MAIN_CATEGORIES,
  resolveBusinessMainCategory,
  type MainCategory,
} from "@/types/businessCategories";
import {
  getAffectedDirectoryItems,
  type DirectoryDeleteTarget,
} from "@/types/directoryDelete";
import type { EventRecord } from "@/types/event";
import {
  getDefaultGlobalFilter,
  resolveGlobalFilter,
  type CategoryRecord,
  type GlobalFilterState,
} from "@/types/taxonomy";
import type { CurrentUser } from "@/types/user";
import {
  getActivityLabel,
  getCatalogCategoryLabel,
  getEventSubTypeLabel,
  getMainCategoryLabel,
  type Translations,
} from "@/types/i18n";
import { parseManualCoordinates } from "@/utils/mapHelpers";
import { supabase } from "@/utils/supabase";
import { ui } from "@/utils/ui";

function createInviteKeyCode(): string {
  const segment = () =>
    crypto.randomUUID().replace(/-/g, "").slice(0, 4).toUpperCase();
  return `SK-${segment()}-${segment()}-${segment()}`;
}

const dashboardInputClassName = `${ui.input} disabled:opacity-50`;

const categoryToggleActiveClassName =
  "border-[#222222] bg-[#222222] text-white dark:border-white dark:bg-white dark:text-black";

const categoryToggleInactiveClassName =
  "border-[#222222]/20 bg-white text-[#222222] hover:bg-[#F9F9F9] dark:border-white/20 dark:bg-black dark:text-white dark:hover:bg-[#111111]";

const fieldLabelClassName =
  "mb-2 block font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/45 dark:text-white/45";

function formatDirectoryCategory(business: BusinessRecord, labels: Translations): string {
  return getCatalogCategoryLabel(resolveBusinessMainCategory(business), labels);
}

type AdminTab = "businesses" | "events";

interface ActivityCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}

function ActivityCheckbox({
  id,
  label,
  checked,
  disabled,
  onChange,
}: ActivityCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-[32px] px-1 py-2 has-disabled:cursor-not-allowed has-disabled:opacity-50"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[#222222] bg-white transition-colors peer-checked:border-[#222222] peer-checked:bg-[#222222] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#222222]/30 dark:border-white dark:bg-black dark:peer-checked:border-white dark:peer-checked:bg-white dark:peer-checked:text-black dark:peer-focus-visible:ring-white/30"
      >
        <Check
          size={14}
          strokeWidth={2.5}
          className={`text-current ${checked ? "opacity-100" : "opacity-0"}`}
        />
      </span>
      <span className="font-sans text-sm text-[#222222] dark:text-white">{label}</span>
    </label>
  );
}

interface AccountDashboardProps {
  user: CurrentUser;
  businesses: BusinessRecord[];
  events: EventRecord[];
  setEvents: Dispatch<SetStateAction<EventRecord[]>>;
  labels: Translations;
  onSignOut?: () => void;
  setBusinesses: Dispatch<SetStateAction<BusinessRecord[]>>;
  onBusinessDeleted?: (id: string) => void;
  newName: string;
  setNewName: (value: string) => void;
  newMainCategory: MainCategory;
  onMainCategoryChange: (category: MainCategory) => void;
  businessCategories: string[];
  setBusinessCategories: (value: string[]) => void;
  categories: CategoryRecord[];
  onCategoryCreated: (category: CategoryRecord) => void;
  newDescription: string;
  setNewDescription: (value: string) => void;
  hasPhysicalLocation: boolean;
  onHasPhysicalLocationChange: (value: boolean) => void;
  newGoogleMapsUrl: string;
  setNewGoogleMapsUrl: (value: string) => void;
  useManualBusinessCoordinates: boolean;
  onUseManualBusinessCoordinatesChange: (value: boolean) => void;
  manualBusinessLatitude: string;
  onManualBusinessLatitudeChange: (value: string) => void;
  manualBusinessLongitude: string;
  onManualBusinessLongitudeChange: (value: string) => void;
  newInstagramUrl: string;
  setNewInstagramUrl: (value: string) => void;
  newWhatsappNumber: string;
  setNewWhatsappNumber: (value: string) => void;
  newWebsiteUrl: string;
  setNewWebsiteUrl: (value: string) => void;
  logoPreviewUrl: string | null;
  isUploadingLogo: boolean;
  logoReady: boolean;
  onLogoSelect: (file: File) => void;
  isExtractingLocation: boolean;
  isSubmitting: boolean;
  publishError: string | null;
  submitSuccess: boolean;
  onAddBusiness: (e: FormEvent) => void;
  onEventsChanged?: () => void | Promise<void>;
  onDirectoryRefresh?: () => void | Promise<void>;
}

export function AccountDashboard({
  user,
  businesses,
  events,
  setEvents,
  labels,
  onSignOut,
  setBusinesses,
  onBusinessDeleted,
  newName,
  setNewName,
  newMainCategory,
  onMainCategoryChange,
  businessCategories,
  setBusinessCategories,
  categories,
  onCategoryCreated,
  newDescription,
  setNewDescription,
  hasPhysicalLocation,
  onHasPhysicalLocationChange,
  newGoogleMapsUrl,
  setNewGoogleMapsUrl,
  useManualBusinessCoordinates,
  onUseManualBusinessCoordinatesChange,
  manualBusinessLatitude,
  onManualBusinessLatitudeChange,
  manualBusinessLongitude,
  onManualBusinessLongitudeChange,
  newInstagramUrl,
  setNewInstagramUrl,
  newWhatsappNumber,
  setNewWhatsappNumber,
  newWebsiteUrl,
  setNewWebsiteUrl,
  logoPreviewUrl,
  isUploadingLogo,
  logoReady,
  onLogoSelect,
  isExtractingLocation,
  isSubmitting,
  publishError,
  submitSuccess,
  onAddBusiness,
  onEventsChanged,
  onDirectoryRefresh,
}: AccountDashboardProps) {
  const logoInputId = useId();
  const hasPhysicalLocationId = useId();
  const isPublishBusy = isExtractingLocation || isSubmitting || isUploadingLogo;

  const [inviteeEmail, setInviteeEmail] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [adminTab, setAdminTab] = useState<AdminTab>("businesses");
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState<string>(EVENT_SUB_TYPES[0]);
  const [eventDescription, setEventDescription] = useState("");
  const [eventGoogleMapsUrl, setEventGoogleMapsUrl] = useState("");
  const [useManualEventCoordinates, setUseManualEventCoordinates] = useState(false);
  const [manualEventLatitude, setManualEventLatitude] = useState("");
  const [manualEventLongitude, setManualEventLongitude] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventOpenTime, setEventOpenTime] = useState("");
  const [eventCloseTime, setEventCloseTime] = useState("");
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [isExtractingEventLocation, setIsExtractingEventLocation] = useState(false);
  const [eventPublishError, setEventPublishError] = useState<string | null>(null);
  const [eventSubmitSuccess, setEventSubmitSuccess] = useState(false);

  const [globalFilter, setGlobalFilter] = useState<GlobalFilterState>(getDefaultGlobalFilter());
  const [directorySearch, setDirectorySearch] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DirectoryDeleteTarget | null>(null);
  const [affectedItemsList, setAffectedItemsList] = useState<string[]>([]);

  useEffect(() => {
    void onDirectoryRefresh?.();
  }, [onDirectoryRefresh]);

  const directoryRows = useMemo(
    () => buildAdminDirectoryRows(businesses, events, globalFilter, labels),
    [businesses, events, globalFilter, labels],
  );

  const filteredDirectoryItems = useMemo(
    () => filterDirectoryRowsBySearch(directoryRows, directorySearch),
    [directoryRows, directorySearch],
  );

  const handleGlobalFilterChange = (
    sector: GlobalFilterState["sector"],
    contextTab: string,
    category: string,
  ) => {
    setGlobalFilter(resolveGlobalFilter(sector, contextTab, category));
  };

  const handleLogoInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onLogoSelect(file);
    event.target.value = "";
  };

  const handleGenerateKey = async () => {
    const normalizedEmail = inviteeEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setKeyError(labels.keyErrorInviteeRequired);
      return;
    }

    setIsGeneratingKey(true);
    setKeyError(null);
    setCopySuccess(false);
    setGeneratedKey(null);

    const keyCode = createInviteKeyCode();

    const { error } = await supabase.from("admin_access_keys").insert({
      key_code: keyCode,
      is_used: false,
      used_by_email: null,
      target_email: normalizedEmail,
    });

    setIsGeneratingKey(false);

    if (error) {
      console.error("generate invite key:", error);
      setKeyError(labels.keyErrorGenerateFailed);
      return;
    }

    setGeneratedKey(keyCode);
  };

  const handleCopyKey = async () => {
    if (!generatedKey) return;

    try {
      await navigator.clipboard.writeText(generatedKey);
      setCopySuccess(true);
    } catch {
      setKeyError(labels.keyErrorCopyFailed);
    }
  };

  const handleClearGeneratedKey = () => {
    setGeneratedKey(null);
    setCopySuccess(false);
    setKeyError(null);
  };

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
      onBusinessDeleted?.(itemToDelete.id);
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
      await onEventsChanged?.();
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

  const resetEventForm = () => {
    setEventName("");
    setEventType(EVENT_SUB_TYPES[0]);
    setEventDescription("");
    setEventGoogleMapsUrl("");
    setUseManualEventCoordinates(false);
    setManualEventLatitude("");
    setManualEventLongitude("");
    setEventStartDate("");
    setEventEndDate("");
    setEventOpenTime("");
    setEventCloseTime("");
    setEventPublishError(null);
  };

  const handleAddEvent = async (event: FormEvent) => {
    event.preventDefault();

    if (
      !eventName.trim() ||
      !eventDescription.trim() ||
      !eventStartDate ||
      !eventEndDate ||
      !eventOpenTime ||
      !eventCloseTime
    ) {
      return;
    }

    if (!useManualEventCoordinates && !eventGoogleMapsUrl.trim()) {
      return;
    }

    setEventPublishError(null);
    setEventSubmitSuccess(false);

    let latitude: number;
    let longitude: number;

    if (useManualEventCoordinates) {
      const manualCoords = parseManualCoordinates(manualEventLatitude, manualEventLongitude);
      if (!manualCoords) {
        setEventPublishError(labels.publishErrorMapsExtract);
        return;
      }
      latitude = manualCoords.latitude;
      longitude = manualCoords.longitude;
    } else {
      setIsExtractingEventLocation(true);

      const extraction = await extractCoordinatesFromMapsUrl(eventGoogleMapsUrl.trim());

      setIsExtractingEventLocation(false);

      if (!extraction.success) {
        setEventPublishError(extraction.error ?? labels.publishErrorMapsExtract);
        return;
      }

      latitude = extraction.latitude;
      longitude = extraction.longitude;
    }

    setIsSubmittingEvent(true);

    const { error } = await supabase.from("events").insert({
      name: eventName.trim(),
      description: eventDescription.trim(),
      event_type: eventType,
      category: eventType,
      google_maps_url: eventGoogleMapsUrl.trim() || null,
      latitude,
      longitude,
      start_date: eventStartDate,
      end_date: eventEndDate,
      open_time: eventOpenTime,
      close_time: eventCloseTime,
    });

    setIsSubmittingEvent(false);

    if (error) {
      console.error("Failed to add event:", error.message);
      setEventPublishError(error.message);
      return;
    }

    resetEventForm();
    setEventSubmitSuccess(true);
    await onEventsChanged?.();
    setTimeout(() => setEventSubmitSuccess(false), 3000);
  };

  const isEventBusy = isSubmittingEvent || isExtractingEventLocation;

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto pb-4 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
      {onSignOut && (
        <div className="flex items-center justify-between gap-4">
          <p className="truncate font-sans text-xs text-[#222222]/45 dark:text-white/45">{user.email}</p>
          <button
            type="button"
            onClick={onSignOut}
            className={`shrink-0 rounded-full px-5 py-2 font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/60 transition-colors hover:bg-[#222222] hover:text-white dark:text-white/60 dark:hover:bg-white dark:hover:text-black ${ui.iconButton}`}
          >
            {labels.signOut}
          </button>
        </div>
      )}

      <div className="rounded-[32px] border-2 border-[#222222] bg-white px-5 py-5 font-sans shadow-soft-airy dark:border-white dark:bg-black dark:shadow-none">
        <p className="font-sans text-[11px] font-bold uppercase leading-relaxed tracking-[0.12em] text-[#222222] dark:text-white">
          {labels.restrictedAccessBanner}
        </p>
      </div>

      <section className={`p-6 ${ui.card}`}>
        <div className="flex items-start gap-4 px-2">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F9F9F9] dark:bg-white/10">
            <ShieldCheck size={20} strokeWidth={1.5} className="text-[#222222]/70 dark:text-white/70" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-sans text-base font-semibold text-[#222222] dark:text-white">
              {labels.directoryManagement}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#222222]/55 dark:text-white/55">
              {labels.directoryManagementSubtitle}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/admin/directory"
                className="rounded-full border border-[#222222]/15 px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-wide text-[#222222] transition-colors hover:bg-[#F9F9F9] dark:border-white/10 dark:text-white dark:hover:bg-white/10"
              >
                {labels.directoryManagement}
              </Link>
              <Link
                href="/admin/categories"
                className="rounded-full border border-[#222222]/15 px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-wide text-[#222222] transition-colors hover:bg-[#F9F9F9] dark:border-white/10 dark:text-white dark:hover:bg-white/10"
              >
                {labels.manageCategories}
              </Link>
            </div>
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
          <GlobalFilter
            labels={labels}
            categories={categories}
            activeSector={globalFilter.sector}
            activeContextTab={globalFilter.contextTab}
            activeCategory={globalFilter.category}
            onFilterChange={handleGlobalFilterChange}
            layout="stacked"
            layoutIdPrefix="account-directory"
          />
        </div>

        <div className="mt-4 max-h-72 overflow-y-auto rounded-[32px] bg-white [-ms-overflow-style:none] scrollbar-none dark:border dark:border-white/10 dark:bg-black [&::-webkit-scrollbar]:hidden">
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
                          {item.name}
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

      <div className={`flex gap-2 p-1.5 ${ui.card}`}>
        {(["businesses", "events"] as const).map((tab) => {
          const isActive = adminTab === tab;
          const label = tab === "businesses" ? labels.manageBusinesses : labels.manageEvents;

          return (
            <button
              key={tab}
              type="button"
              aria-pressed={isActive}
              onClick={() => setAdminTab(tab)}
              className={`flex-1 rounded-[32px] py-3 font-sans text-xs font-medium uppercase tracking-wide transition-colors ${
                isActive ? categoryToggleActiveClassName : categoryToggleInactiveClassName
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {adminTab === "businesses" && (
        <>
      <section className={`p-8 ${ui.card}`}>
        <h2 className="font-sans text-base font-semibold text-[#222222] dark:text-white">
          {labels.addBusiness}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#222222]/55 dark:text-white/55">
          {labels.addBusinessSubtitle}
        </p>

        <form onSubmit={onAddBusiness} className="mt-6 flex flex-col gap-4">
          <div className="block">
            <span className={fieldLabelClassName}>{labels.businessLogo}</span>
            <input
              id={logoInputId}
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={isPublishBusy}
              onChange={handleLogoInputChange}
            />
            <label
              htmlFor={logoInputId}
              className={`flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-[32px] border border-[#222222] bg-white px-6 py-8 text-center shadow-soft-airy transition-colors hover:bg-[#F9F9F9] has-disabled:cursor-not-allowed has-disabled:opacity-50 dark:border-white/10 dark:bg-black dark:text-white dark:shadow-none dark:hover:bg-[#111111]`}
            >
              {logoPreviewUrl ? (
                <img
                  src={logoPreviewUrl}
                  alt=""
                  className="h-20 w-20 rounded-[24px] border border-[#222222]/10 object-cover dark:border-white/10"
                />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-[24px] bg-[#F9F9F9] dark:bg-white/10">
                  <ImagePlus
                    size={24}
                    strokeWidth={1.5}
                    className="text-[#222222]/70 dark:text-white/70"
                    aria-hidden
                  />
                </span>
              )}
              <span className="font-sans text-sm font-medium text-[#222222] dark:text-white">
                {isUploadingLogo
                  ? labels.uploadingLogo
                  : logoReady
                    ? labels.logoReady
                    : labels.uploadLogoHint}
              </span>
            </label>
          </div>

          <label className="block">
            <span className={fieldLabelClassName}>{labels.businessName}</span>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={labels.businessNamePlaceholder}
              required
              disabled={isPublishBusy}
              className={dashboardInputClassName}
            />
          </label>

          <label className="block">
            <span className={fieldLabelClassName}>{labels.description}</span>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder={labels.descriptionPlaceholder}
              required
              rows={3}
              disabled={isPublishBusy}
              className={`${dashboardInputClassName} min-h-[96px] resize-none`}
            />
          </label>

          <fieldset className="block border-0 p-0">
            <legend className={fieldLabelClassName}>{labels.primaryCategory}</legend>
            <div className="flex gap-3">
              {MAIN_CATEGORIES.map((category) => {
                const isSelected = newMainCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={isSelected}
                    disabled={isPublishBusy}
                    onClick={() => onMainCategoryChange(category)}
                    className={`flex-1 rounded-[32px] border py-4 font-sans text-sm font-medium uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      isSelected ? categoryToggleActiveClassName : categoryToggleInactiveClassName
                    }`}
                  >
                    {getMainCategoryLabel(category, labels)}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <CreatableMultiCategorySelect
            sector={newMainCategory}
            categories={categories}
            values={businessCategories}
            onChange={setBusinessCategories}
            onCategoryCreated={onCategoryCreated}
            labels={labels}
            disabled={isPublishBusy}
            fieldLabel={labels.activities}
            getOptionLabel={(name) => getActivityLabel(name, labels)}
          />

          <ActivityCheckbox
            id={hasPhysicalLocationId}
            label={labels.hasPhysicalLocation}
            checked={hasPhysicalLocation}
            disabled={isPublishBusy}
            onChange={() => onHasPhysicalLocationChange(!hasPhysicalLocation)}
          />

          {!hasPhysicalLocation && (
            <p className="font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/55 dark:text-white/55">
              {labels.onlineOnly}
            </p>
          )}

          {hasPhysicalLocation && (
            <MapsLocationInput
              url={newGoogleMapsUrl}
              onUrlChange={setNewGoogleMapsUrl}
              useManualCoordinates={useManualBusinessCoordinates}
              onUseManualCoordinatesChange={onUseManualBusinessCoordinatesChange}
              manualLatitude={manualBusinessLatitude}
              onManualLatitudeChange={onManualBusinessLatitudeChange}
              manualLongitude={manualBusinessLongitude}
              onManualLongitudeChange={onManualBusinessLongitudeChange}
              disabled={isPublishBusy}
              inputClassName={dashboardInputClassName}
              labelClassName={fieldLabelClassName}
              labels={{
                googleMapsLink: labels.googleMapsLink,
                enterCoordinatesManually: labels.enterCoordinatesManually,
                latitude: labels.latitude,
                latitudePlaceholder: labels.latitudePlaceholder,
                longitude: labels.longitude,
                longitudePlaceholder: labels.longitudePlaceholder,
                shortMapsUrlWarning: labels.shortMapsUrlWarning,
              }}
            />
          )}

          <label className="block">
            <span className={fieldLabelClassName}>
              {hasPhysicalLocation ? labels.websiteUrl : labels.websiteUrlOnlineRequired}
            </span>
            <input
              type="url"
              value={newWebsiteUrl}
              onChange={(e) => setNewWebsiteUrl(e.target.value)}
              placeholder="https://yourbusiness.com"
              required={!hasPhysicalLocation && !newInstagramUrl.trim()}
              disabled={isPublishBusy}
              className={dashboardInputClassName}
            />
            {!hasPhysicalLocation && (
              <p className="mt-2 font-sans text-xs text-[#222222]/45 dark:text-white/45">
                {labels.onlineOnlyHint}
              </p>
            )}
          </label>

          <label className="block">
            <span className={fieldLabelClassName}>
              {hasPhysicalLocation ? labels.instagramUrl : labels.instagramUrlOnlineRequired}
            </span>
            <input
              type="url"
              value={newInstagramUrl}
              onChange={(e) => setNewInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/…"
              required={!hasPhysicalLocation && !newWebsiteUrl.trim()}
              disabled={isPublishBusy}
              className={dashboardInputClassName}
            />
          </label>

          <label className="block">
            <span className={fieldLabelClassName}>{labels.whatsappNumber}</span>
            <input
              type="tel"
              value={newWhatsappNumber}
              onChange={(e) => setNewWhatsappNumber(e.target.value)}
              placeholder={labels.placeholderWhatsapp}
              disabled={isPublishBusy}
              className={dashboardInputClassName}
            />
          </label>

          {publishError && (
            <p className="rounded-[32px] px-4 py-3 text-center text-sm font-semibold text-[#222222] dark:border dark:border-white/10 dark:bg-black dark:text-white">
              {publishError}
            </p>
          )}

          <button
            type="submit"
            disabled={isPublishBusy}
            className="mt-2 w-full rounded-full bg-[#222222] py-3.5 font-sans text-xs font-medium uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {isUploadingLogo
              ? labels.uploadingLogo
              : isExtractingLocation
                ? labels.extractingLocation
                : isSubmitting
                  ? labels.publishing
                  : labels.publishBusiness}
          </button>
        </form>

        <AnimatePresence>
          {submitSuccess && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mt-4 text-center font-sans text-sm text-[#222222]/70 dark:text-white/70"
            >
              {labels.businessPublished}
            </motion.p>
          )}
        </AnimatePresence>
      </section>
        </>
      )}

      {adminTab === "events" && (
        <section className={`p-8 ${ui.card}`}>
          <h2 className="font-sans text-base font-semibold text-[#222222] dark:text-white">
            {labels.addEvent}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#222222]/55 dark:text-white/55">
            {labels.addEventSubtitle}
          </p>

          <form onSubmit={handleAddEvent} className="mt-6 flex flex-col gap-4">
            <label className="block">
              <span className={fieldLabelClassName}>{labels.eventName}</span>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
                disabled={isEventBusy}
                className={dashboardInputClassName}
              />
            </label>

            <CreatableCategorySelect
              sector="Events"
              categories={categories}
              value={eventType}
              onChange={setEventType}
              onCategoryCreated={onCategoryCreated}
              labels={labels}
              disabled={isEventBusy}
              fieldLabel={labels.eventType}
              getOptionLabel={(name) => getEventSubTypeLabel(name, labels)}
            />

            <label className="block">
              <span className={fieldLabelClassName}>{labels.description}</span>
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder={labels.descriptionPlaceholder}
                required
                rows={3}
                disabled={isEventBusy}
                className={`${dashboardInputClassName} min-h-[96px] resize-none`}
              />
            </label>

            <MapsLocationInput
              url={eventGoogleMapsUrl}
              onUrlChange={setEventGoogleMapsUrl}
              useManualCoordinates={useManualEventCoordinates}
              onUseManualCoordinatesChange={setUseManualEventCoordinates}
              manualLatitude={manualEventLatitude}
              onManualLatitudeChange={setManualEventLatitude}
              manualLongitude={manualEventLongitude}
              onManualLongitudeChange={setManualEventLongitude}
              disabled={isEventBusy}
              inputClassName={dashboardInputClassName}
              labelClassName={fieldLabelClassName}
              labels={{
                googleMapsLink: labels.googleMapsLink,
                enterCoordinatesManually: labels.enterCoordinatesManually,
                latitude: labels.latitude,
                latitudePlaceholder: labels.latitudePlaceholder,
                longitude: labels.longitude,
                longitudePlaceholder: labels.longitudePlaceholder,
                shortMapsUrlWarning: labels.shortMapsUrlWarning,
              }}
            />

            <EventDateRangePicker
              startDate={eventStartDate}
              endDate={eventEndDate}
              onStartDateChange={setEventStartDate}
              onEndDateChange={setEventEndDate}
              disabled={isEventBusy}
              inputClassName={dashboardInputClassName}
              labelClassName={fieldLabelClassName}
              labels={{
                startDate: labels.startDate,
                endDate: labels.endDate,
                day: labels.dateDay,
                month: labels.dateMonth,
                year: labels.dateYear,
              }}
            />

            <label className="block">
              <span className={fieldLabelClassName}>{labels.openTime}</span>
              <input
                type="time"
                value={eventOpenTime}
                onChange={(e) => setEventOpenTime(e.target.value)}
                required
                disabled={isEventBusy}
                className={dashboardInputClassName}
              />
            </label>

            <label className="block">
              <span className={fieldLabelClassName}>{labels.closeTime}</span>
              <input
                type="time"
                value={eventCloseTime}
                onChange={(e) => setEventCloseTime(e.target.value)}
                required
                disabled={isEventBusy}
                className={dashboardInputClassName}
              />
            </label>

            {eventPublishError && (
              <p className="rounded-[32px] px-4 py-3 text-center text-sm font-semibold text-[#222222] dark:border dark:border-white/10 dark:bg-black dark:text-white">
                {eventPublishError}
              </p>
            )}

            <button
              type="submit"
              disabled={isEventBusy}
              className="mt-2 w-full rounded-full bg-[#222222] py-3.5 font-sans text-xs font-medium uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {isExtractingEventLocation
                ? labels.extractingLocation
                : isSubmittingEvent
                  ? labels.publishing
                  : labels.publishEvent}
            </button>
          </form>

          <AnimatePresence>
            {eventSubmitSuccess && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="mt-4 text-center font-sans text-sm text-[#222222]/70 dark:text-white/70"
              >
                {labels.eventPublished}
              </motion.p>
            )}
          </AnimatePresence>
        </section>
      )}

      <section className={`p-6 ${ui.card}`}>
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F9F9F9] dark:bg-white/10">
            <KeyRound size={20} strokeWidth={1.5} className="text-[#222222]/70 dark:text-white/70" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-sans text-base font-semibold text-[#222222] dark:text-white">
              {labels.generateInviteKey}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#222222]/55 dark:text-white/55">
              {labels.generateInviteKeySubtitle}
            </p>
          </div>
        </div>

        <label className="mt-5 block">
          <span className={fieldLabelClassName}>{labels.inviteeEmail}</span>
          <input
            type="email"
            value={inviteeEmail}
            onChange={(e) => setInviteeEmail(e.target.value)}
            placeholder={labels.inviteeEmailPlaceholder}
            required
            disabled={isGeneratingKey}
            autoComplete="email"
            className={dashboardInputClassName}
          />
        </label>

        <button
          type="button"
          onClick={handleGenerateKey}
          disabled={isGeneratingKey || !inviteeEmail.trim()}
          className="mt-4 w-full rounded-[32px] bg-[#222222] py-4 font-sans text-xs font-medium uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {isGeneratingKey ? labels.generatingKey : labels.generateKey}
        </button>

        {keyError && (
          <p className="mt-4 rounded-[32px] px-4 py-3 text-center text-sm font-semibold text-[#222222] dark:border dark:border-white/10 dark:bg-black dark:text-white">
            {keyError}
          </p>
        )}

        {generatedKey && (
          <div className="mt-5 rounded-[32px] bg-white px-5 py-5 shadow-soft-airy dark:border dark:border-white/10 dark:bg-black dark:text-white dark:shadow-none">
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-[#222222] dark:text-white">
              {labels.generatedInviteKeyTitle}
            </p>
            {inviteeEmail.trim() && (
              <p className="mt-2 truncate font-sans text-xs font-medium text-[#222222]/55 dark:text-white/55">
                {labels.boundToEmail} {inviteeEmail.trim().toLowerCase()}
              </p>
            )}
            <p className="mt-4 break-all text-center font-mono text-lg font-bold uppercase tracking-[0.2em] text-[#222222] dark:text-white">
              {generatedKey}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCopyKey}
                className="flex flex-1 items-center justify-center gap-2 rounded-[32px] bg-[#222222] py-3.5 font-sans text-xs font-medium uppercase tracking-wide text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
              >
                <Copy size={14} strokeWidth={1.75} aria-hidden />
                {copySuccess ? labels.copied : labels.copyToClipboard}
              </button>
              <button
                type="button"
                onClick={handleClearGeneratedKey}
                className="flex flex-1 items-center justify-center gap-2 rounded-[32px] border border-[#222222]/15 bg-white py-3.5 font-sans text-xs font-medium uppercase tracking-wide text-[#222222] transition-colors hover:bg-[#F9F9F9] dark:border-white/10 dark:bg-black dark:text-white dark:hover:bg-[#111111]"
              >
                <X size={14} strokeWidth={1.75} aria-hidden />
                {labels.clear}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
