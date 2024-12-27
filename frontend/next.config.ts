import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    },
    distDir: 'build', // Change the build directory from `.next` to `build`
};

export default nextConfig;
