import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "2628 Photinia Court | Pleasanton Home",
  description:
    "Explore 2628 Photinia Court, a four-bedroom Pleasanton home with double-height living spaces, a garden patio, and community amenities.",
  icons: {
    icon: "/favicon.svg",
  },
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
