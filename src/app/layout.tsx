import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Manrope, Playfair_Display, Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { PWARegister } from "@/components/PWARegister";
import { CartProvider } from "@/components/checkout/CartContext";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "cyrillic-ext"],
  variable: "--font-jakarta",
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
    default: "Песок и Металл — pesok-metall.ru",
    template: "%s | pesok-metall.ru",
  },
  description:
    "Металлопрокат, песок и щебень с доставкой по Москве и Московской области в день заказа. Розница и опт.",
  keywords: [
    "арматура",
    "металлопрокат",
    "песок",
    "щебень",
    "доставка",
    "Москва",
    "Московская область",
  ],
  manifest: "/manifest.json",
  applicationName: "Песок-Металл",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Песок-Металл",
  },
  formatDetection: {
    telephone: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${jakarta.variable} ${manrope.variable} ${spaceGrotesk.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen bg-slate-50/40 font-sans text-foreground antialiased">
        <PWARegister />
        <CartProvider variant="vi" showFloatingButton={false}>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
