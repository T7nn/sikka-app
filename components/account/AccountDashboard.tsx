"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  ImagePlus,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Trash2,
  UserPen,
  type LucideIcon,
} from "lucide-react";
import type { BusinessType } from "@/types/businessForm";
import type { BusinessRecord } from "@/types/business";
import type { CurrentUser, UserRole } from "@/types/user";
import { USER_ROLES } from "@/types/user";
import type { Translations } from "@/types/i18n";
import { ui } from "@/utils/ui";
import { useId, type ChangeEvent, type FormEvent } from "react";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

const ACCOUNT_MENU: MenuItem[] = [
  { label: "Edit Information", icon: UserPen, roles: ["admin"] },
];

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: "physical", label: "Physical" },
  { value: "digital", label: "Digital" },
  { value: "services", label: "Services" },
];

const dashboardInputClassName = `${ui.input} disabled:opacity-50`;

const fieldLabelClassName =
  "mb-2 block font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/45 dark:text-white/45";

function formatTypeLabel(type: string): string {
  return type.trim().charAt(0).toUpperCase() + type.trim().slice(1).toLowerCase();
}

interface AccountDashboardProps {
  user: CurrentUser;
  businesses: BusinessRecord[];
  labels: Translations;
  onSignOut?: () => void;
  onRoleChange: (role: UserRole) => void;
  onDeleteBusiness: (id: string) => Promise<void>;
  newName: string;
  setNewName: (value: string) => void;
  newType: BusinessType;
  setNewType: (value: BusinessType) => void;
  newDescription: string;
  setNewDescription: (value: string) => void;
  newGoogleMapsUrl: string;
  setNewGoogleMapsUrl: (value: string) => void;
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
}

