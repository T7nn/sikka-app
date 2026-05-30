"use client";

import { BusinessLogo } from "@/components/business/BusinessLogo";
import type { BusinessRecord } from "@/types/business";
import { resolveBusinessMainCategory } from "@/types/businessCategories";
import {
  getActivityLabel,
  getCatalogCategoryLabel,
  type Translations,
} from "@/types/i18n";
import { ui } from "@/utils/ui";

interface BusinessCardProps {
  business: BusinessRecord;
  labels: Translations;
  onSelect?: (business: BusinessRecord) => void;
}

export function BusinessCard({ business, labels, onSelect }: BusinessCardProps) {
  const resolvedCategory = resolveBusinessMainCategory(business);
  const categoryLabel = getCatalogCategoryLabel(resolvedCategory, labels);
  const primaryActivity = business.activities?.[0]?.trim();

  return (
    <button
      type="button"
      onClick={() => onSelect?.(business)}
      className={`w-full p-6 text-start transition-transform active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#222222]/15 dark:focus-visible:ring-white/15 ${ui.card}`}
    >
      <div className="flex items-start gap-4">
        <BusinessLogo name={business.name} logoUrl={business.logo_url} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="font-sans text-base font-semibold leading-snug text-[#222222] dark:text-white">
            {business.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#222222]/60 dark:text-white/60">
            {business.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[#222222]/70 dark:text-white/70 ${ui.mutedSurface}`}
            >
              {categoryLabel}
            </span>
            {primaryActivity && (
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[#222222]/70 dark:text-white/70 ${ui.mutedSurface}`}
              >
                {getActivityLabel(primaryActivity, labels)}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
