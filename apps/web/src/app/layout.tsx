import type { Metadata } from "next";

import "../styles/globals.css";
import { AppProviders } from "../providers/app-providers";

export const metadata: Metadata = {
  title: "The Culinary Editorial",
  description:
    "An editorial cooking experience blending curated recipes, planning, and AI-assisted kitchen orchestration.",
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH}/brand/icon.svg`,
    shortcut: `${process.env.NEXT_PUBLIC_BASE_PATH}/brand/icon.svg`,
    apple: `${process.env.NEXT_PUBLIC_BASE_PATH}/brand/icon.svg`,
  },
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
