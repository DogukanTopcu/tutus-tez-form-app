import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Gemicilerde Beslenme Durumu Anketi",
  description:
    "Gemicilerde beslenme durumu, çok işlenmiş besin tüketimi ve uyku kalitesini değerlendiren halka açık araştırma formu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
