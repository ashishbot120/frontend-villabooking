'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { updateUserState } from '@/app/store/authslice'; 
import api from '@/utils/axiosInstance'; 
import { isAxiosError } from 'axios';
import { User, Home, Loader2 } from 'lucide-react';

const WelcomePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  const handleRoleSelection = async (role: "user" | "host") => {
    setLoading(true);
    setError("");

    // If user, just redirect
    if (role === "user") {
      setLoading(false); 
      router.push("/");
      return;
    }
    
    // If host, update via API
    try {
      const { data } = await api.patch("/users/update-role", { 
        userType: "host" 
      });

      // Dispatch and redirect
      dispatch(updateUserState(data.user));
      router.push("/host/villa");

    } catch (err: unknown) {
      console.error("Role update failed:", err);
      
      let errorMessage = "An unexpected error occurred.";
      
      if (isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0d1a2e] text-slate-200">
      <div className="max-w-md w-full bg-slate-800/50 border border-slate-700/50 p-8 rounded-2xl shadow-xl backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Vigo!</h1>
          <p className="text-slate-400">How would you like to get started?</p>
        </div>
        
        <div className="space-y-4">
          {/* Become a Host Button */}
          <button
            onClick={() => handleRoleSelection('host')}
            disabled={loading}
            className="w-full group relative flex items-center p-4 text-left border border-slate-700/50 rounded-xl hover:border-indigo-500 hover:bg-indigo-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="flex-shrink-0 p-3 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
              <Home size={24} />
            </div>
            <div className="ml-4 flex-grow">
              <h2 className="font-bold text-lg text-white group-hover:text-indigo-200 transition-colors">Become a Host</h2>
              <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">List your property and start earning today.</p>
            </div>
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="animate-spin text-indigo-400" size={20} />
              </div>
            )}
          </button>
          
          {/* Continue as User Button */}
          <button
            onClick={() => handleRoleSelection('user')}
            disabled={loading}
            className="w-full group relative flex items-center p-4 text-left border border-slate-700/50 rounded-xl hover:border-slate-500 hover:bg-slate-700/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="flex-shrink-0 p-3 bg-slate-700/50 rounded-lg text-slate-400 group-hover:bg-slate-600/50 group-hover:text-slate-300 transition-colors">
              <User size={24} />
            </div>
            <div className="ml-4 flex-grow">
              <h2 className="font-bold text-lg text-white group-hover:text-slate-200 transition-colors">Continue as a User</h2>
              <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Explore and book unique villas.</p>
            </div>
          </button>
        </div>
        
        {loading && <p className="mt-6 text-sm text-center text-slate-400 animate-pulse">Updating your profile...</p>}
        {error && (
          <div className="mt-6 p-3 bg-red-900/30 border border-red-800/50 rounded-lg text-sm text-red-300 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomePage;