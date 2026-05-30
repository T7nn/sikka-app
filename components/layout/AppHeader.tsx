interface AppHeaderProps {
  children: React.ReactNode;
}

export function AppHeader({ children }: AppHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-end bg-white px-6 dark:bg-black">
      {children}
    </header>
  );
}
