"use client";

import { getIconForBusinessType } from "@/utils/businessIcons";
import type { BusinessRecord } from "@/types/business";

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
      className="w-full rounded-[32px] bg-white p-6 text-left shadow-soft-airy transition-transform active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#222222]/15"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F9F9F9]">
          <Icon size={22} strokeWidth={1.5} className="text-[#222222]/70" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-sans text-base font-semibold leading-snug text-[#222222]">
            {business.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#222222]/60">
            {business.description}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="rounded-full bg-[#F9F9F9] px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[#222222]/70">
              {business.type}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
