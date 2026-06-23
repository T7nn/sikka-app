"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const COUNTDOWN_SECONDS = 10;

interface SafeDeleteModalProps {
  isOpen: boolean;
  itemName: string;
  affectedItems: string[];
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  labels: {
    cancel: string;
    deleteWarningPrefix: string;
    confirmDeletionCountdown: (seconds: number) => string;
    permanentlyDeleteItem: string;
  };
}

export function SafeDeleteModal({
  isOpen,
  itemName,
  affectedItems,
  onClose,
  onConfirm,
  labels,
}: SafeDeleteModalProps) {
  const [countdownTime, setCountdownTime] = useState(COUNTDOWN_SECONDS);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdownTime(COUNTDOWN_SECONDS);
      setIsDeleting(false);
      return;
    }

    setCountdownTime(COUNTDOWN_SECONDS);

    const interval = window.setInterval(() => {
      setCountdownTime((previous) => {
        if (previous <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isOpen]);

  const canConfirm = countdownTime === 0 && !isDeleting;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="safe-delete-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="w-full max-w-md rounded-[32px] border border-[#222222]/10 bg-white p-6 shadow-soft-airy dark:border-white/10 dark:bg-black dark:shadow-none"
          >
            <div className="flex items-start justify-between gap-4">
              <h3
                id="safe-delete-title"
                className="font-sans text-base font-semibold text-[#222222] dark:text-white"
              >
                Remove &ldquo;{itemName}&rdquo;?
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label={labels.cancel}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#222222]/50 transition-colors hover:bg-[#F9F9F9] hover:text-[#222222] dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X size={16} strokeWidth={1.75} aria-hidden />
              </button>
            </div>

            {affectedItems.length > 0 ? (
              <div className="mt-4 rounded-[24px] border border-[#222222]/10 bg-[#F9F9F9] px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <p className="font-sans text-sm leading-relaxed text-[#222222] dark:text-white">
                  {labels.deleteWarningPrefix.replace(
                    "{count}",
                    String(affectedItems.length),
                  )}
                </p>
                <ul className="mt-2 max-h-32 overflow-y-auto font-sans text-sm text-[#222222]/70 dark:text-white/70">
                  {affectedItems.map((name) => (
                    <li key={name} className="truncate py-0.5">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-4 font-sans text-sm leading-relaxed text-[#222222]/60 dark:text-white/60">
                This action cannot be undone. The item will be permanently removed from the
                directory.
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                disabled={!canConfirm}
                onClick={handleConfirm}
                className={`w-full rounded-full py-3.5 font-sans text-xs font-medium uppercase tracking-wide transition-all ${
                  canConfirm
                    ? "bg-[#222222] text-white hover:opacity-90 dark:bg-white dark:text-black"
                    : "cursor-not-allowed bg-[#222222]/30 text-white/70 dark:bg-white/20 dark:text-white/50"
                }`}
              >
                {canConfirm
                  ? labels.permanentlyDeleteItem
                  : labels.confirmDeletionCountdown(countdownTime)}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full border border-[#222222]/15 py-3.5 font-sans text-xs font-medium uppercase tracking-wide text-[#222222] transition-colors hover:bg-[#F9F9F9] dark:border-white/10 dark:text-white dark:hover:bg-white/10"
              >
                {labels.cancel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
