'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/store/store';
import { updateUserState } from '@/app/store/authslice'; // We'll create this action next
import { getCookie } from 'cookies-next';

const WelcomePage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const dispatch = useDispatch()

  const handleRoleSelection = async (role: "user" | "host") => {
    setLoading(true)
    setError("")

    // If the user just wants to continue, no API call is needed.
    if (role === "user") {
      setLoading(false) // was missing; prevents spinner from sticking
      router.push("/")
      return
    }
    
    // If the user wants to become a host, call the backend to update their role.
    try {
      const response = await fetch("/users/update-role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userType: "host" }),
        credentials: "include", // required so browser sends the httpOnly cookie
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.message || "Failed to update role. Please try again.")
      }
      
      const data = await response.json()
      dispatch(updateUserState(data.user))
      router.push("/host/villa")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-black mb-2">Welcome to Vigo!</h1>
        <p className="text-gray-600 mb-8">How would you like to get started?</p>
        
        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelection('host')}
            disabled={loading}
            className="w-full text-left p-6 border rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50"
          >
            <h2 className="font-bold text-lg text-black">Become a Host</h2>
            <p className="text-sm text-gray-500">List your property and start earning today.</p>
          </button>
          
          <button
            onClick={() => handleRoleSelection('user')}
            disabled={loading}
            className="w-full text-left p-6 border rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
          >
            <h2 className="font-bold text-lg text-black">Continue as a User</h2>
            <p className="text-sm text-gray-500">Explore and book unique villas for your next getaway.</p>
          </button>
        </div>
        
        {loading && <p className="mt-4 text-sm text-black">Updating your profile...</p>}
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default WelcomePage;