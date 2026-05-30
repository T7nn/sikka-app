"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { BusinessLogo } from "@/components/business/BusinessLogo";
import { buildBusinessSocialLinks } from "@/utils/businessSocialLinks";
import { formatBusinessTypeLabel, type BusinessRecord } from "@/types/business";

interface BusinessDetailSheetProps {
  business: BusinessRecord | null;
  onClose: () => void;
}

export function BusinessDetailSheet({ business, onClose }: BusinessDetailSheetProps) {
  const socialLinks = business ? buildBusinessSocialLinks(business) : [];

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
            className="fixed inset-0 z-55 bg-[#222222]/20 dark:bg-black/50"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="business-detail-title"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom,0))] z-60 mx-auto max-w-lg rounded-t-[32px] border border-transparent bg-white px-6 pb-8 pt-4 shadow-soft-airy dark:border-white/10 dark:bg-black dark:shadow-none"
          >
            <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-[#222222]/15 dark:bg-white/15" aria-hidden />

            <div className="flex items-start gap-4">
              <BusinessLogo name={business.name} logoUrl={business.logo_url} size="sm" />
              <div className="min-w-0 flex-1">
                <h2
                  id="business-detail-title"
                  className="font-sans text-xl font-semibold leading-snug text-[#222222] dark:text-white"
                >
                  {business.name}
                </h2>
                <span className="mt-3 inline-block rounded-full bg-[#222222] px-3.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white dark:bg-white dark:text-black">
                  {formatBusinessTypeLabel(business.type)}
                </span>
              </div>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-[#222222]/60 dark:text-white/60">
              {business.description}
            </p>

            {socialLinks.length > 0 && (
              <ul className="mt-6 flex flex-col gap-3">
                {socialLinks.map(({ label, href, icon: LinkIcon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-[32px] bg-white px-5 py-4 font-sans text-sm font-medium text-[#222222] shadow-soft-airy transition-colors hover:bg-[#222222] hover:text-white dark:border dark:border-white/10 dark:bg-[#111111] dark:text-white dark:shadow-none dark:hover:bg-white dark:hover:text-black"
                    >
                      <span className="flex items-center gap-3">
                        <LinkIcon size={18} strokeWidth={1.5} aria-hidden />
                        {label}
                      </span>
                      <ExternalLink size={14} strokeWidth={1.75} className="opacity-40" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full py-2 font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/40 transition-colors hover:text-[#222222]/70 dark:text-white/40 dark:hover:text-white/70"
            >
              Close
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
