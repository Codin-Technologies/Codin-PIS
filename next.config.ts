import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/swagger": ["./public/openapi.json"],
  },
};

export default nextConfig;
