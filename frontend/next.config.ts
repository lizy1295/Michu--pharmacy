import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
