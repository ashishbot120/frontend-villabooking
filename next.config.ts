/** @type {import('next').NextConfig} */
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
        destination: 'http://127.0.0.1:5000/api/:path*', // Proxies them to your backend
      },
    ];
  },
};

module.exports = nextConfig;