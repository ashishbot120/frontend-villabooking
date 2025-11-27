/** @type {import('next').NextConfig} */

const isDevelopment = process.env.NODE_ENV === 'development';

// 1. Define where the backend lives
const backendApiDestination = isDevelopment
  ? 'http://127.0.0.1:5000/api/:path*'
  : 'https://backend-villabooking.vercel.app/api/:path*';

const nextConfig = {
  // 2. Allow images from external sites (Placeholders + Cloudinary)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Add this if you use Cloudinary!
      },
    ],
  },

  // 3. Security Headers
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

  // 4. The Magic Rewrite (Proxy)
  async rewrites() {
    return [
      {
        source: '/api/:path*', // When frontend asks for /api/...
        destination: backendApiDestination, // Send it to the backend URL
      },
    ];
  },
};

module.exports = nextConfig;




//### **CRITICAL: How this changes your Axios**

//Since you are now using **Rewrites**, you **DO NOT** need the full `https://...` URL in your Axios instance anymore. You can just point to the relative path `/api`.

//**Update your `src/utils/axiosInstance.js` to be super simple:**

//javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // <--- Rewrites will handle the domain automatically!
  withCredentials: true,
});

export default api;