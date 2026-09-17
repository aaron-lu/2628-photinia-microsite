import { ImageResponse } from "next/og";
import { getBrandedPage } from "@/lib/listing";
import { findFactValue } from "@/lib/site-content";
import { SITE_URL } from "@/lib/site-url";

const page = getBrandedPage();
const { property, brand } = page;
const streetParts = property.identity.street.split(" ");

export const alt = `${property.identity.street} in ${property.identity.locality}, ${property.identity.region}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const heroUrl = new URL(property.hero.src, SITE_URL).toString();

  return new ImageResponse(
    <div
      style={{
        background: brand.colors.ink,
        color: brand.colors.paper,
        display: "flex",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        width: "100%",
      }}
    >
      <img
        src={heroUrl}
        alt=""
        height="630"
        width="696"
        style={{ height: "100%", objectFit: "cover", objectPosition: "54% 50%", position: "absolute", right: 0, width: "58%" }}
      />
      <div
        style={{
          background: brand.colors.ink,
          borderRight: `8px solid ${brand.colors.accent}`,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "54px 52px 48px",
          position: "relative",
          width: "48%",
        }}
      >
        <div style={{ color: brand.colors.soft, display: "flex", fontSize: 23, letterSpacing: ".08em" }}>{property.identity.locality}, {property.identity.region}</div>
        <div style={{ display: "flex", flex: 1, flexDirection: "column", fontFamily: "serif", fontSize: 80, justifyContent: "center", letterSpacing: "-.045em", lineHeight: .9 }}>
          <span style={{ color: brand.colors.soft, display: "flex", fontSize: 42, fontStyle: "italic", letterSpacing: 0, marginBottom: 12 }}>{streetParts[0]}</span>
          <span style={{ display: "flex", flexWrap: "wrap", maxWidth: 430 }}>{streetParts.slice(1).join(" ")}</span>
        </div>
        <div style={{ borderTop: `1px solid ${brand.colors.soft}`, display: "flex", flexDirection: "column", paddingTop: 20, width: "100%" }}>
          <span style={{ display: "flex", fontFamily: "serif", fontSize: 32, marginBottom: 10 }}>{property.price}</span>
          <span style={{ color: brand.colors.soft, display: "flex", fontSize: 19 }}>{findFactValue(property.facts, "bedrooms")} bedrooms · {findFactValue(property.facts, "bathrooms")} bathrooms · {findFactValue(property.facts, "interior")}</span>
        </div>
      </div>
    </div>,
    size,
  );
}
