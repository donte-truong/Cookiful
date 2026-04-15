import type { Metadata } from "next";

import "../styles/globals.css";
import { AppProviders } from "../providers/app-providers";

export const metadata: Metadata = {
  title: "The Culinary Editorial",
  description:
    "An editorial cooking experience blending curated recipes, planning, and AI-assisted kitchen orchestration.",
  icons: {
    icon: "/brand/icon.svg",
    shortcut: "/brand/icon.svg",
    apple: "/brand/icon.svg"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
