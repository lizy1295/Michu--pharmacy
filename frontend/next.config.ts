import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Separate build output dirs so `next dev` (.next) and `next build` (.next-build)
  // don't overwrite each other when run concurrently — prevents next-font-manifest.json crash.
  distDir: process.env.NEXT_BUILD_DIR ?? '.next',
  transpilePackages: ['@michu/shared'],
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3001/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
