"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ExternalLink, MapPin, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatBusinessTypeLabel, type BusinessRecord } from "@/types/business";
import { BusinessLogo } from "@/components/business/BusinessLogo";
import { buildBusinessSocialLinks } from "@/utils/businessSocialLinks";

const TAB_BAR_OFFSET = "calc(4.25rem + env(safe-area-inset-bottom, 0px))";
const layoutTransition = { layout: { type: "spring" as const, stiffness: 400, damping: 40 } };

interface BusinessPreviewSheetProps {
  business: BusinessRecord | null;
  onClose: () => void;
}

export function BusinessPreviewSheet({ business, onClose }: BusinessPreviewSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsExpanded(false);
  }, [business?.id]);

  const socialLinks = useMemo(
    () => (business ? buildBusinessSocialLinks(business) : []),
    [business],
  );

  return (
    <AnimatePresence>
      {business && (
        <motion.div
          key={business.id}
          layout
          role="dialog"
          aria-modal="true"
          aria-labelledby="business-preview-title"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.22, ease: "easeOut", layout: layoutTransition.layout }}
          style={{ bottom: TAB_BAR_OFFSET }}
          className="fixed inset-x-4 z-60 mx-auto max-w-lg overflow-hidden rounded-[32px] bg-white font-sans text-[#222222] shadow-soft-airy dark:border dark:border-white/10 dark:bg-black dark:text-white dark:shadow-none"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close business preview"
            className="absolute top-4 inset-e-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#F9F9F9] text-[#222222]/70 transition-colors hover:bg-[#222222] hover:text-white dark:bg-white/10 dark:text-white/70 dark:hover:bg-white dark:hover:text-black"
          >
            <X size={14} strokeWidth={1.75} aria-hidden />
          </button>

          <div className="p-5 pe-14">
            <div className="flex items-start gap-4">
              <BusinessLogo name={business.name} logoUrl={business.logo_url} size="sm" />
              <div className="min-w-0 flex-1">
                <h2
                  id="business-preview-title"
                  className="truncate text-lg font-semibold leading-snug"
                >
                  {business.name}
                </h2>
                <span className="mt-2 inline-block rounded-full bg-[#222222] px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-white dark:bg-white dark:text-black">
                  {formatBusinessTypeLabel(business.type)}
                </span>
              </div>
            </div>

            <motion.p
              layout
              className={`mt-4 text-sm leading-relaxed text-[#222222]/60 dark:text-white/60 ${
                isExpanded ? "" : "line-clamp-2"
              }`}
            >
              {business.description}
            </motion.p>

            {!isExpanded && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                aria-label="Show full business details"
                aria-expanded={false}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#F9F9F9] py-3 font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/70 transition-colors hover:bg-[#222222] hover:text-white dark:bg-white/10 dark:text-white/70 dark:hover:bg-white dark:hover:text-black"
              >
                <ChevronDown size={16} strokeWidth={1.75} aria-hidden />
              </button>
            )}

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={layoutTransition}
                  className="overflow-hidden"
                >
                  {business.google_maps_url && (
                    <a
                      href={business.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 flex items-center justify-between rounded-[32px] bg-white px-5 py-4 text-sm font-medium text-[#222222] shadow-soft-airy transition-colors hover:bg-[#222222] hover:text-white dark:border dark:border-white/10 dark:bg-[#111111] dark:text-white dark:shadow-none dark:hover:bg-white dark:hover:text-black"
                    >
                      <span className="flex items-center gap-3">
                        <MapPin size={18} strokeWidth={1.5} aria-hidden />
                        Google Maps
                      </span>
                      <ExternalLink size={14} strokeWidth={1.75} className="opacity-40" aria-hidden />
                    </a>
                  )}

                  {socialLinks.length > 0 && (
                    <ul className="mt-4 flex flex-col gap-3 pb-1">
                      {socialLinks.map(({ label, href, icon: LinkIcon }) => (
                        <li key={label}>
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-[32px] bg-white px-5 py-4 text-sm font-medium text-[#222222] shadow-soft-airy transition-colors hover:bg-[#222222] hover:text-white dark:border dark:border-white/10 dark:bg-[#111111] dark:text-white dark:shadow-none dark:hover:bg-white dark:hover:text-black"
                          >
                            <span className="flex items-center gap-3">
                              <LinkIcon size={18} strokeWidth={1.5} aria-hidden />
                              {label}
                            </span>
                            <ExternalLink
                              size={14}
                              strokeWidth={1.75}
                              className="opacity-40"
                              aria-hidden
                            />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
