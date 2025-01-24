/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        staleTimes: {
            dynamic: 0
        }
    },
    eslint: {
        ignoreDuringBuilds: true,
    }
};

export default nextConfig;
