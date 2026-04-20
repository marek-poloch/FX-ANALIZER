/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // "standalone" is required for the Docker image but needs symlink perms
  // on Windows. Enabled only when NEXT_OUTPUT_STANDALONE=1 (set in Dockerfile).
  output: process.env.NEXT_OUTPUT_STANDALONE === "1" ? "standalone" : undefined,
  transpilePackages: ["@fxradar/shared-types"],
};

export default nextConfig;
