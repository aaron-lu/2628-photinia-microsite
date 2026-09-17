import type { Metadata } from "next";
import { PropertyPage } from "@/components/PropertyPage";
import { getMlsPage } from "@/lib/listing";

const page = getMlsPage();

export const metadata: Metadata = {
  title: page.metadata.title,
  description: page.metadata.description,
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};

export default function MlsRoute() {
  return <PropertyPage page={page} />;
}
