/** @type {import('next').NextConfig} */
const backendHost = process.env.BACKEND_HOST || 'http://localhost:5000';

const nextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'artesaniasyco.com',
                port: '',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/uploads/**',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/uploads/:path*',
                destination: `${backendHost}/uploads/:path*`,
            },
        ];
    },
};

export default nextConfig;
