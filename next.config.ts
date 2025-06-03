import type { NextConfig } from "next";

// Eliminar la configuración para el análisis de bundles
const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  i18n: {
    locales: ['es', 'en', 'pt'],
    defaultLocale: 'es',
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "www.apple.com" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
  modularizeImports: {
    lodash: { transform: 'lodash/{{member}}' },
    '@mui/icons-material': { transform: '@mui/icons-material/{{member}}' },
  },
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
