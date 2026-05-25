"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Download,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  UserPen,
  type LucideIcon,
} from "lucide-react";
import type { BusinessType } from "@/types/businessForm";
import type { BusinessRecord } from "@/types/business";
import type { CurrentUser, UserRole } from "@/types/user";
import { USER_ROLES } from "@/types/user";
import type { Translations } from "@/types/i18n";
import type { FormEvent } from "react";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

const ACCOUNT_MENU: MenuItem[] = [
  { label: "Edit Information", icon: UserPen, roles: ["admin"] },
  { label: "Past Orders", icon: ShoppingBag, roles: ["customer", "owner", "admin"] },
  { label: "Downloadable Files", icon: Download, roles: ["customer", "owner", "admin"] },
];

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: "physical", label: "Physical" },
  { value: "digital", label: "Digital" },
  { value: "services", label: "Services" },
];

const inputClassName =
  "w-full rounded-2xl border border-[#222222]/12 bg-white px-5 py-4 font-sans text-sm text-[#222222] placeholder:text-[#222222]/30 focus:border-[#222222]/30 focus:outline-none focus:ring-2 focus:ring-[#222222]/10";

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
  newLat: string;
  setNewLat: (value: string) => void;
  newLng: string;
  setNewLng: (value: string) => void;
  isSubmitting: boolean;
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
  newLat,
  setNewLat,
  newLng,
  setNewLng,
  isSubmitting,
  submitSuccess,
  onAddBusiness,
}: AccountDashboardProps) {
  const { role } = user;
  const showBusinessDashboard = role === "owner" || role === "admin";
  const showAdminPanel = role === "admin";

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
            className="rounded-full bg-white px-5 py-2 font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/60 shadow-soft-airy transition-colors hover:bg-[#222222] hover:text-white"
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
                isActive
                  ? "bg-[#222222] text-white shadow-soft-airy"
                  : "bg-white text-[#222222]/45 shadow-soft-airy"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <header className="rounded-[32px] bg-white p-8 shadow-soft-airy">
        <div className="flex items-start justify-between">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F9F9F9]">
            <span className="font-sans text-2xl font-semibold text-[#222222]/70">
              {displayInitial}
            </span>
          </div>
        </div>
        <h1 className="mt-5 font-sans text-2xl font-semibold capitalize text-[#222222]">
          {displayName}
        </h1>
        <p className="mt-1 text-sm text-[#222222]/45">{user.email}</p>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-[#222222]/55">
          <MapPin size={14} strokeWidth={1.75} aria-hidden />
          <span>Abu Dhabi, UAE</span>
        </div>
      </header>

      <ul className="flex flex-col gap-4">
        {visibleMenuItems.map(({ label, icon: Icon }) => (
          <li key={label}>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-[32px] bg-white p-6 shadow-soft-airy transition-transform active:scale-[0.99]"
            >
              <span className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F9F9F9]">
                  <Icon size={20} strokeWidth={1.5} className="text-[#222222]/70" />
                </span>
                <span className="font-sans text-sm font-medium text-[#222222]">{label}</span>
              </span>
              <ChevronRight size={18} strokeWidth={1.75} className="text-[#222222]/30" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      {showAdminPanel && (
        <section className="rounded-[32px] bg-white p-6 shadow-soft-airy">
          <div className="flex items-start gap-4 px-2">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F9F9F9]">
              <ShieldCheck size={20} strokeWidth={1.5} className="text-[#222222]/70" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-sans text-base font-semibold text-[#222222]">
                Admin Panel: Directory Management
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#222222]/55">
                Manage all businesses listed on the Sikka map and directory.
              </p>
            </div>
          </div>

          <div className="mt-5 max-h-64 overflow-y-auto rounded-[24px] bg-white [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
            {businesses.length === 0 ? (
              <p className="px-5 py-8 text-center font-sans text-sm text-[#222222]/45">
                No businesses in the directory yet.
              </p>
            ) : (
              <ul className="divide-y divide-[#222222]/10">
                {businesses.map((business) => (
                  <li
                    key={business.id}
                    className="flex items-center gap-3 bg-white px-4 py-3.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-sans text-sm font-medium text-[#222222]">
                        {business.name}
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-[#F9F9F9] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#222222]/60">
                        {formatTypeLabel(business.type)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteBusiness(business.id)}
                      aria-label={`Delete ${business.name}`}
                      className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#222222] px-3.5 py-2 font-sans text-[10px] font-medium uppercase tracking-wide text-white transition-transform active:scale-95"
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
        <section className="mt-auto rounded-[32px] bg-[#222222] p-8 shadow-soft-airy">
          <div className="mb-6 flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <LayoutDashboard size={20} strokeWidth={1.5} className="text-white/80" />
            </span>
            <div>
              <h2 className="font-sans text-base font-semibold text-white">{labels.businessDashboard}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Add a new business to the Sikka map and directory.
              </p>
            </div>
          </div>

          <form onSubmit={onAddBusiness} className="flex flex-col gap-4">
            <label className="block">
              <span className="mb-2 block font-sans text-xs font-medium uppercase tracking-wide text-white/45">
                Name
              </span>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="MADRE Desserts"
                required
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-sans text-xs font-medium uppercase tracking-wide text-white/45">
                Description
              </span>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Tell customers what you offer…"
                required
                rows={3}
                className={`${inputClassName} min-h-[96px] resize-none`}
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-sans text-xs font-medium uppercase tracking-wide text-white/45">
                Business type
              </span>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as BusinessType)}
                required
                className={`${inputClassName} appearance-none`}
              >
                {BUSINESS_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block font-sans text-xs font-medium uppercase tracking-wide text-white/45">
                  Latitude
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={newLat}
                  onChange={(e) => setNewLat(e.target.value)}
                  placeholder="24.4539"
                  required
                  className={inputClassName}
                />
              </label>
              <label className="block">
                <span className="mb-2 block font-sans text-xs font-medium uppercase tracking-wide text-white/45">
                  Longitude
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={newLng}
                  onChange={(e) => setNewLng(e.target.value)}
                  placeholder="54.3773"
                  required
                  className={inputClassName}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-full bg-white py-3.5 font-sans text-xs font-medium uppercase tracking-wide text-[#222222] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Publishing…" : labels.publishBusiness}
            </button>
          </form>

          <AnimatePresence>
            {submitSuccess && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="mt-4 text-center font-sans text-sm text-white/80"
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
