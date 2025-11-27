import axios from 'axios';

// 1. Create the instance
const api = axios.create({
  // If we are in production, use Vercel URL. If in dev, use localhost.
  baseURL: import.meta.env.MODE === "development" 
    ? "http://localhost:5000/api" 
    : "https://backend-villabooking.vercel.app/api", // <--- REPLACE WITH YOUR BACKEND URL
  withCredentials: true, // Important for cookies/sessions
});

// 2. Export it
export default api;