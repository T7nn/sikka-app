"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { formatBusinessTypeLabel, type BusinessRecord } from "@/types/business";

interface BusinessMapMiniCardProps {
  business: BusinessRecord | null;
  onViewDetails: (business: BusinessRecord) => void;
  onDismiss?: () => void;
}

export function BusinessMapMiniCard({
  business,
  onViewDetails,
}: BusinessMapMiniCardProps) {
  return (
    <AnimatePresence>
      {business && (
        <motion.div
          key={business.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="pointer-events-auto absolute inset-x-4 bottom-4 z-30"
        >
          <button
            type="button"
            onClick={() => onViewDetails(business)}
            className="flex w-full items-center gap-4 rounded-[32px] bg-white p-5 text-start shadow-soft-airy transition-transform active:scale-[0.99] dark:border dark:border-white/10 dark:bg-black dark:shadow-none"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-base font-semibold text-[#222222] dark:text-white">
                {business.name}
              </p>
              <span className="mt-2 inline-block rounded-full bg-[#F9F9F9] px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-[#222222]/60 dark:bg-[#111111] dark:text-white/60">
                {formatBusinessTypeLabel(business.type)}
              </span>
            </div>
            <span className="flex shrink-0 items-center gap-1 font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/50 dark:text-white/50">
              View Details
              <ChevronRight size={14} strokeWidth={1.75} aria-hidden />
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
