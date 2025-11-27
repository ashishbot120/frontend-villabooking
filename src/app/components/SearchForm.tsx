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
    setShowDatePicker(false); // Close after selection
  };

  return (
    <div className="min-h-screen bg-[#0a111f] text-slate-200 font-sans selection:bg-orange-500/30">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-[600px] flex items-center justify-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a111f]/80 via-[#0a111f]/40 to-[#0a111f]" />
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 w-full max-w-5xl px-4 flex flex-col items-center text-center">
          
          {/* Hero Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight drop-shadow-2xl"
          >
            FIND YOUR PERFECT <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">
              ESCAPE
            </span>
          </motion.h1>

          {/* --- SEARCH BAR (THE FIX IS HERE) --- */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 relative" // relative is key here if you wanted it to contain, but we want popups to escape
          >
            
            {/* 1. Location Input */}
            <div className="flex-1 bg-[#0d1a2e]/80 rounded-xl px-4 py-3 flex items-center gap-3 border border-transparent focus-within:border-orange-500/50 transition-colors">
              <FiMapPin className="text-orange-400 w-5 h-5 shrink-0" />
              <div className="w-full">
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Where to?</label>
                <input 
                  type="text" 
                  placeholder="Bali, Maldives..." 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent outline-none text-white placeholder:text-slate-500 text-sm font-medium"
                />
              </div>
            </div>

            {/* 2. Date Picker (FIXED) */}
            <div className="relative flex-1">
              <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`w-full h-full bg-[#0d1a2e]/80 rounded-xl px-4 py-3 flex items-center gap-3 border transition-colors text-left ${showDatePicker ? 'border-orange-500' : 'border-transparent'}`}
              >
                <FiCalendar className="text-orange-400 w-5 h-5 shrink-0" />
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dates</label>
                  <span className={`text-sm font-medium ${selectedDate ? 'text-white' : 'text-slate-500'}`}>
                    {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Add dates'}
                  </span>
                </div>
              </button>

              {/* CALENDAR POPUP */}
              <AnimatePresence>
                {showDatePicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    // ✅ CSS FIX: Absolute positioning + High Z-Index + Top-Full (drops down)
                    className="absolute top-full mt-2 left-0 w-80 bg-[#131d33] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 overflow-hidden"
                  >
                    {/* Month Header */}
                    <div className="flex justify-between items-center mb-4">
                      <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                        <FiChevronLeft size={20} />
                      </button>
                      <span className="font-bold text-white">
                        {format(currentDate, 'MMMM yyyy')}
                      </span>
                      <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                        <FiChevronRight size={20} />
                      </button>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-xs font-bold text-slate-500">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {daysInMonth.map((day) => {
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        return (
                          <button
                            key={day.toString()}
                            onClick={() => handleDateSelect(day)}
                            disabled={!isCurrentMonth}
                            className={`
                              h-9 w-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all
                              ${!isCurrentMonth ? 'invisible' : ''}
                              ${isSelected 
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                              }
                              ${isToday(day) && !isSelected ? 'border border-orange-500/50 text-orange-400' : ''}
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

            {/* 3. Guests Input */}
            <div className="flex-1 bg-[#0d1a2e]/80 rounded-xl px-4 py-3 flex items-center gap-3 border border-transparent focus-within:border-orange-500/50 transition-colors">
              <FiUser className="text-orange-400 w-5 h-5 shrink-0" />
              <div className="w-full">
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Guests</label>
                <input 
                  type="number" 
                  min="1"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full bg-transparent outline-none text-white placeholder:text-slate-500 text-sm font-medium"
                />
              </div>
            </div>

            {/* 4. Search Button */}
            <button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 py-3 transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center shrink-0">
              <FiSearch size={24} />
            </button>

          </motion.div>
        </div>
      </div>

      {/* --- LISTINGS SECTION --- */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8 text-white">Featured Villas</h2>
        
        {/* Empty State / Loading */}
        <div className="flex flex-col items-center justify-center py-20 bg-[#0d1a2e] rounded-3xl border border-white/5">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <FiSearch className="text-white/20 w-8 h-8" />
          </div>
          <p className="text-slate-400 text-lg">No villas available at the moment.</p>
          <button className="mt-6 text-orange-400 font-medium hover:text-orange-300 transition-colors">
            Load More
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;