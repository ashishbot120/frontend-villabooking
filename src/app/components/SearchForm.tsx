'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/app/components/navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMapPin, FiCalendar, FiUser, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';

const HomePage = () => {
  // --- Search State ---
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // --- Calendar Logic ---
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  return (
    <div className="min-h-screen bg-[#0a111f] text-slate-200 font-sans selection:bg-orange-500/30">
      <Navbar />

      {/* --- HERO SECTION --- */}
      {/* overflow-visible ensures the popup isn't clipped */}
      <div className="relative w-full h-[700px] flex items-center justify-center overflow-visible z-20">
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a111f]/70 via-[#0a111f]/30 to-[#0a111f]" />
        </div>

        {/* Content Wrapper */}
        <div className="relative z-30 w-full max-w-6xl px-4 flex flex-col items-center text-center">
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-extrabold text-white mb-12 tracking-tight drop-shadow-2xl"
          >
            Find Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-200">
              Perfect Escape
            </span>
          </motion.h1>

          {/* --- NEW PILL SEARCH BAR --- */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            // Changed to rounded-full for the "Pill" look
            className="w-full max-w-4xl bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-0 relative"
          >
            
            {/* 1. Location Input */}
            <div className="flex-1 w-full md:w-auto relative group">
              <div className="flex items-center px-6 py-4 rounded-full transition-colors hover:bg-white/10 cursor-pointer">
                <div className="mr-4 text-orange-400">
                  <FiMapPin size={24} />
                </div>
                <div className="flex-grow text-left">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-0.5">Where</label>
                  <input 
                    type="text" 
                    placeholder="Search destinations" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent outline-none text-white placeholder:text-slate-400 text-base font-medium truncate"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-[1px] h-10 bg-white/20 mx-2" />

            {/* 2. Date Picker */}
            <div className="relative flex-1 w-full md:w-auto">
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`w-full flex items-center px-6 py-4 rounded-full transition-all text-left group hover:bg-white/10 ${showDatePicker ? 'bg-white/10' : ''}`}
              >
                <div className="mr-4 text-orange-400">
                  <FiCalendar size={24} />
                </div>
                <div className="flex-grow">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-0.5">When</label>
                  <span className={`block text-base font-medium truncate ${selectedDate ? 'text-white' : 'text-slate-400'}`}>
                    {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Add dates'}
                  </span>
                </div>
              </button>

              {/* CALENDAR DROPDOWN */}
              <AnimatePresence>
                {showDatePicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    // Centered below the bar, ensuring high Z-Index
                    className="absolute top-[120%] left-1/2 -translate-x-1/2 w-80 md:w-96 bg-[#1a2333] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-6 z-50 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                      <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <FiChevronLeft size={20} />
                      </button>
                      <span className="font-bold text-white text-lg">
                        {format(currentDate, 'MMMM yyyy')}
                      </span>
                      <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <FiChevronRight size={20} />
                      </button>
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-2 text-center mb-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-xs font-bold text-slate-500 uppercase">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {daysInMonth.map((day) => {
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        return (
                          <button
                            key={day.toString()}
                            onClick={() => handleDateSelect(day)}
                            disabled={!isCurrentMonth}
                            className={`
                              h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all relative
                              ${!isCurrentMonth ? 'invisible' : ''}
                              ${isSelected 
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110' 
                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                              }
                              ${isToday(day) && !isSelected ? 'border border-orange-500 text-orange-400' : ''}
                            `}
                          >
                            {format(day, 'd')}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-[1px] h-10 bg-white/20 mx-2" />

            {/* 3. Guests Input */}
            <div className="flex-1 w-full md:w-auto">
              <div className="flex items-center px-6 py-4 rounded-full transition-colors hover:bg-white/10 cursor-pointer">
                <div className="mr-4 text-orange-400">
                  <FiUser size={24} />
                </div>
                <div className="flex-grow text-left">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-0.5">Who</label>
                  <input 
                    type="number" 
                    min="1"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full bg-transparent outline-none text-white placeholder:text-slate-400 text-base font-medium"
                    placeholder="Add guests"
                  />
                </div>
              </div>
            </div>

            {/* 4. Search Button */}
            <div className="p-2">
              <button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white rounded-full p-4 md:px-8 md:py-4 transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95">
                <FiSearch size={24} />
                <span className="hidden md:inline font-bold">Search</span>
              </button>
            </div>

          </motion.div>
        </div>
      </div>

      {/* --- LISTINGS SECTION --- */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <h2 className="text-3xl font-bold mb-8 text-white">Featured Destinations</h2>
        
        {/* Empty State / Loading */}
        <div className="flex flex-col items-center justify-center py-24 bg-[#0f172a]/50 backdrop-blur-sm rounded-3xl border border-white/5">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <FiSearch className="text-white/20 w-10 h-10" />
          </div>
          <p className="text-slate-400 text-xl font-medium">No villas available at the moment.</p>
          <p className="text-slate-500 text-sm mt-2">Try changing your search filters</p>
          <button className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full text-orange-400 font-semibold transition-colors border border-white/10">
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;