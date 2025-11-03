'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '../store/Hooks';
import { useEffect, useState } from 'react';

export default function RouteProtection({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setIsChecking(false), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    if (isChecking || loading) return;

    // Use toLowerCase() for a reliable, case-insensitive check
    const userType = user?.userType?.toLowerCase();

    console.log('🔍 Route Check:', {
      pathname,
      isAuthenticated,
      userType: userType,
      loading
    });

    const authRoutes = ['/auth/google/callback'];
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // 1. If authenticated but role is NOT set, force user to /welcome.
    if (isAuthenticated && user && !userType && pathname !== '/welcome' && !isAuthRoute) {
      console.log('➡️ Authenticated user with no role, redirecting to /welcome');
      router.push('/welcome');
      return;
    }

    // 2. If not authenticated, block /welcome.
    if (pathname === '/welcome' && !isAuthenticated) {
      console.log('➡️ Not authenticated, cannot access /welcome. Redirecting to /');
      router.push('/');
      return;
    }

    // 3. Protect /host routes.
    if (pathname.startsWith('/host')) {
      if (!isAuthenticated) {
        console.log('➡️ Not authenticated, cannot access /host. Redirecting to /');
        router.push('/');
        return;
      }
      if (userType !== 'host') {
        console.log('➡️ Not a host, cannot access /host. Redirecting to /');
        router.push('/');
        return;
      }
    }

    // 4. REMOVED: No longer automatically redirecting hosts from '/'
    /*
    if (isAuthenticated && userType === 'host' && pathname === '/') {
      console.log('➡️ Host landed on /, redirecting to host dashboard');
      router.push('/host/villa');
      return;
    }
    */

  }, [pathname, user, isAuthenticated, loading, router, isChecking]);

  // Loading state (unchanged)
  if (isChecking || loading) {
    return (
      <div className="min-h-screen bg-[#0d1a2e] flex items-center justify-center">
        <div className="text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
           <p className="text-white/70 text-sm">Checking access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}