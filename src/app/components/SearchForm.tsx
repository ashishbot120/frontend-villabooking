"use client";

import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { MapPin, Calendar, Users, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="relative">
      <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/30">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
          
          {/* Location */}
          <div className="relative flex-1 min-w-[200px]">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            <input
              type="text"
              placeholder="Where to?"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setErrors(prev => ({ ...prev, location: undefined }));
              }}
              className={`w-full bg-slate-900/50 border rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                errors.location ? 'border-red-500' : 'border-slate-600/50'
              }`}
              aria-label="Search location"
            />
            {errors.location && <p className="absolute -bottom-5 left-0 text-xs text-red-400">{errors.location}</p>}
          </div>

          {/* Dates with Fixed Calendar */}
          <div className="relative flex-1 min-w-[200px]">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" size={20} />
            <button
              ref={dateButtonRef}
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-left transition-all hover:border-slate-500"
            >
              {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Dates'}
            </button>

            {/* Calendar Dropdown - Fixed positioning */}
            {showCalendar && (
              <>
                {/* Backdrop overlay */}
                <div 
                  className="fixed inset-0 z-[100]" 
                  onClick={() => setShowCalendar(false)}
                />
                
                {/* Calendar container */}
                <div
                  ref={calendarRef}
                  className="fixed z-[101] mt-2"
                  style={{
                    top: dateButtonRef.current ? `${dateButtonRef.current.getBoundingClientRect().bottom + window.scrollY + 8}px` : '0',
                    left: dateButtonRef.current ? `${dateButtonRef.current.getBoundingClientRect().left}px` : '0',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl min-w-[320px]">
                    <style jsx global>{`
                      .custom-calendar .rdp {
                        --rdp-cell-size: 42px;
                        margin: 0;
                      }
                      .custom-calendar .rdp-caption {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 0.5rem 0 1rem 0;
                        position: relative;
                      }
                      .custom-calendar .rdp-caption_label {
                        color: white;
                        font-size: 1.125rem;
                        font-weight: 600;
                      }
                      .custom-calendar .rdp-head_cell {
                        color: #94a3b8;
                        font-size: 0.875rem;
                        font-weight: 600;
                        text-transform: uppercase;
                        padding: 0.5rem 0;
                      }
                      .custom-calendar .rdp-cell {
                        padding: 2px;
                      }
                      .custom-calendar .rdp-day {
                        color: white;
                        border-radius: 0.5rem;
                        font-weight: 500;
                        transition: all 0.2s;
                      }
                      .custom-calendar .rdp-day:hover:not(.rdp-day_disabled):not(.rdp-day_selected) {
                        background-color: rgba(100, 116, 139, 0.3);
                      }
                      .custom-calendar .rdp-day_today {
                        font-weight: 700;
                        color: #fb923c;
                      }
                      .custom-calendar .rdp-day_selected {
                        background-color: #f97316 !important;
                        color: white !important;
                        font-weight: 700;
                      }
                      .custom-calendar .rdp-day_disabled {
                        color: #475569;
                        opacity: 0.5;
                        cursor: not-allowed;
                      }
                      .custom-calendar .rdp-day_outside {
                        color: #64748b;
                        opacity: 0.4;
                      }
                      .custom-calendar .rdp-nav {
                        position: absolute;
                        top: 0.5rem;
                        display: flex;
                        gap: 0.5rem;
                      }
                      .custom-calendar .rdp-nav_button {
                        color: #f97316;
                        padding: 0.5rem;
                        border-radius: 0.5rem;
                        transition: all 0.2s;
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      }
                      .custom-calendar .rdp-nav_button:hover {
                        background-color: rgba(100, 116, 139, 0.3);
                      }
                      .custom-calendar .rdp-nav_button_previous {
                        left: 0.5rem;
                      }
                      .custom-calendar .rdp-nav_button_next {
                        right: 0.5rem;
                      }
                      .custom-calendar .rdp-table {
                        width: 100%;
                        max-width: none;
                      }
                      .custom-calendar .rdp-months {
                        width: 100%;
                      }
                      .custom-calendar .rdp-month {
                        width: 100%;
                      }
                    `}</style>
                    <div className="custom-calendar">
                      <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date || undefined);
                          setShowCalendar(false);
                        }}
                        disabled={{ before: new Date() }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Guests */}
          <div className="relative flex-1 min-w-[150px]">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
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
              className={`w-full bg-slate-900/50 border rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                errors.guests ? 'border-red-500' : 'border-slate-600/50'
              }`}
              aria-label="Number of guests"
            />
            {errors.guests && <p className="absolute -bottom-5 left-0 text-xs text-red-400">{errors.guests}</p>}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg shadow-orange-500/30"
            aria-label="Search"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search size={20} />
                <span>Search</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchForm;