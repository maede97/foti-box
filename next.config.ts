import { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
};

export default nextConfig;
