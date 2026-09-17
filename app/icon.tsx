import { ImageResponse } from "next/og";
import { getBrandedPage } from "@/lib/listing";

const page = getBrandedPage();

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: page.brand.colors.ink,
        color: page.brand.colors.paper,
        display: "flex",
        fontFamily: "serif",
        fontSize: 24,
        fontStyle: "italic",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      {page.property.identity.street.split(" ")[0]?.slice(0, 2)}
    </div>,
    size,
  );
}
