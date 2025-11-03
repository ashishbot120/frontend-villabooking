// app/components/HostSelectionModal.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux'; // ✨ 1. Import useSelector
import { RootState } from '../store/store'; // ✨ 2. Import RootState type

interface HostOption { id: 'home' | 'experience' | 'service'; label: string; emoji: string; }
interface HostSelectionModalProps { isOpen: boolean; onClose: () => void; }

const hostOptions: HostOption[] = [
  { id: 'home', label: 'Home', emoji: '🏡' },
  { id: 'experience', label: 'Experience', emoji: '🎈' },
  { id: 'service', label: 'Service', emoji: '🛎️' },
];

const HostSelectionModal: React.FC<HostSelectionModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<HostOption['id'] | null>(null);

  // ✨ 3. Get the authentication status from the Redux store
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isOpen) return null;

  const handleNext = () => {
    if (!selectedOption) return;
    
    // ✨ 4. Add conditional logic based on authentication status
    if (isAuthenticated) {
      // If the user is logged IN, redirect them to the hosting page.
      // We'll map the 'home' option to a 'villa' page as you requested.
      const page = selectedOption === 'home' ? 'villa' : selectedOption;
      router.push(`/host/${page}`);
    } else {
      // If the user is logged OUT, redirect them to the login page.
      router.push(`/LoginHost?type=${selectedOption}`);
    }
    
    onClose(); // Close the modal after starting navigation
  };

  // The JSX for this component remains exactly the same.
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 m-4 max-w-2xl w-full relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-black">&times;</button>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-8 text-black">What would you like to host?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-black">
          {hostOptions.map((option) => (  
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`p-6 border-2 rounded-xl text-center cursor-pointer transition-all duration-200 ${selectedOption === option.id ? 'border-black scale-105 shadow-lg' : 'border-gray-300 hover:border-gray-500'}`}
            >
              <div className="text-6xl mb-4">{option.emoji}</div>
              <p className="font-semibold text-lg">{option.label}</p>
            </button>
          ))}
        </div>
        <div className="flex justify-end border-t pt-4">
          <button onClick={handleNext} disabled={!selectedOption} className="bg-black text-white font-bold py-3 px-6 rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostSelectionModal;