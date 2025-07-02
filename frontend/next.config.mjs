/** @type {import('next').NextConfig} */
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
                destination: 'http://backend:5000/uploads/:path*',
            },
        ];
    },
};

export default nextConfig;
