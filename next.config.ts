import type { NextConfig } from "next";


const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mgx-backend-cdn.metadl.com',
        port: '',
        pathname: '/generate/images/**',
      },
    ],
  },
};

export default nextConfig;