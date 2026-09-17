import type { Metadata } from "next";
import { PropertyPage } from "@/components/PropertyPage";
import { getBrandedPage } from "@/lib/listing";
import { findFactValue } from "@/lib/site-content";
import { SITE_URL } from "@/lib/site-url";

const page = getBrandedPage();

export const metadata: Metadata = {
  title: page.metadata.title,
  description: page.metadata.description,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "/",
    title: page.metadata.title,
    description: page.metadata.description,
    siteName: page.property.identity.street,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: page.metadata.title,
    description: page.metadata.description,
  },
};

function numericValue(value: string | undefined) {
  if (!value) return undefined;
  const parsed = Number.parseFloat(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function BrandedRoute() {
  const { property, brand } = page;
  const canonicalUrl = new URL("/", SITE_URL).toString();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${canonicalUrl}#website`,
        url: canonicalUrl,
        name: property.identity.street,
        description: page.metadata.description,
        inLanguage: "en-US",
      },
      {
        "@type": "SingleFamilyResidence",
        "@id": `${canonicalUrl}#property`,
        name: property.identity.street,
        url: canonicalUrl,
        description: property.introduction,
        image: property.gallery.map((photo) => new URL(photo.src, SITE_URL).toString()),
        address: {
          "@type": "PostalAddress",
          streetAddress: property.identity.street,
          addressLocality: property.identity.locality,
          addressRegion: property.identity.region,
          postalCode: property.identity.postalCode,
          addressCountry: "US",
        },
        numberOfBedrooms: numericValue(findFactValue(property.facts, "bedrooms")),
        numberOfBathroomsTotal: numericValue(findFactValue(property.facts, "bathrooms")),
        floorSize: {
          "@type": "QuantitativeValue",
          value: numericValue(findFactValue(property.facts, "interior")),
          unitText: "square feet",
        },
        yearBuilt: numericValue(findFactValue(property.facts, "year-built")),
        offers: {
          "@type": "Offer",
          url: canonicalUrl,
          price: numericValue(property.price),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          seller: {
            "@type": "Organization",
            name: brand.brokerageName,
            employee: brand.agents.map((agent) => ({
              "@type": "Person",
              name: agent.name,
              jobTitle: agent.role,
              telephone: agent.phone,
              email: agent.email,
              identifier: agent.license,
            })),
          },
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <PropertyPage page={page} />
    </>
  );
}
