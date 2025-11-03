'use client'; // Required for useRouter

import React from 'react';
import { format } from 'date-fns'; // <-- 1. IMPORTED
import { CalendarCheck, LayoutList } from 'lucide-react'; // <-- 2. CLEANED IMPORTS
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // <-- 3. IMPORTED

// ... (keep all your existing interfaces: User, Booking, Notification, etc.)
interface User {
  name: string;
}
interface Booking {
  villa: {
    title: string;
    thumbnailUrl: string;
  };
  startDate: string;
  endDate: string;
}
interface Notification {
  id: number;
  message: string;
  read: boolean;
}
interface DashboardSidebarProps {
  user: User | null;
  trip: Booking | null;
  notifications: Notification[];
}
const DashboardCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 ${className}`}>
    {children}
  </div>
);
// ... (keep this component)


const DashboardSidebar = ({ user, trip, notifications }: DashboardSidebarProps) => {
  const router = useRouter(); // Initialize router

  // --- 4. IMPLEMENTED FUNCTION ---
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    // e.g., "Dec 10"
    const startFmt = format(startDate, 'MMM d');
    
    // Check if dates are in the same month (e.g., "Dec 10 - 15")
    if (startDate.getMonth() === endDate.getMonth()) {
        return `${startFmt} - ${format(endDate, 'd')}`;
    }
    
    // Default to "Dec 28 - Jan 3"
    return `${startFmt} - ${format(endDate, 'MMM d')}`;
  };

  return (
    <div className="flex flex-col gap-6 sticky top-24">
      {/* --- Dynamic Welcome Message --- */}
      <DashboardCard>
        {user ? (
          <>
            <h2 className="text-2xl font-bold text-white">Welcome back, {user.name}!</h2>
            <p className="text-slate-400 hover:text-white transition-colors cursor-pointer">My Dashboard</p>
          </>
        ) : (
            <>
            <h2 className="text-2xl font-bold text-white">Your Next Escape Awaits</h2>
            <p className="text-slate-400">Sign in to manage your trips and notifications.</p>
            </>
        )}
      </DashboardCard>
      
      {/* --- Dynamic Upcoming Trip --- */}
      {user && trip && (
        <DashboardCard>
          <h3 className="text-xl font-semibold text-white mb-3">Upcoming Trip</h3>
          <div className="flex gap-4">
            
            {/* --- 5. REPLACED <img> WITH <Image> --- */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <Image 
                src={trip.villa.thumbnailUrl} 
                alt={trip.villa.title} 
                fill
                className="object-cover rounded-lg"
              />
            </div>
            {/* ------------------------------------- */}
            
            <div>
              <h4 className="font-medium text-white">{trip.villa.title}</h4>
              <p className="text-slate-400">{formatDateRange(trip.startDate, trip.endDate)}</p>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* --- Dynamic Notifications --- */}
      {user && (
        <DashboardCard>
           {/* ... (keep the notifications content) ... */}
           {/* Example notifications content to satisfy 'children' prop */}
           <h3 className="text-xl font-semibold text-white mb-3">Notifications</h3>
           <ul>
             {notifications.length === 0 ? (
               <li className="text-slate-400">No notifications</li>
             ) : (
               notifications.map((notification) => (
                 <li key={notification.id} className={`text-slate-300 ${notification.read ? '' : 'font-bold'}`}>
                   {notification.message}
                 </li>
               ))
             )}
           </ul>
        </DashboardCard>
      )}

      {/* --- Quick Actions --- */}
      <div className="grid grid-cols-2 gap-4">
        {/* 2. === UPDATED "LIST YOUR PROPERTY" BUTTON === */}
        <button 
          onClick={() => router.push('/my-listings')}
          className="bg-slate-700/80 text-white font-semibold py-3 rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <LayoutList size={16} />
          My Properties
        </button>
        
        {/* 3. === "MY BOOKINGS" BUTTON (no change) === */}
        <button 
          onClick={() => router.push('/bookings')}
          className="bg-slate-700/80 text-white font-semibold py-3 rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <CalendarCheck size={16} />
          My Bookings
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;