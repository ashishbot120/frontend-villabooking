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
              
              {/* Calendar */}
              <div
                ref={calendarRef}
                className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <style jsx global>{`
                  .rdp {
                    --rdp-cell-size: 45px;
                    --rdp-accent-color: #f97316;
                    --rdp-background-color: rgba(249, 115, 22, 0.1);
                    margin: 0;
                  }
                  .rdp-months {
                    justify-content: center;
                  }
                  .rdp-month {
                    width: 100%;
                  }
                  .rdp-caption {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 0.5rem 0 1rem 0;
                    position: relative;
                    margin-bottom: 0.5rem;
                  }
                  .rdp-caption_label {
                    color: white;
                    font-size: 1.125rem;
                    font-weight: 600;
                    z-index: 1;
                  }
                  .rdp-nav {
                    position: absolute;
                    top: 0;
                    display: flex;
                    align-items: center;
                    width: 100%;
                    justify-content: space-between;
                    padding: 0 0.5rem;
                  }
                  .rdp-nav_button {
                    color: #f97316;
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                    transition: all 0.2s;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                  }
                  .rdp-nav_button:hover {
                    background-color: rgba(100, 116, 139, 0.3);
                  }
                  .rdp-nav_button svg {
                    width: 20px;
                    height: 20px;
                  }
                  .rdp-table {
                    width: 100%;
                    max-width: 100%;
                    border-collapse: collapse;
                  }
                  .rdp-head {
                    margin-bottom: 0.5rem;
                  }
                  .rdp-head_cell {
                    color: #94a3b8;
                    font-size: 0.875rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    padding: 0.5rem;
                    text-align: center;
                  }
                  .rdp-tbody {
                    border: none;
                  }
                  .rdp-row {
                    border: none;
                  }
                  .rdp-cell {
                    padding: 2px;
                    text-align: center;
                  }
                  .rdp-day {
                    color: white;
                    border-radius: 0.5rem;
                    font-weight: 500;
                    transition: all 0.2s;
                    width: 100%;
                    height: 100%;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }
                  .rdp-day:hover:not(.rdp-day_disabled):not(.rdp-day_selected) {
                    background-color: rgba(100, 116, 139, 0.3);
                  }
                  .rdp-day_today:not(.rdp-day_selected) {
                    font-weight: 700;
                    color: #fb923c;
                    background-color: rgba(251, 146, 60, 0.1);
                  }
                  .rdp-day_selected,
                  .rdp-day_selected:hover {
                    background-color: #f97316 !important;
                    color: white !important;
                    font-weight: 700;
                  }
                  .rdp-day_disabled {
                    color: #475569;
                    opacity: 0.5;
                    cursor: not-allowed;
                  }
                  .rdp-day_disabled:hover {
                    background-color: transparent;
                  }
                  .rdp-day_outside {
                    color: #64748b;
                    opacity: 0.4;
                  }
                `}</style>
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