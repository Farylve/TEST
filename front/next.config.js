/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    experimental: {
        outputFileTracingRoot: undefined,
    },
    eslint: {
        ignoreDuringBuilds: true, // Отключает линтинг при сборке
    },
};

module.exports = nextConfig;
