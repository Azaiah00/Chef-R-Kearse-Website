import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

export const alt = `${site.name} — Private Chef & Catering`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

/** Matches opengraph-image — logo on brand background for text / Twitter previews. */
export default async function TwitterImage() {
  const logoData = await readFile(
    join(process.cwd(), "public/images/brand/logo-bone.png")
  );
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#12100E",
        }}
      >
        {/* ImageResponse only supports native img for embedded assets. */}
        <img
          src={logoSrc}
          width={920}
          height={260}
          alt=""
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size }
  );
}
