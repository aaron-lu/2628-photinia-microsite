import type { Metadata, Viewport } from "next";
import { getBrandedPage } from "@/lib/listing";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

const page = getBrandedPage();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: page.metadata.title,
  description: page.metadata.description,
  applicationName: page.property.identity.street,
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: page.brand.colors.ink,
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
