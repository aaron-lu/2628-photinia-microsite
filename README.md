# 2628 Photinia Court property microsite

A photo-first, mobile-responsive review preview for **2628 Photinia Court, Pleasanton, California 94588**.

## Run and verify locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Run the production checks with:

```bash
npm run lint
npm test
npm run build:vercel
```

The static Vercel preview is written to `static-build/`.

## Content model

Listing content lives in `app/property-data.ts`. The typed record contains:

- address, pricing, status, MLS metadata, facts, and editorial narrative;
- hero, gallery, and feature-story media;
- neighborhood highlights and source links;
- optional film, tour, floor-plan, and map modules;
- listing-agent details, disclosures, and theme tokens.

Optional modules render only when both enabled and supplied with a URL. Image sources support project-local publishing paths or qualified remote URLs.

## Research and media provenance

- Current listing details were checked on September 17, 2026 against MLS 41147570, same-day syndication, public records, official agent profiles, HOA materials, and operator sources.
- The approved Drive delivery contained 91 web-resolution JPEGs at 2048 × 1365 pixels. Twenty-two publishing copies are used by this site.
- Four files explicitly marked as digitally altered fireplace variants were excluded. No Drive source file was edited, renamed, moved, or re-shared.
- Property claims were reconciled in a validated research packet before copy was written. The site carries measurement, HOA, solar, EV-readiness, school, and mapped-distance caveats.

## Publication safeguards

- Price, status, availability, HOA dues, brokerage, and agent details require a same-day MLS refresh before production publication.
- Buyers should independently verify measurements, lot area, room and bath counts, levels, condition, permits, solar documentation, EV readiness, HOA matters, school assignment, and map routes.
- The inquiry form is deliberately UI-only. It does not transmit data and must not be connected without an authorized endpoint plus approved consent and privacy language.
- This project is a public review preview, not an official brokerage publication or production listing launch.
