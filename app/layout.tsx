import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Target the Variable Font file directly
const josefinSans = localFont({
  src: "../public/fonts/Josefin_Sans/JosefinSans-VariableFont_wght.ttf",
  variable: "--font-josefin",
  display: "swap",
});

// Target the Variable Font file directly
const estedad = localFont({
  src: "../public/fonts/Estedad/Estedad-VariableFont_wght.ttf",
  variable: "--font-estedad",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sikka App",
  description: "The local start-up market for digital, physical, and service businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${josefinSans.variable} ${estedad.variable} font-sans bg-[#F9F9F9] text-[#222222] antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}