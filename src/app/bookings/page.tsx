'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import api from '@/utils/axiosInstance';
import { Villa } from '@/types'; // Assuming you have this types file
import Link from 'next/link';
import Image from 'next/image'; // <-- 1. IMPORTED

interface Booking {
    _id: string;
    villa: Villa | null; // Allow villa to be null in case it was deleted
    checkIn: string;
    checkOut: string;
    price: number;
    status: string;
}

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                // Use relative path to work with your Next.js proxy
                const { data } = await api.get('/bookings/mybookings', { 
                    withCredentials: true 
                });
                setBookings(data);
            } catch (error) {
                console.error("Failed to fetch bookings:", error); // <-- 2. FIXED
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    // This filter prevents errors if a villa was deleted but the booking still exists
    const validBookings = bookings.filter(booking => booking.villa);

    return (
        <div className="bg-[#0d1a2e] text-slate-200 min-h-screen">
            <Navbar />
            <main className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-white mb-8">My Bookings</h1>
                
                {loading ? <p>Loading your bookings...</p> : (
                    <div className="space-y-6">
                        {validBookings.length > 0 ? validBookings.map(booking => (
                            <Link href={`/bookings/${booking._id}`} key={booking._id}>
                                <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-6
                                                hover:bg-slate-800/80 hover:border-slate-600 transition-all duration-200 cursor-pointer">
                                    
                                    {/* --- 3. UPDATED TO NEXT/IMAGE --- */}
                                    <div className="relative w-full md:w-48 h-40 md:h-32 flex-shrink-0">
                                        <Image 
                                            src={booking.villa?.photos?.[0] ?? 'https://via.placeholder.com/200/475569/94a3b8?text=No+Image'} 
                                            alt={booking.villa?.title ?? 'Photo of the villa'} 
                                            fill
                                            className="object-cover rounded-lg bg-slate-700" 
                                        />
                                    </div>
                                    {/* ---------------------------------- */}
                                    
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{booking.villa?.title}</h2>
                                        <p className="text-slate-400">{booking.villa?.address}</p>
                                        <p className="font-semibold text-slate-300 mt-2">
                                            {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                        </p>
                                        <div className="mt-2 text-sm font-bold bg-green-900/50 text-green-300 border border-green-700 px-3 py-1 rounded-full inline-block">
                                            Status: {booking.status}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="text-center py-20 bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-lg">
                                <h2 className="text-2xl font-semibold text-white">You have no confirmed bookings.</h2>
                                <p className="text-slate-400 mt-2">All your future trips will appear here.</p>
                                <Link href="/browse" className="mt-6 inline-block bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity">
                                    Start Booking
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyBookingsPage;