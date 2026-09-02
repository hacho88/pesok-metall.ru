import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Manrope, Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AdminNav } from "@/components/AdminNav";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: {
    default: "Админка pesok-metall.ru",
    template: "%s | Админка pesok-metall.ru",
  },
  description: "Админка pesok-metall.ru — страницы, товары, клиенты, реклама",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${manrope.variable} ${spaceGrotesk.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <div className="flex min-h-screen flex-col md:flex-row">
          <AdminNav />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
