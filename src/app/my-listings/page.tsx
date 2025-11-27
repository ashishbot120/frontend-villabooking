// app/my-listings/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import api from '@/utils/axiosInstance';
import { Toaster, toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Import your components and types
import Navbar from '@/app/components/navbar';
import VillaCard from '@/app/components/VillaCard';
import LoginModal from '@/app/components/login-sign'; // Import LoginModal
import { Villa } from '@/types';
import { useAppSelector } from '@/app/store/Hooks';

const MyListingsPage = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const fetchMyVillas = async () => {
      // If user is not authenticated, show login modal instead of redirecting
      if (!isAuthenticated) {
        setLoading(false);
        setIsLoginModalOpen(true);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get('/villas/my-listings', {
          withCredentials: true,
        });
        setVillas(response.data);
      } catch (error) {
        console.error('Failed to fetch your properties:', error);
        toast.error('Failed to fetch your properties.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyVillas();
  }, [isAuthenticated]);

  // Handle redirect to /host/villa when user clicks "List Your First Property"
  const handleListFirstProperty = () => {
    router.push('/host/villa');
  };

  // Handle login modal close
  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
    // Optionally redirect to home if user closes modal without logging in
    router.push('/');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Toaster position="top-right" />
      <Navbar />
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={handleCloseLoginModal}
      />
      
      <div className="container mx-auto p-4 md:p-8">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-white mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          My Properties
        </motion.h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
             <motion.div
              className="text-white text-xl"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Loading your properties...
            </motion.div>
          </div>
        ) : !isAuthenticated ? (
          // Show message when user is not logged in
          <motion.div 
            className="text-center text-slate-400 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-xl mb-4">Please log in to view your properties.</p>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
            >
              Log In
            </button>
          </motion.div>
        ) : villas.length === 0 ? (
          // Show message when user has no properties
          <motion.div 
            className="text-center text-slate-400 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-xl mb-4">You haven&apos;t listed any properties yet.</p>
            <button
              onClick={handleListFirstProperty}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
            >
              List Your First Property
            </button>
          </motion.div>
        ) : (
          // Show villas grid
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {villas.map((villa) => (
              <motion.div key={villa._id} variants={itemVariants}>
                <VillaCard villa={villa} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyListingsPage;