import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

import { routing } from "./src/i18n/routing";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const staticExport = process.env.STATIC_EXPORT === "1";
const rawBase = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";
const basePath = rawBase === "" || rawBase === "/" ? undefined : rawBase.replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactCompiler: true,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  ...(staticExport
    ? {
        output: "export" as const,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
  ...(!staticExport
    ? {
        async redirects() {
          return [
            {
              source: "/",
              destination: `/${routing.defaultLocale}/`,
              permanent: false,
            },
          ];
        },
      }
    : {}),
};

export default withNextIntl(nextConfig);
