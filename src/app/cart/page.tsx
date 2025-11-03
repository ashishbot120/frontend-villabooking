'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useAppDispatch } from '../store/Hooks';
import { fetchCart, removeFromCart } from '../store/cartSlice';
import { useRouter } from 'next/navigation';
import Navbar from '../components/navbar';
import Link from 'next/link';
import Image from 'next/image'; // <-- IMPORTED
import axios from 'axios';
import Script from 'next/script';
import { FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';

// --- FIX 1: ADDED TYPES ---

// Define what the Razorpay success response looks like
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Define the options object for Razorpay
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void> | void; // Allow async handler
  prefill: {
    name?: string;
    email?: string;
  };
  theme: {
    color: string;
  };
}

// Define the Razorpay instance that gets created
interface RazorpayInstance {
  open: () => void;
}

// Tell TypeScript that window.Razorpay exists and is a constructor
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
// --- END OF TYPES ---

const CartPage = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { items: cartItems, status } = useSelector((state: RootState) => state.cart);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    const handleRemove = (itemId: string) => {
        dispatch(removeFromCart(itemId));
    };

    const handlePayment = async () => {
        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
            console.error("Razorpay Key ID is not defined.");
            toast.error("Payment service is currently unavailable.");
            return;
        }

        try {
            // 1. Create an order on the backend
            const { data } = await axios.post('http://localhost:5000/api/payments/create-order', {}, { withCredentials: true });
            
            const { order, bookingIds } = data;

            // 2. Configure Razorpay options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, // <-- FIX 1: Added '!'
                amount: order.amount,
                currency: "INR",
                name: "OCEANLUXE VILLAS",
                description: "Villa Reservation Payment",
                order_id: order.id,
                handler: async function (response: RazorpayResponse) {
                    // 3. Verify the payment on the backend
                    await axios.post('http://localhost:5000/api/payments/verify', {
                        ...response,
                        bookingIds,
                    }, { withCredentials: true });

                    // 4. On success, refresh cart and navigate to bookings page
                    dispatch(fetchCart());
                    router.push('/bookings');
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: {
                    color: "#f97316" // Orange theme color
                }
            };
            
            // 5. Open the Razorpay modal
            // No 'as any' needed now, since 'options.key' is guaranteed to be a string.
            const rzp = new window.Razorpay(options); // <-- FIX 2: Removed 'as any'
            rzp.open();

        } catch (error) {
            console.error("Payment failed", error);
            toast.error("Payment initiation failed. Please try again.");
        }
    };

    // === FIX 1: Filter out items where the villa data is missing ===
    // This prevents the 'null.title' error
    const validCartItems = cartItems.filter(item => item.villa);

    // === FIX 2: Calculate subtotal based on *only* the valid items ===
    const subtotal = validCartItems.reduce((acc, item) => acc + item.price, 0);

    return (
        <>
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />
            <div className="bg-[#0d1a2e] text-slate-200 min-h-screen">
                <Toaster position="bottom-center" />
                <Navbar />
                <main className="container mx-auto px-4 py-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-4xl font-bold text-white mb-8">Your Cart</h1>
                        
                        {status === 'loading' && <p>Loading cart...</p>}
                        
                        {/* === FIX 3: Check validCartItems.length === */}
                        {status !== 'loading' && validCartItems.length === 0 ? (
                            <div className="text-center py-20 bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-lg">
                                <h2 className="text-2xl font-semibold text-white">Your cart is empty</h2>
                                <p className="text-slate-400 mt-2">Looks like you haven&apos;t added any villas yet.</p> {/* <-- FIX 3 */}
                                <Link href="/browse" className="mt-6 inline-block bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity">
                                    Explore Villas
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-4">
                                    {/* === FIX 4: Map over validCartItems instead of cartItems === */}
                                    {validCartItems.map((item, index) => (
                                        <motion.div 
                                            key={item._id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20, transition: { duration: 0.3 } }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                            className="flex items-center bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl shadow-sm overflow-hidden"
                                        >
                                            
                                            {/* --- FIX 4: Replaced <img> with <Image> --- */}
                                            <div className="relative w-32 h-24 flex-shrink-0">
                                                <Image 
                                                    src={item.villa.photos?.[0] ?? 'https://via.placeholder.com/150/475569/94a3b8?text=No+Image'} 
                                                    alt={item.villa.title}
                                                    fill
                                                    className="object-cover rounded-lg bg-slate-700"
                                                />
                                            </div>
                                            {/* ------------------------------------------- */}

                                            <div className="ml-4 flex-grow">
                                                <h3 className="font-bold text-white">{item.villa.title}</h3>
                                                <p className="text-sm text-slate-400">
                                                    {new Date(item.checkIn).toLocaleDateString()} - {new Date(item.checkOut).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-slate-400">{item.guests} Guest(s)</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-white text-lg">₹{item.price.toLocaleString('en-IN')}</p>
                                                <button onClick={() => handleRemove(item._id)} className="text-red-500 hover:text-red-400 mt-2 p-1 rounded-full hover:bg-slate-700 transition-colors">
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="lg:col-span-1">
                                    <div className="sticky top-28 bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl shadow-lg">
                                        <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-slate-400">
                                                <span>Subtotal</span>
                                                {/* This subtotal is now correctly calculated */}
                                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-400">
                                                <span>Service Fee</span>
                                                <span>₹0</span>
                                            </div>
                                            <hr className="my-2 border-slate-700"/>
                                            <div className="flex justify-between font-bold text-white text-lg">
                                                <span>Total</span>
                                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                        <button onClick={handlePayment} className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-transform transform hover:scale-105">
                                            Pay Now & Confirm Booking
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export default CartPage;