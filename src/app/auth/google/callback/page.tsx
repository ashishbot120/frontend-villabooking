'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
// ✅ 1. Import useAppSelector
import { useAppDispatch, useAppSelector } from '@/app/store/Hooks';
import { loginWithGoogle } from '@/app/store/authslice';
import toast from 'react-hot-toast';

// This is the core component logic
function GoogleCallback() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // ✅ 2. Get the isAuthenticated state from Redux
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const hasDispatched = useRef(false);

    useEffect(() => {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            toast.error("Google authentication was cancelled.");
            router.push('/'); // Redirect home on cancellation
            return;
        }

        // ✅ 3. Add !isAuthenticated to the critical check
        // This stops the component from re-dispatching if Strict Mode
        // remounts it *after* the first login was successful.
        if (code && !hasDispatched.current && !isAuthenticated) {
            // Set the flag to true immediately
            hasDispatched.current = true;

            const toastId = toast.loading('Finalizing Google sign-in...');

            dispatch(loginWithGoogle(code))
                .unwrap()
                .then((payload) => {
                    toast.dismiss(toastId);
                    toast.success('Successfully logged in!');
                    
                    const userType = payload.user.userType;

                    if (!userType) {
                        console.log('➡️ No userType found, redirecting to /welcome');
                        router.push('/welcome');
                    } else {
                        console.log(`➡️ userType "${userType}" found, redirecting to /`);
                        router.push('/');
                    }
                })
                .catch((err) => {
                    toast.dismiss(toastId);
                    console.error('Login failed after dispatch:', err);
                    toast.error(err || 'Google sign-in failed. Please try again.');
                    router.push('/');
                });
        }
    // ✅ 4. Add isAuthenticated to the dependency array
    }, [dispatch, router, searchParams, isAuthenticated]); // Dependencies are correct

    // Updated UI to match your dark theme
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0d1a2e]">
            <div className="text-center p-8">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-xl font-semibold text-white/90">Finalizing your authentication...</p>
                
                {/* --- THIS IS THE FIX --- */}
                <p className="text-slate-400 mt-2">Please wait, we&apos;re securely signing you in.</p>
            </div>
        </div>
    );
}

// Wrap the main component in Suspense
export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#0d1a2e]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        }>
            <GoogleCallback />
        </Suspense>
    );
}