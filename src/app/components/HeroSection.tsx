// src/app/components/HeroSection.tsx
import React from 'react';
import SearchForm from './SearchForm';

const HeroSection = () => {
  return (
    <div 
      className="relative h-[450px] rounded-2xl overflow-hidden flex flex-col justify-center items-center text-white text-center p-6 bg-cover bg-center" 
      style={{ backgroundImage: "url('/villa.jpeg')" }} // <-- Use your hero image
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8">
          FIND YOUR PERFECT ESCAPE
        </h1>
        
        <SearchForm />
      </div>
    </div>
  );
};

export default HeroSection;