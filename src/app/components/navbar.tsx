'use client';

import React, { useState, useCallback, useEffect } from 'react';
// 1. Import useAppSelector and cart items
import { useAppDispatch, useAppSelector } from '../store/Hooks';
import { logout } from '../store/authslice';
import LoginModal from './login-sign';
// 2. Import Cart Icon
import { Leaf, ShoppingCart } from 'lucide-react'; 
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link'; // <-- 1. IMPORTED
// 3. Import fetchCart to load cart data on nav load
import { fetchCart } from '../store/cartSlice'; 
import { RootState } from '../store/store';

const Navbar = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    
    // 4. Get cart items from Redux store
    const cartItems = useAppSelector((state: RootState) => state.cart.items ?? []);

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    // 5. Fetch cart when user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }, [dispatch, isAuthenticated]);

    const toggleLoginModal = useCallback(() => {
        setIsLoginModalOpen(prev => !prev);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        router.push('/');
    };

    const handleHostLinkClick = (e: React.MouseEvent<HTMLButtonElement>) => { // <-- Changed to HTMLButtonElement
        e.preventDefault();
        const userType = user?.userType?.toLowerCase();

        if (isAuthenticated && user) {
            if (userType === 'host') {
                router.push('/host/villa');
            } else {
                router.push('/welcome');
            }
        } else {
            toggleLoginModal();
        }
    };

    const getLinkClassName = (href: string, isHostLink: boolean = false) => {
        let isActive = false;
        if (isHostLink) {
            isActive = pathname.startsWith('/host') || (pathname === '/welcome' && user?.userType?.toLowerCase() !== 'host');
        } else {
            // 6. Make browse active even on sub-paths like /browse/123
            if (href === '/browse') {
                isActive = pathname.startsWith(href);
            } else {
                isActive = pathname === href;
            }
        }

        return isActive
            ? "text-slate-200 hover:text-white font-medium transition-colors border-b-2 border-orange-500 pb-1" // Active style
            : "text-slate-300 hover:text-white font-medium transition-colors"; // Inactive style
    };

    return (
        <>
            <header className="sticky top-0 z-40 bg-[#0d1a2e]/80 backdrop-blur-sm border-b border-slate-700/50">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-20">

                        {/* Logo */}
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                            <Leaf className="text-white" size={28} />
                            <span className="text-2xl font-bold text-white tracking-wider">OCEANLUXE VILLAS</span>
                        </div>

                        {/* Navigation Links with Dynamic Highlighting */}
                        <nav className="hidden md:flex items-center gap-8">
                            
                            {/* Home Link */}
                            <Link
                                href="/"
                                className={getLinkClassName('/')}
                            >
                                Home
                            </Link>

                            {/* Browse Link */}
                            <Link
                                href="/browse"
                                className={getLinkClassName('/browse')}
                            >
                                Browse
                            </Link>

                            {/* Host Link */}
                            <button
                                type="button"
                                onClick={handleHostLinkClick}
                                className={getLinkClassName('#', true)} 
                            >
                                {isAuthenticated && user?.userType?.toLowerCase() === 'host' ? 'Host Dashboard' : 'Become a Host'}
                            </button>

                            {/* 7. === NEW CART LINK === */}
                            {isAuthenticated && (
                                <Link
                                    href="/cart"
                                    className={getLinkClassName('/cart')}
                                >
                                    <div className="relative flex items-center gap-1.5">
                                        <ShoppingCart size={18} />
                                        <span>Cart</span>
                                        {cartItems.length > 0 && (
                                            <span className="absolute -top-2.5 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                                                {cartItems.length}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            )}
                        </nav>

                        {/* User Profile & Actions (Unchanged) */}
                        <div className="flex items-center gap-4">
                            {isAuthenticated && user ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-600">
                                        <div className="w-full h-full bg-slate-700 flex items-center justify-center text-orange-400 font-bold text-lg">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <span className="text-white font-semibold hidden sm:block">{user.name}</span>
                                    <button onClick={handleLogout} className="bg-slate-700/80 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={toggleLoginModal}
                                    className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-2 px-5 rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            {/* Render the Login Modal (Unchanged) */}
            <LoginModal isOpen={isLoginModalOpen} onClose={toggleLoginModal} />
        </>
    );
};

export default Navbar;