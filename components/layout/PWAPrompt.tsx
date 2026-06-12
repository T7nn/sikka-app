"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;

  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function PWAPrompt() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setIsStandalone(standalone);
    setIsIOS(isIOSDevice());

    if (standalone) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsDismissed(true);
    }
  };

  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed inset-x-4 bottom-24 z-50 flex items-center justify-between gap-3 rounded-3xl border border-[#222222]/10 bg-white/90 p-4 shadow-soft-airy backdrop-blur-md dark:border-white/10 dark:bg-black/90 dark:shadow-none"
        role="region"
        aria-label="Add Sikka to your home screen"
      >
        <Image
          src="/logo.png"
          alt="Sikka Logo"
          width={48}
          height={20}
          className="h-auto w-12 shrink-0 dark:invert"
        />

        <div className="min-w-0 flex-1">
          <p className="font-sans text-sm leading-snug text-[#222222] dark:text-white">
            For the best experience, add Sikka to your home screen.
          </p>

          {isInstallable ? (
            <button
              type="button"
              onClick={handleInstall}
              className="mt-2 rounded-full bg-[#222222] px-4 py-2 font-sans text-xs font-medium uppercase tracking-wide text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
            >
              Install
            </button>
          ) : isIOS ? (
            <p className="mt-1 font-sans text-xs leading-relaxed text-[#222222]/60 dark:text-white/60">
              Tap the Share icon, then &apos;Add to Home Screen&apos;.
            </p>
          ) : (
            <p className="mt-1 font-sans text-xs leading-relaxed text-[#222222]/60 dark:text-white/60">
              Use your browser menu to install this app on your home screen.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss install suggestion"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#222222]/50 transition-colors hover:bg-[#F9F9F9] hover:text-[#222222] dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X size={16} strokeWidth={1.75} aria-hidden />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
