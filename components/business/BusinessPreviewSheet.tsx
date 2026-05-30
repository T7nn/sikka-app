"use client";

import { AnimatePresence, motion, useDragControls, type PanInfo } from "framer-motion";
import { ExternalLink, MapPin } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { formatBusinessTypeLabel, type BusinessRecord } from "@/types/business";
import { buildBusinessSocialLinks } from "@/utils/businessSocialLinks";
import { getIconForBusinessType } from "@/utils/businessIcons";

type SheetSnap = "minimized" | "expanded";

const SHEET_HEIGHT_VH = 85;
const PEEK_HEIGHT_PX = 132;
const EXPAND_DRAG_THRESHOLD = -50;
const MINIMIZE_DRAG_THRESHOLD = 50;
const CLOSE_DRAG_THRESHOLD = 80;
const TAB_BAR_OFFSET = "calc(4.25rem + env(safe-area-inset-bottom, 0px))";

const sheetTransition = { type: "spring" as const, stiffness: 400, damping: 40 };

interface BusinessPreviewSheetProps {
  business: BusinessRecord | null;
  onClose: () => void;
}

function getSheetMetrics() {
  const sheetHeight = Math.round((window.innerHeight * SHEET_HEIGHT_VH) / 100);
  const minimizedOffset = Math.max(0, sheetHeight - PEEK_HEIGHT_PX);
  return { sheetHeight, minimizedOffset };
}

export function BusinessPreviewSheet({ business, onClose }: BusinessPreviewSheetProps) {
  const dragControls = useDragControls();
  const [snap, setSnap] = useState<SheetSnap>("minimized");
  const [metrics, setMetrics] = useState({ sheetHeight: 0, minimizedOffset: 0 });

  useLayoutEffect(() => {
    const update = () => setMetrics(getSheetMetrics());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    setSnap("minimized");
  }, [business?.id]);

  const socialLinks = useMemo(
    () => (business ? buildBusinessSocialLinks(business) : []),
    [business],
  );

  const Icon = business ? getIconForBusinessType(business.type) : null;

  const sheetVariants = useMemo(
    () => ({
      minimized: { y: metrics.minimizedOffset },
      expanded: { y: 0 },
    }),
    [metrics.minimizedOffset],
  );

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;

    if (snap === "minimized") {
      if (offset.y < EXPAND_DRAG_THRESHOLD || velocity.y < -400) {
        setSnap("expanded");
        return;
      }

      if (offset.y > CLOSE_DRAG_THRESHOLD || velocity.y > 500) {
        onClose();
      }

      return;
    }

    if (offset.y > MINIMIZE_DRAG_THRESHOLD || velocity.y > 400) {
      setSnap("minimized");
    }
  };

  const dragEnabled = metrics.sheetHeight > 0;

  return (
    <AnimatePresence>
      {business && dragEnabled && (
        <>
          <AnimatePresence>
            {snap === "expanded" && (
              <motion.button
                type="button"
                aria-label="Close business preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                className="fixed inset-0 z-55 bg-[#222222]/20 dark:bg-black/50"
              />
            )}
          </AnimatePresence>

          <motion.div
            key={business.id}
            role="dialog"
            aria-modal="true"
            aria-labelledby="business-preview-title"
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: metrics.minimizedOffset }}
            dragElastic={0.12}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            initial={{ y: metrics.sheetHeight }}
            animate={snap}
            exit={{ y: metrics.sheetHeight }}
            variants={sheetVariants}
            transition={sheetTransition}
            style={{
              height: `${SHEET_HEIGHT_VH}vh`,
              bottom: TAB_BAR_OFFSET,
            }}
            className="fixed inset-x-0 z-60 mx-auto flex max-w-lg flex-col overflow-hidden rounded-t-[32px] bg-white font-sans text-[#222222] shadow-soft-airy dark:border-t dark:border-white/10 dark:bg-black dark:text-white dark:shadow-none"
          >
            <div
              className="flex shrink-0 cursor-grab flex-col items-center px-6 pt-3 active:cursor-grabbing"
              onPointerDown={(event) => dragControls.start(event)}
            >
              <div
                className="mb-4 h-1 w-10 rounded-full bg-[#222222]/20 dark:bg-white/25"
                aria-hidden
              />
              <div className="flex w-full items-start gap-4 pb-4">
                {Icon && (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F9F9F9] dark:bg-white/10">
                    <Icon size={22} strokeWidth={1.5} className="text-[#222222]/70 dark:text-white/70" />
                  </span>
                )}
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
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-8 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
              <p className="text-sm leading-relaxed text-[#222222]/60 dark:text-white/60">
                {business.description}
              </p>

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
                <ul className="mt-4 flex flex-col gap-3">
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
                        <ExternalLink size={14} strokeWidth={1.75} className="opacity-40" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
