/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@alerta/shared"],
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
