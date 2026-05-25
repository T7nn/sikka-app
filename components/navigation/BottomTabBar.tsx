"use client";

import { motion } from "framer-motion";
import { Home, Search, User, type LucideIcon } from "lucide-react";

export type TabId = "home" | "search" | "account";

interface TabItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

const TABS: TabItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "search", label: "Search", icon: Search },
  { id: "account", label: "Account", icon: User },
];

interface BottomTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="sticky bottom-0 z-50 border-t border-[#222222]/10 bg-white px-5 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3 shadow-soft-airy"
    >
      <ul className="mx-auto flex max-w-md items-stretch gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <li key={tab.id} className="flex-1">
              <button
                type="button"
                onClick={() => onTabChange(tab.id)}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
                className="relative flex w-full flex-col items-center justify-center gap-1 rounded-full px-2 py-2.5"
              >
                {isActive && (
                  <motion.span
                    layoutId="active-tab-pill"
                    className="absolute inset-0 rounded-full bg-[#222222]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <Icon
                  size={22}
                  strokeWidth={1.75}
                  aria-hidden
                  className={`relative z-10 transition-colors duration-200 ${
                    isActive ? "text-white" : "text-[#222222]/40"
                  }`}
                />

                <span
                  className={`relative z-10 font-sans text-[10px] font-medium uppercase tracking-[0.14em] transition-colors duration-200 ${
                    isActive ? "text-white" : "text-[#222222]/40"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
