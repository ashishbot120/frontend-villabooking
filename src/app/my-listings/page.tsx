// app/my-listings/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import api from '@/utils/axiosInstance'; // <-- FIX 1: Use axios instance
import { Toaster, toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Import your components and types
import Navbar from '@/app/components/navbar';
import VillaCard from '@/app/components/VillaCard'; // Adjust path to your VillaCard
import { Villa } from '@/types'; // Adjust path to your types
import { useAppSelector } from '@/app/store/Hooks'; // Adjust path to your store hooks

const MyListingsPage = () => {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyVillas = async () => {
      if (!user) {
        toast.error('Please log in to view your properties.');
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await api.get('/villas/my-listings', {
          withCredentials: true,
        });
        setVillas(response.data);
      } catch (error) {
        console.error('Failed to fetch your properties:', error); // <-- FIX 1
        toast.error('Failed to fetch your properties.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyVillas();
  }, [user, router]);

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
        ) : villas.length === 0 ? (
          <motion.div 
            className="text-center text-slate-400 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-xl mb-4">You haven&apos;t listed any properties yet.</p> {/* <-- FIX 2 */}
            <button
              onClick={() => router.push('/create-listing')} // Adjust if your create page has a different route
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
            >
              List Your First Property
            </button>
          </motion.div>
        ) : (
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