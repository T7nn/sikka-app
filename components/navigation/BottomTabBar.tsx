"use client";

import { motion } from "framer-motion";
import { Home, Search, User, type LucideIcon } from "lucide-react";

export type TabId = "home" | "search" | "account";

interface TabItem {
  id: TabId;
  icon: LucideIcon;
}

const TABS: TabItem[] = [
  { id: "home", icon: Home },
  { id: "search", icon: Search },
  { id: "account", icon: User },
];

interface BottomTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  tabLabels: Record<TabId, string>;
}

export function BottomTabBar({ activeTab, onTabChange, tabLabels }: BottomTabBarProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#222222]/10 bg-white pt-3 shadow-soft-airy dark:border-white/10 dark:bg-black dark:shadow-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch gap-2 px-5 pb-3">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const label = tabLabels[tab.id];

          return (
            <li key={tab.id} className="flex-1">
              <button
                type="button"
                onClick={() => onTabChange(tab.id)}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                className="relative flex w-full flex-col items-center justify-center gap-1 rounded-full px-2 py-2.5"
              >
                {isActive && (
                  <motion.span
                    layoutId="active-tab-pill"
                    className="absolute inset-0 rounded-full bg-[#222222] dark:bg-white"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <Icon
                  size={22}
                  strokeWidth={1.75}
                  aria-hidden
                  className={`relative z-10 transition-colors duration-200 ${
                    isActive
                      ? "text-white dark:text-black"
                      : "text-[#222222]/40 dark:text-white/40"
                  }`}
                />

                <span
                  className={`relative z-10 font-sans text-[10px] font-medium uppercase tracking-[0.14em] transition-colors duration-200 ${
                    isActive
                      ? "text-white dark:text-black"
                      : "text-[#222222]/40 dark:text-white/40"
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
