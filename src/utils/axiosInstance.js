import axios from 'axios';

const api = axios.create({
  // ✅ JUST USE "/api". 
  // Next.js will automatically route this to the correct backend 
  // based on your next.config.js rewrites.
  baseURL: "/api", 
  withCredentials: true,
});

export default api;