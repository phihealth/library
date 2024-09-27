// Dependencies
import { setupDevPlatform as setupDevelopmentPlatform } from '@cloudflare/next-on-pages/next-dev';

// Here we use the @cloudflare/next-on-pages next-dev module to allow us to use bindings during local development
// (when running the application with `next dev`), for more information see:
// https://github.com/cloudflare/next-on-pages/blob/5712c57ea7/internal-packages/next-dev/README.md
if(process.env.NODE_ENV === 'development') {
    await setupDevelopmentPlatform();
}

// Next Configuration
/** @type {import('next').NextConfig} */
export const NextConfiguration = {
    optimizeFonts: false, // Do not optimize fonts as we are on Cloudflare not Vercel
    images: {
        unoptimized: true, // Do not optimize images as we are on Cloudflare not Vercel
        minimumCacheTTL: 60 * 60 * 24 * 365, // // Sets cache-control header to 1 year
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'assets.system.inc', // TODO: Update to your assets hostname
                port: '',
                pathname: '/**',
            },
        ],
    },
    webpack(configuration) {
        // Configures webpack to handle SVG files with SVGR. SVGR optimizes and transforms SVG files
        // into React components. See https://react-svgr.com/docs/next/ for more information.

        // Grab the existing rule that handles SVG imports
        const fileLoaderRule = configuration.module.rules.find((rule) => rule.test?.test?.('.svg'));

        configuration.module.rules.push(
            // Reapply the existing rule, but only for svg imports ending in ?url
            {
                ...fileLoaderRule,
                test: /\.svg$/i,
                resourceQuery: /url/, // *.svg?url
            },
            // Convert all other *.svg imports to React components
            {
                test: /\.svg$/i,
                issuer: fileLoaderRule.issuer,
                resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
                use: ['@svgr/webpack'],
            },
            // Add support for importing .md files
            {
                test: /\.md$/,
                type: 'asset/source',
            },
        );

        // Modify the file loader rule to ignore *.svg, since we have it handled now.
        fileLoaderRule.exclude = /\.svg$/i;

        return configuration;
    },
};

// Export - Default
export default NextConfiguration;
