import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // <-- 1. IMPORTED
import { BedDouble, Bath, LayoutTemplate } from 'lucide-react';
// Make sure this path to your 'types' file is correct
import { Villa } from '../../types'; 

const VillaCard = ({ villa }: { villa: Villa }) => (
  <div className="group bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-600 hover:shadow-2xl hover:shadow-slate-900/50">
    <Link href={`/villas/${villa._id}`} className="block">
      
      {/* --- 2. UPDATED TO NEXT/IMAGE --- */}
      <div className="relative h-56 overflow-hidden">
        <Image
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
          src={villa.photos[0] || 'https://via.placeholder.com/400x300'}
          alt={`Photo of ${villa.title}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
      {/* --------------------------------- */}
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-white truncate group-hover:text-orange-400 transition-colors">
          {villa.title}
        </h3>
        
        <p className="text-lg font-semibold text-slate-300 mt-1">
          {/* Using en-IN to format the currency correctly */}
          ₹{villa.price.toLocaleString('en-IN')} / night
        </p>
        
        <div className="flex items-center justify-start gap-6 text-sm text-slate-400 mt-4 border-t border-slate-700 pt-4">
          <span className="flex items-center gap-2">
            <LayoutTemplate size={16} /> {villa.area.toLocaleString('en-IN')} sq ft
          </span>
          <span className="flex items-center gap-2">
            <BedDouble size={16} /> {villa.bedrooms} Beds
          </span>
          <span className="flex items-center gap-2">
            <Bath size={16} /> {villa.bathrooms} Baths
          </span>
        </div>
      </div>
    </Link>
  </div>
);

export default VillaCard;