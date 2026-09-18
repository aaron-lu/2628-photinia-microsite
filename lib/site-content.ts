import { z } from "zod";

const focalPointSchema = z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) });

const photoSchema = z.object({
  id: z.string().min(1),
  src: z.string().startsWith("/property/"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().min(8),
  caption: z.string().min(1),
  desktopFocus: focalPointSchema.optional(),
  mobile: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("full-frame") }),
    z.object({ kind: z.literal("approved-crop"), focus: focalPointSchema }),
  ]),
});

const agentSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  brokerage: z.string().min(1),
  license: z.string().min(1),
  phone: z.string().min(1),
  email: z.email(),
  initials: z.string().min(1).max(4),
  headshot: z.object({
    src: z.string().startsWith("/agents/"),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    alt: z.string().min(8),
  }).optional(),
});

const resourceSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  url: z.url(),
  mlsAllowed: z.boolean(),
});

export const generatedListingSchema = z
  .object({
    schemaVersion: z.literal(1),
    factoryVersion: z.string().min(1),
    id: z.string().min(1),
    identity: z.object({
      street: z.string().min(1),
      locality: z.string().min(1),
      region: z.string().length(2),
      postalCode: z.string().regex(/^\d{5}$/),
      status: z.string().min(1),
      mls: z.string().min(1),
      verifiedOn: z.string().min(1),
    }),
    price: z.string().min(1),
    facts: z.array(z.object({ id: z.string().min(1).regex(/^[a-z0-9-]+$/), label: z.string().min(1), value: z.string().min(1) })).min(3),
    headline: z.string().min(1),
    introduction: z.string().min(1),
    sections: z.array(z.object({
      title: z.string().min(1),
      body: z.array(z.string().min(1)).min(1),
      photoId: z.string().min(1).optional(),
    })).min(1),
    neighborhood: z.object({
      title: z.string().min(1),
      introduction: z.string().min(1),
      highlights: z.array(resourceSchema),
    }),
    media: z.object({
      heroId: z.string().min(1),
      galleryIds: z.array(z.string().min(1)).min(1),
      photos: z.array(photoSchema).min(1),
    }),
    brand: z.object({
      brokerageName: z.string().min(1),
      wordmark: z.string().min(1),
      agents: z.array(agentSchema).min(1),
      colors: z.object({
        paper: z.string(), ink: z.string(), accent: z.string(), soft: z.string(),
      }),
    }),
    inquiry: z.object({
      heading: z.string().min(1),
      introduction: z.string().min(1),
      defaultMessage: z.string().min(1),
      consentText: z.string().min(1),
      privacyUrl: z.url(),
    }),
    disclosures: z.object({ branded: z.string().min(1), mls: z.string().min(1) }),
    seo: z.object({
      siteUrl: z.url(),
      brandedTitle: z.string().min(1), brandedDescription: z.string().min(1),
      mlsTitle: z.string().min(1), mlsDescription: z.string().min(1),
    }),
  })
  .superRefine((listing, context) => {
    const factIds = new Set<string>();
    for (const [index, fact] of listing.facts.entries()) {
      if (factIds.has(fact.id)) {
        context.addIssue({ code: "custom", path: ["facts", index, "id"], message: "Fact IDs must be unique" });
      }
      factIds.add(fact.id);
    }

    const ids = new Set(listing.media.photos.map((photo) => photo.id));
    const references = [listing.media.heroId, ...listing.media.galleryIds,
      ...listing.sections.flatMap((section) => section.photoId ? [section.photoId] : [])];
    for (const reference of references) {
      if (!ids.has(reference)) {
        context.addIssue({ code: "custom", path: ["media"], message: `Unknown photo reference: ${reference}` });
      }
    }
  });

export type GeneratedListing = z.infer<typeof generatedListingSchema>;
export type PropertyPhoto = GeneratedListing["media"]["photos"][number];

type PublicProperty = Readonly<{
  id: string;
  theme: GeneratedListing["brand"]["colors"];
  identity: GeneratedListing["identity"];
  price: string;
  facts: GeneratedListing["facts"];
  headline: string;
  introduction: string;
  hero: PropertyPhoto;
  gallery: readonly PropertyPhoto[];
  sections: readonly Readonly<{ title: string; body: readonly string[]; photo?: PropertyPhoto }>[];
  neighborhood: Readonly<{
    title: string;
    introduction: string;
    highlights: readonly Readonly<{ title: string; body: string; url: string }>[];
  }>;
}>;

export type BrandedPageModel = Readonly<{
  kind: "branded";
  property: PublicProperty;
  brand: GeneratedListing["brand"];
  inquiry: GeneratedListing["inquiry"];
  disclosure: string;
  metadata: Readonly<{ title: string; description: string }>;
}>;

export type MlsPageModel = Readonly<{
  kind: "mls";
  property: PublicProperty;
  disclosure: string;
  metadata: Readonly<{ title: string; description: string }>;
}>;

export type PageModel = BrandedPageModel | MlsPageModel;

export function findFactValue(facts: GeneratedListing["facts"], id: string) {
  return facts.find((fact) => fact.id === id)?.value;
}

function findPhoto(listing: GeneratedListing, id: string): PropertyPhoto {
  const photo = listing.media.photos.find((candidate) => candidate.id === id);
  if (!photo) throw new Error(`Missing validated photo: ${id}`);
  return photo;
}

function publicProperty(listing: GeneratedListing, audience: "branded" | "mls"): PublicProperty {
  return {
    id: listing.id,
    theme: listing.brand.colors,
    identity: listing.identity,
    price: listing.price,
    facts: listing.facts,
    headline: listing.headline,
    introduction: listing.introduction,
    hero: findPhoto(listing, listing.media.heroId),
    gallery: listing.media.galleryIds.map((id) => findPhoto(listing, id)),
    sections: listing.sections.map((section) => ({
      title: section.title,
      body: section.body,
      ...(section.photoId ? { photo: findPhoto(listing, section.photoId) } : {}),
    })),
    neighborhood: {
      title: listing.neighborhood.title,
      introduction: listing.neighborhood.introduction,
      highlights: listing.neighborhood.highlights
        .filter((highlight) => audience === "branded" || highlight.mlsAllowed)
        .map(({ title, body, url }) => ({ title, body, url })),
    },
  };
}

export function projectListing(listing: GeneratedListing, audience: "branded"): BrandedPageModel;
export function projectListing(listing: GeneratedListing, audience: "mls"): MlsPageModel;
export function projectListing(listing: GeneratedListing, audience: "branded" | "mls"): PageModel {
  if (audience === "mls") {
    return {
      kind: "mls",
      property: publicProperty(listing, audience),
      disclosure: listing.disclosures.mls,
      metadata: { title: listing.seo.mlsTitle, description: listing.seo.mlsDescription },
    };
  }

  return {
    kind: "branded",
    property: publicProperty(listing, audience),
    brand: listing.brand,
    inquiry: listing.inquiry,
    disclosure: listing.disclosures.branded,
    metadata: { title: listing.seo.brandedTitle, description: listing.seo.brandedDescription },
  };
}
