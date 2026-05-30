"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { Language, Translations } from "@/types/i18n";
import { ui } from "@/utils/ui";

interface SettingsMenuProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  labels: Translations;
}

export function SettingsMenu({
  language,
  onLanguageChange,
  labels,
}: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

  return (
    <div className="absolute inset-e-6 top-6 z-50">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={labels.settings}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`flex h-11 w-11 items-center justify-center ${ui.iconButton} text-[#222222]/60 transition-colors hover:bg-[#222222] hover:text-white dark:text-white/60 dark:hover:bg-white dark:hover:text-black`}
      >
        <Settings size={18} strokeWidth={1.75} aria-hidden />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label={labels.closeSettings}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-[#222222]/15 dark:bg-black/60"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="settings-menu-title"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`absolute inset-e-0 top-full z-50 mt-3 w-[min(100vw-3rem,18rem)] p-6 ${ui.card}`}
            >
              <h2
                id="settings-menu-title"
                className="font-sans text-sm font-semibold uppercase tracking-wide text-[#222222] dark:text-white"
              >
                {labels.settings}
              </h2>

              <div className="mt-6 flex flex-col gap-6">
                <div>
                  <p className="mb-3 font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/45 dark:text-white/45">
                    {labels.language}
                  </p>
                  <div className="flex gap-2">
                    {(["en", "ar"] as const).map((lang) => {
                      const isActive = language === lang;

                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => onLanguageChange(lang)}
                          aria-pressed={isActive}
                          className={`flex-1 rounded-full px-3 py-2 font-sans text-[10px] font-medium uppercase tracking-wide transition-colors ${
                            isActive ? ui.pillActive : ui.pillInactive
                          }`}
                        >
                          {lang === "en" ? labels.english : labels.arabic}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-3 font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/45 dark:text-white/45">
                    {labels.theme}
                  </p>
                  <div className="flex gap-2">
                    {(["light", "dark"] as const).map((mode) => {
                      const isActive =
                        mounted && (mode === "dark" ? isDark : !isDark);

                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setTheme(mode)}
                          aria-pressed={isActive}
                          disabled={!mounted}
                          className={`flex-1 rounded-full px-3 py-2 font-sans text-[10px] font-medium uppercase tracking-wide transition-colors disabled:opacity-50 ${
                            isActive ? ui.pillActive : ui.pillInactive
                          }`}
                        >
                          {mode === "light" ? labels.lightMode : labels.darkMode}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
