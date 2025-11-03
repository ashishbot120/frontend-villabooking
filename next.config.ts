/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV === 'development';
const backendApiDestination = isDevelopment
  ? 'http://127.0.0.1:5000/api/:path*'
  : 'https://backend-villabooking.vercel.app/api/:path*';

const nextConfig = {
  // Your existing headers function

  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },

  // ✅ ADD THIS NEW REWRITES FUNCTION
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Matches all API routes
        destination: backendApiDestination , // Proxies them to your backend
      },
    ];
  },
};

module.exports = nextConfig;