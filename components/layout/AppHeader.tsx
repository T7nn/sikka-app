import Image from "next/image";

interface AppHeaderProps {
  children: React.ReactNode;
}

export function AppHeader({ children }: AppHeaderProps) {
  return (
    <header className="flex h-16 w-full shrink-0 items-center justify-between bg-white px-4 dark:bg-black">
      <Image
        src="/logo.png"
        alt="Sikka Logo"
        width={96}
        height={40}
        priority
        className="h-auto w-24 transition-all duration-300 dark:invert"
      />
      {children}
    </header>
  );
}
