"use client";

import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { MapPin, Calendar, Users, Search, Loader2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVillas, selectVillaLoading } from '../store/villaslice';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { AppDispatch } from '../store/store';

const SearchForm = () => {
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [errors, setErrors] = useState<{ location?: string; guests?: string }>({});

  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(selectVillaLoading);
  const calendarRef = useRef<HTMLDivElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        calendarRef.current && !calendarRef.current.contains(e.target as Node) &&
        dateButtonRef.current && !dateButtonRef.current.contains(e.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCalendar]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (location || guests || selectedDate) {
        dispatch(fetchVillas({
          location: location || undefined,
          guests: guests ? Number(guests) : undefined,
          date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
        }));
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [location, guests, selectedDate, dispatch]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!location.trim()) newErrors.location = 'Location required';
    if (!guests || Number(guests) < 1) newErrors.guests = 'Min 1 guest';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    dispatch(fetchVillas({
      location: location || undefined,
      guests: Number(guests),
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
    }));
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-700/50">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        
        {/* Location */}
        <div className="relative col-span-1 md:col-span-2">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Where to?"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setErrors(prev => ({ ...prev, location: undefined }));
            }}
            className={`w-full bg-slate-700/50 border rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
              errors.location ? 'border-red-500' : 'border-slate-600'
            }`}
            aria-label="Search location"
          />
          {errors.location && <p className="absolute -bottom-5 left-0 text-xs text-red-400">{errors.location}</p>}
        </div>

        {/* Dates */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" size={20} />
          <button
            ref={dateButtonRef}
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-left transition-all"
          >
            {selectedDate ? format(selectedDate, 'PPP') : 'Dates'}
          </button>

          {showCalendar && (
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                onClick={() => setShowCalendar(false)}
              />
              
              {/* Calendar Container */}
              <div
                ref={calendarRef}
                className="relative bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date || undefined);
                    setShowCalendar(false);
                  }}
                  disabled={{ before: new Date() }}
                  
                  // FIX for v9: Use 'Chevron' component with orientation prop
                  components={{
                    Chevron: ({ orientation, ...props }) => {
                      switch (orientation) {
                        case "left": 
                          return <ChevronLeft {...props} className="h-4 w-4" />;
                        case "right": 
                          return <ChevronRight {...props} className="h-4 w-4" />;
                        case "up": 
                          return <ChevronUp {...props} className="h-4 w-4" />;
                        case "down": 
                          return <ChevronDown {...props} className="h-4 w-4" />;
                        default: 
                          return <ChevronRight {...props} className="h-4 w-4" />;
                      }
                    }
                  }}
                  
                  // Tailwind Classes for Styling
                  classNames={{
                    months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                    month: 'space-y-4',
                    caption: 'flex justify-center pt-1 relative items-center',
                    caption_label: 'text-sm font-medium text-white',
                    nav: 'space-x-1 flex items-center',
                    nav_button: 'flex items-center justify-center p-1 text-orange-500 hover:bg-slate-800 rounded-md transition-colors border border-transparent hover:border-slate-700',
                    nav_button_previous: 'absolute left-1',
                    nav_button_next: 'absolute right-1',
                    table: 'w-full border-collapse space-y-1',
                    head_row: 'flex',
                    head_cell: 'text-slate-400 rounded-md w-9 font-normal text-[0.8rem]',
                    row: 'flex w-full mt-2',
                    cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-slate-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                    day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-800 text-white rounded-md transition-colors flex items-center justify-center',
                    day_selected: 'bg-orange-500 text-white hover:bg-orange-600 hover:text-white focus:bg-orange-500 focus:text-white rounded-md font-bold',
                    day_today: 'bg-slate-800 text-orange-500 font-bold border border-orange-500/30',
                    day_outside: 'text-slate-600 opacity-50',
                    day_disabled: 'text-slate-600 opacity-50',
                    day_hidden: 'invisible',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Guests + Search */}
        <div className="flex items-start gap-2">
          <div className="relative flex-grow">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="number"
              placeholder="Guests"
              min="1"
              value={guests}
              onChange={(e) => {
                const val = e.target.value;
                setGuests(val);
                if (val && Number(val) >= 1) {
                  setErrors(prev => ({ ...prev, guests: undefined }));
                }
              }}
              className={`w-full bg-slate-700/50 border rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                errors.guests ? 'border-red-500' : 'border-slate-600'
              }`}
              aria-label="Number of guests"
            />
            {errors.guests && <p className="absolute -bottom-5 left-0 text-xs text-red-400">{errors.guests}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3.5 rounded-lg hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label="Search"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;