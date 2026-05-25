"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface OrderTrackingCardProps {
  visible: boolean;
  businessName?: string;
  onDismiss: () => void;
}

export function OrderTrackingCard({
  visible,
  businessName = "MADRE Desserts",
  onDismiss,
}: OrderTrackingCardProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: 20 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.28, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="rounded-[32px] bg-white p-6 shadow-soft-airy">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F9F9F9]">
                <Loader2
                  size={22}
                  strokeWidth={1.75}
                  className="animate-spin text-[#222222]/70"
                  aria-hidden
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-[#222222]/45">
                  Order tracking
                </p>
                <p className="mt-1 font-sans text-base font-semibold text-[#222222]">
                  Preparation in progress
                </p>
                <p className="mt-1 text-sm text-[#222222]/55">{businessName}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onDismiss}
              className="mt-5 w-full rounded-full bg-[#F9F9F9] py-3 font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/70 transition-colors hover:bg-[#222222] hover:text-white"
            >
              Mark done
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
