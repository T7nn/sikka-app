/** Shared monochrome surface classes — light: white + shadow; dark: black + border, no shadow */

export const ui = {
  page: "bg-white text-[#222222] dark:bg-black dark:text-white",
  card: "rounded-[32px] bg-white shadow-soft-airy dark:border dark:border-white/10 dark:bg-black dark:shadow-none",
  cardSm: "rounded-[32px] bg-white shadow-soft-airy dark:border dark:border-white/10 dark:bg-[#111111] dark:shadow-none",
  pillActive: "bg-[#222222] text-white shadow-soft-airy dark:bg-white dark:text-black dark:shadow-none",
  pillInactive:
    "bg-white text-[#222222]/45 shadow-soft-airy dark:border dark:border-white/10 dark:bg-[#111111] dark:text-white/45 dark:shadow-none",
  input:
    "w-full rounded-[32px] border-0 bg-white px-5 py-4 font-sans text-sm text-[#222222] shadow-soft-airy placeholder:text-[#222222]/30 focus:outline-none focus:ring-2 focus:ring-[#222222]/10 dark:border dark:border-white/10 dark:bg-[#111111] dark:text-white dark:placeholder:text-white/30 dark:shadow-none dark:focus:ring-white/10",
  iconButton:
    "rounded-full bg-white shadow-soft-airy transition-colors dark:border dark:border-white/10 dark:bg-black dark:shadow-none",
  mutedSurface: "bg-[#F9F9F9] dark:bg-[#111111]",
} as const;
