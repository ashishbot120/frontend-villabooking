import axios from 'axios';

const api = axios.create({
  // FIX: Change 'import.meta.env.MODE' to 'process.env.NODE_ENV'
  baseURL: process.env.NODE_ENV === "development" 
    ? "http://localhost:5000/api" 
    : "https://backend-villabooking.vercel.app/api",
  withCredentials: true,
});

export default api;