"use client";

import { getIconForBusinessType } from "@/utils/businessIcons";
import type { BusinessRecord } from "@/types/business";
import { ui } from "@/utils/ui";

interface BusinessCardProps {
  business: BusinessRecord;
  onSelect?: (business: BusinessRecord) => void;
}

export function BusinessCard({ business, onSelect }: BusinessCardProps) {
  const Icon = getIconForBusinessType(business.type);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(business)}
      className={`w-full p-6 text-start transition-transform active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#222222]/15 dark:focus-visible:ring-white/15 ${ui.card}`}
    >
      <div className="flex items-start gap-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${ui.mutedSurface}`}>
          <Icon size={22} strokeWidth={1.5} className="text-[#222222]/70 dark:text-white/70" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-sans text-base font-semibold leading-snug text-[#222222] dark:text-white">
            {business.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#222222]/60 dark:text-white/60">
            {business.description}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[#222222]/70 dark:text-white/70 ${ui.mutedSurface}`}>
              {business.type}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
