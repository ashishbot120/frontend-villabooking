'use client';

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import Navbar from '../components/navbar';
// --- 1. IMPORT YOUR NEW, STYLED VILLACARD ---
import VillaCard from '../components/VillaCard'; // Adjust this path if needed
import { Villa } from '../../types'; // Import the main Villa type

// --- 2. UPDATE THE VILLA TYPE TO MATCH YOUR CARD ---
//    (Or, if your imported 'Villa' type already has these, you can skip this)
interface ISearchVilla extends Villa {
  _id: string;
  title: string;
  photos: string[];
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
}

// This is the skeleton loader component
const VillaSkeleton = () => (
  <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl animate-pulse">
    <div className="w-full h-56 bg-slate-700 rounded-lg mb-4"></div>
    <div className="h-6 w-3/4 bg-slate-700 rounded-md mb-3"></div>
    <div className="h-5 w-1/3 bg-slate-700 rounded-md mb-5"></div>
    <div className="border-t border-slate-700 pt-4 flex gap-6">
        <div className="h-4 w-1/4 bg-slate-700 rounded-md"></div>
        <div className="h-4 w-1/4 bg-slate-700 rounded-md"></div>
        <div className="h-4 w-1/4 bg-slate-700 rounded-md"></div>
    </div>
  </div>
);

// --- 3. WE REMOVED THE OLD/SIMPLE VILLACARD FROM HERE ---


const BrowsePage = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Use the updated Villa type for your results
  const [results, setResults] = useState<ISearchVilla[]>([]); 
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return; 

    setIsLoading(true);
    setResults([]); 
    setHasSearched(true); 

    try {
      const response = await fetch(`/villas/ai-search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: ISearchVilla[] = await response.json();
      setResults(data); 

    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-[#0d1a2e] text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto pt-16 md:pt-24">
        
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-slate-100">
          Describe Your Perfect Villa
        </h1>

        {/* Search Form (no changes) */}
        <form onSubmit={handleSearch} className="relative w-full max-w-3xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., a quiet villa with a private pool near the beach..."
            className="w-full p-4 pl-6 pr-36 md:pr-40 h-16 bg-slate-800/50 border border-slate-700 rounded-full text-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-orange-500/80 focus:border-orange-500 focus:outline-none transition-all duration-300 shadow-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-12 px-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Search size={20} />
            )}
            <span className="hidden md:inline">Find</span>
          </button>
        </form>

        {/* Results Area */}
        <div className="mt-12">
          {isLoading && (
            <div>
              <p className="text-center text-slate-400 text-lg mb-8">
                Finding villas that match your vibe...
              </p>
              {/* --- 4. USE YOUR NEW SKELETON --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <VillaSkeleton />
                <VillaSkeleton />
                <VillaSkeleton />
              </div>
            </div>
          )}

          {/* Show results */}
          {!isLoading && results.length > 0 && (
            // --- 5. RENDER USING YOUR NEW VILLACARD ---
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {results.map(villa => (
                <VillaCard key={villa._id} villa={villa as Villa} />
              ))}
            </div>
          )}

          {/* Show "No results" message */}
          {!isLoading && results.length === 0 && hasSearched && (
              <p className="text-center text-slate-400 text-lg">
                No villas found matching your description.
              </p>
          )}

        </div>
      </div>
    </div>
    </>
  );
};

export default BrowsePage;