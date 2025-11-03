'use client';

import React, { useEffect } from 'react';
import Navbar from "./components/navbar";
import { useAppDispatch, useAppSelector } from './store/Hooks';
import { RootState } from './store/store';
import { fetchVillas } from './store/villaslice';
import HeroSection from './components/HeroSection';
import VillaCarousel from './components/VillaCarousel';
import DashboardSidebar from './components/DashboardSidebar';

export default function HomePage() {
  const dispatch = useAppDispatch();

  // FIXED: Use state.villas (plural), not state.villa
  const { villas, loading, error } = useAppSelector((state: RootState) => state.villas);
  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchVillas({}));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#0d1a2e]">
      <Navbar />

      <div className="container mx-auto px-4 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <main className="w-full lg:w-2/3">
            <HeroSection />
            <div className="mt-12">
              {loading && (
                <p className="text-center text-slate-300 py-10">
                  Loading beautiful homes...
                </p>
              )}
              {error && (
                <p className="text-center text-red-400 py-10">
                  Error: {error}
                </p>
              )}
              {!loading && !error && <VillaCarousel villas={villas} />}
            </div>
          </main>

          <aside className="w-full lg:w-1/3">
            <DashboardSidebar
              user={isAuthenticated ? user : null}
              trip={null}
              notifications={[]}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}