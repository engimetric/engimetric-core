import withBundleAnalyzer from '@next/bundle-analyzer';
import createNextIntlPlugin from 'next-intl/plugin';
import './src/libs/Env';

const withNextIntl = createNextIntlPlugin('./src/libs/i18n.ts');

const bundleAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
export default bundleAnalyzer(
    withNextIntl({
        eslint: {
            dirs: ['.'],
        },
        poweredByHeader: false,
        reactStrictMode: true,
        serverExternalPackages: [],
        matcher: ['/dashboard/:path*'],
        async rewrites() {
            return [
                {
                    source: '/api/:path*',
                    destination: 'http://localhost:1050/api/:path*',
                },
            ];
        },
        headers: async () => [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: 'http://localhost:3000' },
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
                ],
            },
        ],
    }),
);