export function AccountDashboard({
  user,
  businesses,
  labels,
  onSignOut,
  onRoleChange,
  onDeleteBusiness,
  newName,
  setNewName,
  newType,
  setNewType,
  newDescription,
  setNewDescription,
  newGoogleMapsUrl,
  setNewGoogleMapsUrl,
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
}: AccountDashboardProps) {
  const logoInputId = useId();
  const { role } = user;
  const showBusinessDashboard = role === "owner" || role === "admin";
  const showAdminPanel = role === "admin";
  const isPublishBusy = isExtractingLocation || isSubmitting || isUploadingLogo;

  const handleLogoInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onLogoSelect(file);
    event.target.value = "";
  };

  const visibleMenuItems = ACCOUNT_MENU.filter((item) =>
    item.roles.includes(role),
  );

  const displayInitial = user.email.charAt(0).toUpperCase();
  const displayName = user.email.split("@")[0];

  return (
    <div className="flex h-full flex-col gap-6 pb-4">
      {onSignOut && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSignOut}
            className={`rounded-full px-5 py-2 font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/60 transition-colors hover:bg-[#222222] hover:text-white dark:text-white/60 dark:hover:bg-white dark:hover:text-black ${ui.iconButton}`}
          >
            {labels.signOut}
          </button>
        </div>
      )}

      <div className="flex gap-2">
        {USER_ROLES.map(({ value, label }) => {
          const isActive = role === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => onRoleChange(value)}
              aria-pressed={isActive}
              className={`rounded-full px-3.5 py-1.5 font-sans text-[10px] font-medium uppercase tracking-wide transition-colors ${
                isActive ? ui.pillActive : ui.pillInactive
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <header className={`p-8 ${ui.card}`}>
        <div className="flex items-start justify-between">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full ${ui.mutedSurface}`}>
            <span className="font-sans text-2xl font-semibold text-[#222222]/70 dark:text-white/70">
              {displayInitial}
            </span>
          </div>
        </div>
        <h1 className="mt-5 font-sans text-2xl font-semibold capitalize text-[#222222] dark:text-white">
          {displayName}
        </h1>
        <p className="mt-1 text-sm text-[#222222]/45 dark:text-white/45">{user.email}</p>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-[#222222]/55 dark:text-white/55">
          <MapPin size={14} strokeWidth={1.75} aria-hidden />
          <span>Abu Dhabi, UAE</span>
        </div>
      </header>

      {visibleMenuItems.length > 0 && (
        <ul className="flex flex-col gap-4">
          {visibleMenuItems.map(({ label, icon: Icon }) => (
            <li key={label}>
              <button
                type="button"
                className={`flex w-full items-center justify-between p-6 transition-transform active:scale-[0.99] ${ui.card}`}
              >
                <span className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F9F9F9] dark:bg-white/10">
                    <Icon size={20} strokeWidth={1.5} className="text-[#222222]/70 dark:text-white/70" />
                  </span>
                  <span className="font-sans text-sm font-medium text-[#222222] dark:text-white">
                    {label}
                  </span>
                </span>
                <ChevronRight size={18} strokeWidth={1.75} className="text-[#222222]/30 dark:text-white/30" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {showAdminPanel && (
        <section className={`p-6 ${ui.card}`}>
          <div className="flex items-start gap-4 px-2">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F9F9F9] dark:bg-white/10">
              <ShieldCheck size={20} strokeWidth={1.5} className="text-[#222222]/70 dark:text-white/70" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-sans text-base font-semibold text-[#222222] dark:text-white">
                Admin Panel: Directory Management
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#222222]/55 dark:text-white/55">
                Manage all businesses listed on the Sikka map and directory.
              </p>
            </div>
          </div>

          <div className="mt-5 max-h-64 overflow-y-auto rounded-[24px] bg-white [-ms-overflow-style:none] scrollbar-none dark:bg-black [&::-webkit-scrollbar]:hidden">
            {businesses.length === 0 ? (
              <p className="px-5 py-8 text-center font-sans text-sm text-[#222222]/45 dark:text-white/45">
                No businesses in the directory yet.
              </p>
            ) : (
              <ul className="divide-y divide-[#222222]/10 dark:divide-white/10">
                {businesses.map((business) => (
                  <li
                    key={business.id}
                    className="flex items-center gap-3 bg-white px-4 py-3.5 dark:bg-black"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-sans text-sm font-medium text-[#222222] dark:text-white">
                        {business.name}
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-[#F9F9F9] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#222222]/60 dark:bg-white/10 dark:text-white/60">
                        {formatTypeLabel(business.type)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteBusiness(business.id)}
                      aria-label={`Delete ${business.name}`}
                      className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#222222] px-3.5 py-2 font-sans text-[10px] font-medium uppercase tracking-wide text-white transition-transform active:scale-95 dark:bg-white dark:text-black"
                    >
                      <Trash2 size={12} strokeWidth={2} aria-hidden />
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {showBusinessDashboard && (
        <section className={`mt-auto p-8 ${ui.card}`}>
          <div className="mb-6 flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F9F9F9] dark:bg-white/10">
              <LayoutDashboard size={20} strokeWidth={1.5} className="text-[#222222]/70 dark:text-white/70" />
            </span>
            <div>
              <h2 className="font-sans text-base font-semibold text-[#222222] dark:text-white">
                {labels.businessDashboard}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#222222]/55 dark:text-white/55">
                Add a new business to the Sikka map and directory.
              </p>
            </div>
          </div>

          <form onSubmit={onAddBusiness} className="flex flex-col gap-4">
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
              <span className={fieldLabelClassName}>Name</span>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="MADRE Desserts"
                required
                disabled={isPublishBusy}
                className={dashboardInputClassName}
              />
            </label>

            <label className="block">
              <span className={fieldLabelClassName}>Description</span>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Tell customers what you offer…"
                required
                rows={3}
                disabled={isPublishBusy}
                className={`${dashboardInputClassName} min-h-[96px] resize-none`}
              />
            </label>

            <label className="block">
              <span className={fieldLabelClassName}>Business type</span>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as BusinessType)}
                required
                disabled={isPublishBusy}
                className={`${dashboardInputClassName} appearance-none`}
              >
                {BUSINESS_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={fieldLabelClassName}>Google Maps Link</span>
              <input
                type="url"
                value={newGoogleMapsUrl}
                onChange={(e) => setNewGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/…"
                required
                disabled={isPublishBusy}
                className={dashboardInputClassName}
              />
            </label>

            <label className="block">
              <span className={fieldLabelClassName}>Instagram URL</span>
              <input
                type="url"
                value={newInstagramUrl}
                onChange={(e) => setNewInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/…"
                disabled={isPublishBusy}
                className={dashboardInputClassName}
              />
            </label>

            <label className="block">
              <span className={fieldLabelClassName}>WhatsApp Number</span>
              <input
                type="tel"
                value={newWhatsappNumber}
                onChange={(e) => setNewWhatsappNumber(e.target.value)}
                placeholder="+971 50 000 0000"
                disabled={isPublishBusy}
                className={dashboardInputClassName}
              />
            </label>

            <label className="block">
              <span className={fieldLabelClassName}>Website URL</span>
              <input
                type="url"
                value={newWebsiteUrl}
                onChange={(e) => setNewWebsiteUrl(e.target.value)}
                placeholder="https://yourbusiness.com"
                disabled={isPublishBusy}
                className={dashboardInputClassName}
              />
            </label>

            {publishError && (
              <p className={`rounded-[32px] px-4 py-3 text-center text-sm text-[#222222] ${ui.mutedSurface} dark:border dark:border-white/10 dark:text-white/80`}>
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
                  ? "Extracting Location…"
                  : isSubmitting
                    ? "Publishing…"
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
                Business published — now live on the map.
              </motion.p>
            )}
          </AnimatePresence>
        </section>
      )}
    </div>
  );
}
