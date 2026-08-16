import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Logo Market Place",
  description: "Search, preview, and download thousands of professional SVG brand logos.",
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
