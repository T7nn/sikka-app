import Image from "next/image";

const sizePixels = {
  sm: 48,
  md: 64,
} as const;

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
} as const;

interface BusinessLogoProps {
  name: string;
  logoUrl?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function BusinessLogo({ name, logoUrl, size = "sm", className = "" }: BusinessLogoProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const dimension = sizePixels[size];
  const dimensionClass = sizeClasses[size];

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt=""
        width={dimension}
        height={dimension}
        className={`shrink-0 rounded-full object-cover ${dimensionClass} ${className}`.trim()}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] font-sans font-semibold text-[#222222] dark:bg-[#111111] dark:text-white ${dimensionClass} ${
        size === "md" ? "text-lg" : "text-sm"
      } ${className}`.trim()}
    >
      {initial}
    </span>
  );
}
