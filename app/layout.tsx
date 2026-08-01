import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dark Sidebar",
  description: "A minimal dark dashboard sidebar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
