'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // <-- IMPORTED
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/Hooks';
import { loginUser, signupUser } from '@/app/store/authslice'; // <-- FIXED
import toast from 'react-hot-toast';

const LoginModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Get auth state from Redux
    const { loading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

    const [isLoginView, setIsLoginView] = useState(true);
    const [loginFormData, setLoginFormData] = useState({ email: '', password: '' });
    const [signupFormData, setSignupFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value });
    };

    const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSignupFormData({ ...signupFormData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🔐 Login form submitted');

        try {
            await dispatch(loginUser(loginFormData)).unwrap();
            console.log('✅ Login successful!');
            toast.success('Login successful!');
            // Redirection is handled by the useEffect hook below
        } catch (err: unknown) { // <-- FIXED
            console.error('❌ Login failed:', err);
            const message = typeof err === 'string' ? err : 'Login failed'; // <-- FIXED
            toast.error(message);
        }
    };

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('📝 Signup form submitted');

        try {
            await dispatch(signupUser(signupFormData)).unwrap();
            console.log('✅ Signup successful!');
            toast.success('Signup successful! Redirecting...');
             // Redirection is handled by the useEffect hook below
        } catch (err: unknown) { // <-- FIXED
            console.error('❌ Signup failed:', err);
            const message = typeof err === 'string' ? err : 'Signup failed'; // <-- FIXED
            toast.error(message);
        }
    };

    const handleGoogleRedirect = () => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        // Ensure this matches exactly what's in your Google Cloud Console
        const redirectUri = 'http://localhost:3000/auth/google/callback';
        const scope = 'openid email profile';

        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

        console.log('🔐 Redirecting to Google OAuth...');
        window.location.href = googleAuthUrl;
    };

    // --- REDIRECT LOGIC ---
    useEffect(() => {
        // Only run redirect logic if the modal was open when auth state changed
        if (isAuthenticated && user && isOpen) {
            console.log('🔐 LoginModal: Auth successful, checking role...');
            console.log('👤 LoginModal: User data:', user);

            onClose(); // Close the modal first

            // Use a short delay to ensure modal is closed before redirect
            setTimeout(() => {
                const userType = user.userType?.toLowerCase(); // Use case-insensitive check

                // If user has NO role yet (e.g., new signup)
                if (!userType) {
                    console.log('➡️ LoginModal: No userType found, redirecting to /welcome');
                    router.push('/welcome');
                }
                // If user HAS a role (host or user)
                else {
                    console.log(`➡️ LoginModal: userType "${userType}" found, redirecting to /`);
                    router.push('/'); // Always redirect to home page
                                      // RouteProtection will handle redirecting hosts from there
                }
            }, 100);
        }
    // Dependency array includes isOpen to prevent running on every page load
    }, [isAuthenticated, user, router, onClose, isOpen]);

    // Don't render anything if the modal is closed
    if (!isOpen) return null;

    // --- JSX for the Modal ---
    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose} // Close modal if backdrop is clicked
        >
            <div
                className="bg-[#0d1a2e] border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm p-8 relative"
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-2xl text-slate-400 hover:text-white transition"
                >
                    &times;
                </button>

                {/* Conditional Rendering: Login or Signup View */}
                {isLoginView ? (
                    // --- Login View ---
                    <div>
                        <h2 className="text-2xl font-bold text-center mb-6 text-white">
                            Welcome to OCEANLUXE
                        </h2>
                        <form className="space-y-4" onSubmit={handleLoginSubmit}>
                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={loginFormData.email}
                                    onChange={handleLoginChange}
                                    className="mt-1 block w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50 text-white px-3 py-2"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={loginFormData.password}
                                    onChange={handleLoginChange}
                                    className="mt-1 block w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50 text-white px-3 py-2"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-md shadow-md hover:opacity-90 disabled:opacity-50 transition"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Continue'}
                            </button>
                        </form>

                        {/* Error Message */}
                        {error && <p className="mt-2 text-center text-red-400 text-sm">{error}</p>}

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-[#0d1a2e] px-2 text-slate-500">Or</span>
                            </div>
                        </div>

                        {/* Google Sign-In Button */}
                        <button
                            onClick={handleGoogleRedirect}
                            className="w-full py-2.5 px-4 bg-slate-700 border border-slate-600 text-white font-semibold rounded-md shadow-sm hover:bg-slate-600 transition flex items-center justify-center gap-2"
                        >
                            <Image
                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                alt="Google logo"
                                width={20}
                                height={20}
                            />
                            <span>Continue with Google</span>
                        </button>

                        {/* Switch to Signup View Link */}
                        <p className="mt-6 text-center text-sm text-slate-400">
                            Not a member?{' '}
                            <span
                                className="text-orange-400 font-medium cursor-pointer hover:underline"
                                onClick={() => setIsLoginView(false)}
                            >
                                Sign up
                            </span>
                        </p>
                    </div>
                ) : (
                    // --- Signup View ---
                    <div>
                        <h2 className="text-2xl font-bold text-center mb-6 text-white">
                            Sign up for OCEANLUXE
                        </h2>
                        <form className="space-y-3" onSubmit={handleSignupSubmit}>
                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={signupFormData.name}
                                    onChange={handleSignupChange}
                                    className="mt-1 block w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50 text-white px-3 py-2"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={signupFormData.email}
                                    onChange={handleSignupChange}
                                    className="mt-1 block w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50 text-white px-3 py-2"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={signupFormData.password}
                                    onChange={handleSignupChange}
                                    className="mt-1 block w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50 text-white px-3 py-2"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                             {/* Phone Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={signupFormData.phone}
                                    onChange={handleSignupChange}
                                    className="mt-1 block w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50 text-white px-3 py-2"
                                    placeholder="123-456-7890"
                                    required
                                />
                            </div>
                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-md shadow-md hover:opacity-90 disabled:opacity-50 transition"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Sign Up'}
                            </button>
                        </form>

                         {/* Error Message */}
                        {error && <p className="mt-2 text-center text-red-400 text-sm">{error}</p>}

                         {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-[#0d1a2e] px-2 text-slate-500">Or</span>
                            </div>
                        </div>

                         {/* Google Sign-In Button */}
                        <button
                            onClick={handleGoogleRedirect}
                            className="w-full py-2.5 px-4 bg-slate-700 border border-slate-600 text-white font-semibold rounded-md shadow-sm hover:bg-slate-600 transition flex items-center justify-center gap-2"
                        >
                            <Image
                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                alt="Google logo"
                                width={20}
                                height={20}
                            />
                            <span>Continue with Google</span>
                        </button>

                         {/* Switch to Login View Link */}
                        <p className="mt-6 text-center text-sm text-slate-400">
                            Already have an account?{' '}
                            <span
                                className="text-orange-400 font-medium cursor-pointer hover:underline"
                                onClick={() => setIsLoginView(true)}
                            >
                                Log in
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginModal;