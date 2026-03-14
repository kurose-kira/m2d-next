import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "M2D - Mod Manager",
  description: "Browse, search, and manage Minecraft mods from Modrinth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
