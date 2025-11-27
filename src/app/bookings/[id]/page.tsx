// app/bookings/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/axiosInstance'; // Adjust path as needed
import { isAxiosError } from 'axios';
import { format } from 'date-fns';
import { Calendar, IndianRupee, MapPin, Hash, User, BedDouble } from 'lucide-react';
import Image from 'next/image'; // <-- IMPORTED

import Navbar from '@/app/components/navbar'; // Adjust path as needed
import { Villa } from '@/types'; // Adjust path as needed

// Define the detailed booking type
interface DetailedBooking {
    _id: string;
    villa: Villa; // Villa is now guaranteed to be populated
    user: {
        _id: string;
        name: string;
        email: string;
    };
    checkIn: string;
    checkOut: string;
    price: number;
    status: string;
    guests: number; // Assuming guests is on your booking model
    createdAt: string;
}

const BookingDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const [booking, setBooking] = useState<DetailedBooking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;

        const fetchBookingDetail = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(
                    `/bookings/${id}`, 
                    { withCredentials: true }
                );
                setBooking(data);
            } catch (err: unknown) { // <-- FIX 1: unknown type
                console.error("Failed to fetch booking details:", err);
                let errorMessage = 'Failed to load booking details.';

                // FIX 1: Use type guard
                if (isAxiosError(err)) { 
                    errorMessage = err.response?.data?.message || err.message;
                    
                    if (err.response?.status === 401 || err.response?.status === 403) {
                        setError(errorMessage + " Redirecting to login...");
                        setTimeout(() => {
                            router.push('/login');
                        }, 2000);
                    } else {
                        setError(errorMessage);
                    }
                } else if (err instanceof Error) {
                    errorMessage = err.message;
                    setError(errorMessage);
                } else {
                    setError(errorMessage);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetail();
    }, [id, router]);

    const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
        <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
            <div className="flex items-center gap-3 text-slate-400">
                {icon}
                <span className="font-medium">{label}</span>
            </div>
            <span className="font-bold text-white text-right">{value}</span>
        </div>
    );

    if (loading) {
        return (
            <div className="bg-[#0d1a2e] text-slate-200 min-h-screen">
                <Navbar />
                <div className="container mx-auto px-4 py-12 text-center">
                    <p>Loading booking details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#0d1a2e] text-slate-200 min-h-screen">
                <Navbar />
                <div className="container mx-auto px-4 py-12 text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h2>
                    <p className="text-red-300">{error}</p>
                    {/* Updated this check to be more robust */}
                    {error.includes("Redirecting") && <p className="text-slate-400 mt-2">Redirecting to login...</p>}
                </div>
            </div>
        );
    }

    if (!booking) return null;

    // Calculate number of nights
    const nights = Math.ceil(
        (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
        <div className="bg-[#0d1a2e] text-slate-200 min-h-screen pb-20">
            <Navbar />
            <main className="container mx-auto px-4 py-12">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">{booking.villa.title}</h1>
                    <div className="flex items-center gap-2 text-slate-400">
                        <MapPin size={16} />
                        <span>{booking.villa.address}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column (Image) */}
                    <div className="lg:col-span-2">
                        
                        {/* --- FIX 2: Replaced <img> with <Image> --- */}
                        <div className="relative w-full h-[450px]">
                            <Image 
                                src={booking.villa.photos?.[0] ?? 'https://via.placeholder.com/800x600'} 
                                alt={booking.villa.title} 
                                fill
                                className="object-cover rounded-2xl bg-slate-800"
                            />
                        </div>
                        {/* ------------------------------------------- */}

                        <div className="mt-8 bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
                            <h3 className="text-2xl font-bold text-white mb-4">About Your Stay</h3>
                            <p className="text-slate-300 leading-relaxed">{booking.villa.description}</p>
                        </div>
                    </div>

                    {/* Right Column (Details) */}
                    <div className="lg:col-span-1 space-y-6 sticky top-24 h-fit">
                        <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-white">Booking Details</h3>
                                <div className={`text-sm font-bold px-3 py-1 rounded-full inline-block ${
                                    booking.status === 'confirmed' 
                                    ? 'bg-green-900/50 text-green-300 border border-green-700' 
                                    : 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                                }`}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <InfoRow 
                                    icon={<Calendar size={18} />}
                                    label="Check-in"
                                    value={format(new Date(booking.checkIn), 'EEE, MMM d, yyyy')}
                                />
                                <InfoRow 
                                    icon={<Calendar size={18} />}
                                    label="Check-out"
                                    value={format(new Date(booking.checkOut), 'EEE, MMM d, yyyy')}
                                />
                                <InfoRow 
                                    icon={<BedDouble size={18} />}
                                    label="Total Nights"
                                    value={nights}
                                />
                                {booking.guests && (
                                    <InfoRow 
                                        icon={<User size={18} />}
                                        label="Guests"
                                        value={booking.guests}
                                    /> 
                                )}
                                <InfoRow 
                                    icon={<IndianRupee size={18} />}
                                    label="Total Price"
                                    value={`₹${booking.price.toLocaleString('en-IN')}`}
                                />
                                <InfoRow 
                                    icon={<Hash size={18} />}
                                    label="Booking ID"
                                    value={booking._id}
                                />
                                <InfoRow 
                                    icon={<User size={18} />}
                                    label="Booked by"
                                    value={booking.user.name}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default BookingDetailPage;