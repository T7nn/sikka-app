"use client";

import { AnimatePresence, motion } from "framer-motion";
import { getIconForBusinessType } from "@/utils/businessIcons";
import type { BusinessRecord } from "@/types/business";

interface BusinessDetailSheetProps {
  business: BusinessRecord | null;
  onClose: () => void;
  onPlaceOrder: () => void;
}

function getActionLabel(type: string): string {
  return type.trim().toLowerCase() === "services"
    ? "Request Service"
    : "Place Order";
}

function formatTypeLabel(type: string): string {
  return type.trim().charAt(0).toUpperCase() + type.trim().slice(1).toLowerCase();
}

export function BusinessDetailSheet({
  business,
  onClose,
  onPlaceOrder,
}: BusinessDetailSheetProps) {
  const Icon = business ? getIconForBusinessType(business.type) : null;

  return (
    <AnimatePresence>
      {business && (
        <>
          <motion.button
            type="button"
            aria-label="Close business details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-55 bg-[#222222]/20"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="business-detail-title"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom,0))] z-60 mx-auto max-w-lg rounded-t-[32px] bg-white px-6 pb-8 pt-4 shadow-soft-airy"
          >
            <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-[#222222]/15" aria-hidden />

            <div className="flex items-start gap-4">
              {Icon && (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F9F9F9]">
                  <Icon size={24} strokeWidth={1.5} className="text-[#222222]/70" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <h2
                  id="business-detail-title"
                  className="font-sans text-xl font-semibold leading-snug text-[#222222]"
                >
                  {business.name}
                </h2>
                <span className="mt-3 inline-block rounded-full bg-[#222222] px-3.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white">
                  {formatTypeLabel(business.type)}
                </span>
              </div>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-[#222222]/60">
              {business.description}
            </p>

            <button
              type="button"
              onClick={onPlaceOrder}
              className="mt-8 w-full rounded-full bg-[#222222] py-4 font-sans text-sm font-semibold uppercase tracking-wide text-white transition-transform active:scale-[0.98]"
            >
              {getActionLabel(business.type)}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full py-2 font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/40 transition-colors hover:text-[#222222]/70"
            >
              Close
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
