"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import { MapPin, Users, Search, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVillas, selectVillaLoading } from '../store/villaslice';
import { AppDispatch } from '../store/store';

const SearchForm = () => {
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState('');
  const [errors, setErrors] = useState<{ location?: string; guests?: string }>({});

  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(selectVillaLoading);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only auto-search if fields are populated
      if (location || guests) {
        dispatch(fetchVillas({
          location: location || undefined,
          guests: guests ? Number(guests) : undefined,
        }));
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [location, guests, dispatch]);

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
    }));
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-700/50">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        
        {/* Location Section - Takes up 50% width on Desktop */}
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

        {/* Guests + Search Button Section - Takes up remaining 50% width on Desktop */}
        <div className="flex items-start gap-2 col-span-1 md:col-span-2">
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
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3.5 rounded-lg hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[3.5rem]"
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