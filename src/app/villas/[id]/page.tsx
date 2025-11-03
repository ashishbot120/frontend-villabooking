'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence, cubicBezier } from 'framer-motion';
import { addDays, parseISO } from 'date-fns';
import { toast, Toaster } from 'react-hot-toast';
import Image from 'next/image';

// Components & Store
import Navbar from '@/app/components/navbar';
import { useAppDispatch, useAppSelector } from '@/app/store/Hooks';
import { addToCart } from '@/app/store/cartSlice';
import { Villa } from '@/types';

// Extended types to handle host as either string or object
interface ExtendedVilla extends Omit<Villa, 'host'> {
  host: string | { _id: string; name: string };
}

interface ExtendedUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
}

// Date Libraries
import { DateRangePicker, Range } from 'react-date-range';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import 'react-day-picker/dist/style.css';

// Icons
import {
  FiWifi, FiWind, FiTv, FiMapPin, FiTrash2, FiSave, FiXCircle,
  FiCalendar, FiEdit, FiUsers, FiShoppingCart, FiX, FiUpload
} from 'react-icons/fi';
import { FaKitchenSet, FaTree, FaCar, FaUmbrellaBeach } from 'react-icons/fa6';
import {
  MdPool, MdVilla, MdLocationOn, MdKingBed, MdBathroom,
  MdFitnessCenter, MdSpa, MdTheaters
} from 'react-icons/md';
import { GiBarbecue } from 'react-icons/gi';
import { BsTextareaResize } from 'react-icons/bs';

// ==================== AMENITY ICON MAPPING ====================
const amenityIconMap: { [key: string]: { icon: React.ReactNode; label: string } } = {
  wifi: { icon: <FiWifi className="w-6 h-6" />, label: 'Wi-Fi' },
  pool: { icon: <MdPool className="w-6 h-6" />, label: 'Swimming Pool' },
  kitchen: { icon: <FaKitchenSet className="w-6 h-6" />, label: 'Full Kitchen' },
  ac: { icon: <FiWind className="w-6 h-6" />, label: 'Air Conditioning' },
  parking: { icon: <FaCar className="w-6 h-6" />, label: 'Free Parking' },
  tv: { icon: <FiTv className="w-6 h-6" />, label: 'Television' },
  garden: { icon: <FaTree className="w-6 h-6" />, label: 'Garden or Yard' },
  bbq: { icon: <GiBarbecue className="w-6 h-6" />, label: 'BBQ Grill' },
  gym: { icon: <MdFitnessCenter className="w-6 h-6" />, label: 'Gym' },
  spa: { icon: <MdSpa className="w-6 h-6" />, label: 'Spa' },
  privateBeach: { icon: <FaUmbrellaBeach className="w-6 h-6" />, label: 'Private Beach' },
  cinema: { icon: <MdTheaters className="w-6 h-6" />, label: 'Cinema Room' },
};

// ==================== ANIMATION VARIANTS ====================
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const slideInRight = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: cubicBezier(0.25, 0.1, 0.25, 1) }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: cubicBezier(0.25, 0.1, 0.25, 1) }
  }
};

const slideInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: cubicBezier(0.25, 0.1, 0.25, 1) }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: cubicBezier(0.25, 0.1, 0.25, 1) }
  }
};

// ==================== LIGHT TRAIL EFFECT ====================
const LightTrail = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute top-0 left-0 w-1 h-1 bg-orange-300 rounded-full pointer-events-none"
    style={{ opacity: 0, filter: 'blur(2px)' }}
    animate={{
      x: [0, Math.random() * 500 - 250, 0],
      y: [0, Math.random() * 800 - 400, 0],
      opacity: [0, 0.6, 0],
      scale: [1, 1.5, 1],
    }}
    transition={{
      duration: 15 + Math.random() * 10,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'linear',
      delay,
    }}
  />
);

// ==================== INPUT COMPONENTS ====================
const InputWithIcon = ({ icon, ...props }: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <motion.div 
    className="relative flex items-center"
    whileHover={{ scale: 1.01 }}
    transition={{ duration: 0.2 }}
  >
    <div className="absolute left-4 text-orange-400 pointer-events-none">{icon}</div>
    <input
      {...props}
      className="w-full p-4 pl-12 bg-black/20 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all placeholder-white/50 text-white"
    />
  </motion.div>
);

const EssentialInput = ({ label, icon, ...props }: { label: string; icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <motion.div 
    className="p-3 bg-black/20 border border-white/20 rounded-lg"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <label className="text-xs font-semibold text-white/70 flex items-center gap-2">
      {icon} {label}
    </label>
    <input
      type="number"
      {...props}
      className="w-full mt-2 bg-transparent text-2xl font-bold outline-none placeholder-white/50 text-white"
    />
  </motion.div>
);

// ==================== PHOTO GALLERY ====================
const PhotoGallery = ({ photos }: { photos: string[] }) => {
  const [mainPhoto, setMainPhoto] = useState(photos[0]);

  if (!photos || photos.length === 0) return null;

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <motion.div 
        className="relative h-[350px] md:h-[500px] w-full overflow-hidden rounded-2xl shadow-2xl border border-gray-700"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          key={mainPhoto}
          className="h-full w-full relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={mainPhoto}
            alt="Main view"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </motion.div>
      <motion.div 
        className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {photos.slice(0, 5).map((photo, index) => (
          <motion.div
            key={index}
            variants={scaleIn}
            className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 aspect-square relative ${
              photo === mainPhoto ? 'border-indigo-600 scale-105 shadow-xl' : 'border-transparent hover:border-gray-600'
            }`}
            onClick={() => setMainPhoto(photo)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image 
              src={photo} 
              alt={`Thumbnail ${index + 1}`} 
              fill
              className="object-cover"
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

// ==================== AMENITY ITEM ====================
const AmenityItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <motion.div
    className="flex items-center text-gray-300 bg-gray-800 p-4 rounded-xl transition-all duration-300 hover:bg-gray-700 hover:shadow-md"
    whileHover={{ scale: 1.05, backgroundColor: '#374151' }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="text-indigo-500">{icon}</div>
    <span className="ml-4 font-medium">{text}</span>
  </motion.div>
);

// ==================== AVAILABILITY MODAL ====================
const AvailabilityModal = ({
  villaId,
  existingRanges,
  isOpen,
  onClose,
  onSave,
}: {
  villaId: string;
  existingRanges: ExtendedVilla['unavailability'];
  isOpen: boolean;
  onClose: () => void;
  onSave: (villa: ExtendedVilla) => void;
}) => {
  const [state, setState] = useState<Range[]>([
    { startDate: new Date(), endDate: addDays(new Date(), 7), key: 'selection' },
  ]);

  const handleSave = async () => {
    const newRange = {
      startDate: state[0].startDate!.toISOString(),
      endDate: state[0].endDate!.toISOString(),
    };
    try {
      const response = await axios.post(`/api/villas/${villaId}/unavailability`, newRange, {
        withCredentials: true,
      });
      onSave(response.data);
      toast.success('Availability updated!');
      onClose();
    } catch {
      toast.error('Could not update availability.');
    }
  };

  const disabledDates = existingRanges.flatMap((range: { startDate: string; endDate: string }) => {
    const dates = [];
    const currentDate = parseISO(range.startDate);
    const endDate = parseISO(range.endDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-2xl font-bold text-white">Block Unavailable Dates</h3>
              <p className="text-gray-400 text-sm mt-1">
                Select the date range when your villa will be unavailable
              </p>
            </div>
            <div className="p-6 flex justify-center date-range-picker-wrapper">
              <DateRangePicker
                onChange={(item) => setState([item.selection])}
                moveRangeOnFirstSelection={false}
                months={2}
                ranges={state}
                direction="horizontal"
                minDate={new Date()}
                disabledDates={disabledDates}
              />
            </div>
            <div className="flex justify-end gap-4 px-6 pb-6">
              <motion.button
                onClick={onClose}
                className="bg-gray-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-500 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSave}
                className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-all shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: '0px 0px 20px rgba(99, 102, 241, 0.5)' }}
                whileTap={{ scale: 0.95 }}
              >
                Save Dates
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==================== HOST CONTROLS ====================
const HostControls = ({
  villa,
  onEditClick,
  onAvailabilityUpdate,
}: {
  villa: ExtendedVilla;
  onEditClick: () => void;
  onAvailabilityUpdate: (villa: ExtendedVilla) => void;
}) => {
  const router = useRouter();
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this listing?')) {
      try {
        await axios.delete(`/api/villas/${villa._id}`, { withCredentials: true });
        toast.success('Villa deleted successfully.');
        router.push('/');
      } catch {
        toast.error('Failed to delete villa.');
      }
    }
  };

  return (
    <>
      <AvailabilityModal
        villaId={villa._id}
        isOpen={isCalendarOpen}
        onClose={() => setCalendarOpen(false)}
        existingRanges={villa.unavailability}
        onSave={onAvailabilityUpdate}
      />
      <motion.div
        className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700"
        variants={slideInLeft}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-xl font-bold text-white mb-4 text-center">Host Dashboard</h2>
        <div className="space-y-3">
          <motion.button
            onClick={onEditClick}
            className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-3 rounded-lg hover:bg-gray-500 transition-all"
            whileHover={{ scale: 1.05, backgroundColor: '#4b5563' }}
            whileTap={{ scale: 0.95 }}
          >
            <FiEdit /> Edit Details
          </motion.button>
          <motion.button
            onClick={() => setCalendarOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition-all"
            whileHover={{ scale: 1.05, backgroundColor: '#059669' }}
            whileTap={{ scale: 0.95 }}
          >
            <FiCalendar /> Manage Availability
          </motion.button>
          <motion.button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all"
            whileHover={{ scale: 1.05, backgroundColor: '#b91c1c' }}
            whileTap={{ scale: 0.95 }}
          >
            <FiTrash2 /> Delete Listing
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

// ==================== BOOKING WIDGET WITH FALLBACK ====================
const BookingWidget = ({ villa }: { villa: ExtendedVilla }) => {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState(1);
  const [guestError, setGuestError] = useState('');
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [tempMaxGuests, setTempMaxGuests] = useState('');
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Maximum guests - with intelligent fallback
  const getMaxGuests = (): number => {
    if (villa.guests && villa.guests > 0) {
      return villa.guests;
    }
    // Fallback calculation: bedrooms * 2 (common hotel standard)
    return Math.max(villa.bedrooms * 2, 2);
  };

  const maxGuests = getMaxGuests();
  const hasExplicitGuestLimit = villa.guests && villa.guests > 0;

  let numberOfNights = 0;
  if (range?.from && range?.to) {
    const diffTime = Math.abs(range.to.getTime() - range.from.getTime());
    numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const disabledDays = villa.unavailability.map((d: { startDate: string; endDate: string }) => ({
    from: parseISO(d.startDate),
    to: parseISO(d.endDate),
  }));

  const handleGuestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setGuestError('');
    
    if (value < 1) {
      setGuests(1);
      setGuestError('Minimum 1 guest required');
      return;
    }
    
    if (value > maxGuests) {
      setGuests(maxGuests);
      setGuestError(`Maximum ${maxGuests} guest${maxGuests > 1 ? 's' : ''} allowed`);
      toast.error(`This villa can accommodate up to ${maxGuests} guest${maxGuests > 1 ? 's' : ''} only`);
      return;
    }
    
    setGuests(value);
  };

  const handleGuestBlur = () => {
    if (guests < 1) {
      setGuests(1);
      setGuestError('Minimum 1 guest required');
    } else if (guests > maxGuests) {
      setGuests(maxGuests);
      setGuestError(`Maximum ${maxGuests} guest${maxGuests > 1 ? 's' : ''} allowed`);
      toast.error(`This villa can accommodate up to ${maxGuests} guest${maxGuests > 1 ? 's' : ''} only`);
    }
  };

  const handleUpdateCapacity = async () => {
    const newCapacity = Number(tempMaxGuests);
    
    if (!newCapacity || newCapacity < 1 || newCapacity > 50) {
      toast.error('Please enter a valid capacity between 1 and 50');
      return;
    }

    try {
      await axios.put(
        `/api/villas/${villa._id}`,
        { guests: newCapacity },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      
      // Update local villa state
      villa.guests = newCapacity;
      setShowCapacityModal(false);
      toast.success(`Guest capacity updated to ${newCapacity}`);
    } catch {
      toast.error('Failed to update guest capacity');
    }
  };

  const handleAddToCart = () => {
    if (!currentUser) {
      toast.error('Please log in to add items to your cart.');
      router.push('/login');
      return;
    }
    
    if (!range?.from || !range?.to || numberOfNights <= 0) {
      toast.error('Please select a valid date range.');
      return;
    }
    
    if (guests < 1) {
      toast.error('At least 1 guest is required.');
      setGuestError('Minimum 1 guest required');
      return;
    }
    
    if (guests > maxGuests) {
      toast.error(`This villa can accommodate maximum ${maxGuests} guest${maxGuests > 1 ? 's' : ''} only.`);
      setGuestError(`Maximum ${maxGuests} guest${maxGuests > 1 ? 's' : ''} allowed`);
      return;
    }
    
    const cartItem = {
      villaId: villa._id,
      villa: villa._id,
      checkIn: range.from.toISOString(),
      checkOut: range.to.toISOString(),
      guests,
      price: numberOfNights * villa.price,
    };
    
    dispatch(addToCart(cartItem));
    toast.success('Added to cart!');
  };

  const isBookingValid = numberOfNights > 0 && guests >= 1 && guests <= maxGuests;

  return (
    <>
      {/* Guest Capacity Update Modal */}
      <AnimatePresence>
        {showCapacityModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCapacityModal(false)}
          >
            <motion.div
              className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-4">Set Guest Capacity</h3>
              <p className="text-gray-400 text-sm mb-4">
                Define the maximum number of guests this villa can accommodate.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Maximum Guests
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={tempMaxGuests}
                  onChange={(e) => setTempMaxGuests(e.target.value)}
                  placeholder={`Suggested: ${maxGuests}`}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current estimate: {maxGuests} (based on {villa.bedrooms} bedrooms)
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowCapacityModal(false)}
                  className="flex-1 bg-gray-600 text-white font-bold py-3 rounded-lg hover:bg-gray-500 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleUpdateCapacity}
                  className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Update
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Booking Widget */}
      <motion.div
        className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700"
        variants={slideInLeft}
        initial="hidden"
        animate="visible"
      >
        {/* Price Header */}
        <p className="text-2xl font-bold text-white mb-4">
          ₹{villa.price.toLocaleString('en-IN')}{' '}
          <span className="text-lg font-normal text-gray-400">/ night</span>
        </p>

        {/* Warning if using estimated capacity */}
        {!hasExplicitGuestLimit && (
          <motion.div 
            className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-2">
              <FiUsers className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-yellow-400 font-semibold">Estimated Capacity</p>
                <p className="text-xs text-gray-300 mt-1">
                  Using calculated limit of {maxGuests} guests based on {villa.bedrooms} bedrooms.
                </p>
                <button
                  onClick={() => {
                    setTempMaxGuests(maxGuests.toString());
                    setShowCapacityModal(true);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline mt-1"
                >
                  Set exact capacity →
                </button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Calendar */}
        <div className="flex justify-center bg-gray-800 rounded-xl p-4 border-2 border-gray-700 booking-calendar-wrapper">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={1}
            disabled={[{ before: new Date() }, ...disabledDays]}
          />
        </div>
        
        {/* Guest Input */}
        <div className="border-t border-gray-700 mt-4 pt-4">
          <label className="block text-sm font-bold text-gray-300 mb-2">
            Number of Guests{' '}
            <span className="text-xs font-normal text-gray-400">
              (Max: {maxGuests}{!hasExplicitGuestLimit && ' - estimated'})
            </span>
          </label>
          <div className="relative">
            <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="number"
              value={guests}
              min="1"
              max={maxGuests}
              onChange={handleGuestChange}
              onBlur={handleGuestBlur}
              className={`w-full p-2 pl-10 border rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 transition-all ${
                guestError ? 'border-red-500 focus:ring-red-500' : 'border-gray-600'
              }`}
            />
          </div>
          <AnimatePresence>
            {guestError && (
              <motion.p 
                className="text-red-400 text-xs mt-1 flex items-center gap-1"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <FiX className="w-3 h-3" />
                {guestError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        {/* Add to Cart Button */}
        <motion.button
          onClick={handleAddToCart}
          className={`mt-4 w-full font-bold py-3 rounded-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
            isBookingValid
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white cursor-pointer'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!isBookingValid}
          whileHover={{ scale: isBookingValid ? 1.05 : 1, boxShadow: isBookingValid ? '0px 0px 25px rgba(99, 102, 241, 0.6)' : undefined }}
          whileTap={{ scale: isBookingValid ? 0.95 : 1 }}
        >
          <FiShoppingCart /> 
          {!range?.from || !range?.to ? 'Select Dates' : !isBookingValid && guests > maxGuests ? `Max ${maxGuests} Guest${maxGuests > 1 ? 's' : ''}` : 'Add to Cart'}
        </motion.button>
        
        {/* Price Breakdown */}
        <AnimatePresence>
          {numberOfNights > 0 && isBookingValid && (
            <motion.div
              className="text-center mt-4 pt-4 border-t border-gray-700 space-y-2 text-gray-300"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex justify-between text-sm">
                <span>₹{villa.price.toLocaleString('en-IN')} x {numberOfNights} night{numberOfNights > 1 ? 's' : ''}</span>
                <span>₹{(villa.price * numberOfNights).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{guests} guest{guests === 1 ? '' : 's'}</span>
                <span>{numberOfNights} night{numberOfNights === 1 ? '' : 's'}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 text-white border-t border-gray-600">
                <span>Total</span>
                <span>₹{(villa.price * numberOfNights).toLocaleString('en-IN')}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

// ==================== EDIT VILLA FORM ====================
const EditVillaForm = ({
  villa,
  onSave,
  onCancel,
}: {
  villa: ExtendedVilla;
  onSave: (formData: FormData) => void;
  onCancel: () => void;
}) => {
  const [editableData, setEditableData] = useState(villa);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditableData({ ...editableData, [e.target.name]: e.target.value });
  };

  const handleAmenityToggle = (name: string) => {
    setEditableData((prev: ExtendedVilla) => ({
      ...prev,
      amenities: { ...prev.amenities, [name]: !prev.amenities[name] },
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewPhotos((prev: File[]) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const markPhotoForDeletion = (photoUrl: string) => {
    setEditableData((prev: ExtendedVilla) => ({
      ...prev,
      photos: prev.photos.filter((p: string) => p !== photoUrl),
    }));
    if (!photosToDelete.includes(photoUrl)) {
      setPhotosToDelete((prev) => [...prev, photoUrl]);
    }
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    const excludedKeys = ['unavailability', 'photos', '_id', 'host', 'createdAt', 'updatedAt', 'amenities'];

    (Object.keys(editableData) as Array<keyof ExtendedVilla>).forEach((key) => {
      if (!(excludedKeys as string[]).includes(key)) {
        if (editableData[key] !== villa[key]) {
          formData.append(key, String(editableData[key]));
        }
      }
    });

    formData.append('amenities', JSON.stringify(editableData.amenities));
    newPhotos.forEach((file) => formData.append('photos', file));

    if (photosToDelete.length > 0) {
      formData.append('photosToDelete', JSON.stringify(photosToDelete));
    }
    onSave(formData);
  };

  const amenitiesList = Object.keys(amenityIconMap).map((key) => ({
    name: key,
    label: amenityIconMap[key].label,
    icon: amenityIconMap[key].icon,
  }));

  return (
    <motion.div
      className="relative w-full max-w-6xl h-auto bg-gradient-to-br from-blue-900/40 to-purple-900/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 text-white overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.7, ease: cubicBezier(0.25, 1, 0.5, 1) }}
    >
      {[...Array(5)].map((_, i) => (
        <LightTrail key={i} delay={i * 3} />
      ))}

      <form onSubmit={handleSaveChanges} className="p-8 md:p-12">
        <div className="flex justify-between items-center mb-10">
          <motion.h1
            className="text-3xl font-bold text-white"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Editing: <span className="text-orange-300">{villa.title}</span>
          </motion.h1>
          <motion.button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Cancel edit"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiXCircle size={28} />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Column 1: VILLA ESSENTIALS */}
          <motion.div
            className="flex flex-col space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-bold text-2xl text-orange-300 tracking-wider uppercase">
              Villa Essentials
            </h2>
            <InputWithIcon
              icon={<MdVilla />}
              name="title"
              placeholder="Villa Name"
              value={editableData.title}
              onChange={handleFormChange}
            />
            <InputWithIcon
              icon={<MdLocationOn />}
              name="address"
              placeholder="Location"
              value={editableData.address}
              onChange={handleFormChange}
            />

            <div>
              <h3 className="font-semibold text-lg mb-2">Set Your Price</h3>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-orange-400 font-bold text-xl pointer-events-none">
                  ₹
                </div>
                <input
                  type="number"
                  name="price"
                  value={editableData.price}
                  onChange={handleFormChange}
                  className="w-full p-4 pl-12 bg-black/20 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-white text-2xl font-bold"
                  placeholder="5000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <EssentialInput
                label="Bedrooms"
                icon={<MdKingBed />}
                name="bedrooms"
                value={editableData.bedrooms}
                onChange={handleFormChange}
                placeholder="3"
              />
              <EssentialInput
                label="Bathrooms"
                icon={<MdBathroom />}
                name="bathrooms"
                value={editableData.bathrooms}
                onChange={handleFormChange}
                placeholder="2"
              />
            </div>

            <EssentialInput
              label="Max Guests"
              icon={<FiUsers />}
              name="guests"
              value={editableData.guests}
              onChange={handleFormChange}
              placeholder="6"
            />

            <EssentialInput
              label="Area (sq ft)"
              icon={<BsTextareaResize />}
              name="area"
              value={editableData.area}
              onChange={handleFormChange}
              placeholder="2000"
            />
          </motion.div>

          {/* Column 2: AMENITIES */}
          <motion.div
            className="flex flex-col space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="font-bold text-2xl text-orange-300 tracking-wider uppercase">
              Amenities
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {amenitiesList.map((amenity) => (
                <motion.button
                  key={amenity.name}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity.name)}
                  className={`p-3 rounded-lg border transition-all flex flex-col items-center justify-center gap-2 ${
                    editableData.amenities[amenity.name]
                      ? 'bg-orange-500/30 border-orange-400 text-white'
                      : 'bg-black/20 border-white/20 text-white/60'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {amenity.icon}
                  <span className="text-xs font-medium text-center">{amenity.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Column 3: PHOTOS & DESCRIPTION */}
          <motion.div
            className="flex flex-col space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="font-bold text-2xl text-orange-300 tracking-wider uppercase">
              Photos & Details
            </h2>

            {/* Description */}
            <div>
              <label className="block font-semibold text-lg mb-2">Description</label>
              <textarea
                name="description"
                value={editableData.description}
                onChange={handleFormChange}
                rows={4}
                className="w-full p-4 bg-black/20 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-white resize-none"
                placeholder="Describe your beautiful villa..."
              />
            </div>

            {/* Existing Photos */}
            <div>
              <label className="block font-semibold text-lg mb-2">Current Photos</label>
              <div className="grid grid-cols-2 gap-3">
                {editableData.photos.map((photo: string, idx: number) => (
                  <motion.div
                    key={idx}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-white/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Image 
                      src={photo} 
                      alt={`Villa ${idx}`} 
                      fill
                      className="object-cover"
                    />
                    <motion.button
                      type="button"
                      onClick={() => markPhotoForDeletion(photo)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiTrash2 size={16} />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* New Photos */}
            {newPhotos.length > 0 && (
              <div>
                <label className="block font-semibold text-lg mb-2">New Photos</label>
                <div className="grid grid-cols-2 gap-3">
                  {newPhotos.map((file, idx) => (
                    <motion.div
                      key={idx}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-green-400"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`New ${idx}`}
                        fill
                        className="object-cover"
                      />
                      <motion.button
                        type="button"
                        onClick={() => removeNewPhoto(idx)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiX size={16} />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <motion.label
              className="cursor-pointer bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiUpload /> Upload Photos
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </motion.label>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          className="flex justify-end gap-4 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            type="button"
            onClick={onCancel}
            className="bg-gray-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-500 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-8 rounded-lg hover:shadow-xl transition-all flex items-center gap-2"
            whileHover={{ scale: 1.05, boxShadow: '0px 0px 25px rgba(16, 185, 129, 0.5)' }}
            whileTap={{ scale: 0.95 }}
          >
            <FiSave /> Save Changes
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default function VillaDetailPage() {
  const params = useParams();
  const { id } = params;
  const [villa, setVilla] = useState<ExtendedVilla | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { user: currentUser } = useAppSelector((state) => state.auth) as { user: ExtendedUser | null };

  // Helper function to get host ID from either string or object
  const getHostId = (host: string | { _id: string; name: string } | undefined): string | undefined => {
    if (!host) return undefined;
    return typeof host === 'string' ? host : host._id;
  };

  // Helper function to get current user ID
  const getCurrentUserId = (user: ExtendedUser | null): string | undefined => {
    if (!user) return undefined;
    return user._id || user.id;
  };

  const isHost = currentUser && villa && getCurrentUserId(currentUser) === getHostId(villa.host);

  useEffect(() => {
    const fetchVilla = async () => {
      try {
        const response = await axios.get(`/api/villas/${id}`);
        setVilla(response.data);
      } catch {
        toast.error('Failed to load villa details.');
      } finally {
        setLoading(false);
      }
    };
    fetchVilla();
  }, [id]);

  const handleSaveEdit = async (formData: FormData) => {
    try {
      const response = await axios.put(`/api/villas/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      setVilla(response.data);
      setIsEditing(false);
      toast.success('Villa updated successfully!');
    } catch {
      toast.error('Failed to update villa.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          className="text-white text-2xl"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!villa) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Villa not found</div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Navbar />

        {isEditing ? (
          <div className="flex justify-center items-center p-4 md:p-8">
            <EditVillaForm
              villa={villa}
              onSave={handleSaveEdit}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <motion.div
            className="container mx-auto p-4 md:p-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            {/* Header */}
            <motion.div variants={slideInUp} className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{villa.title}</h1>
              <div className="flex items-center text-gray-400">
                <FiMapPin className="mr-2" />
                <span>{villa.address}</span>
              </div>
            </motion.div>

            {/* Photo Gallery */}
            <PhotoGallery photos={villa.photos} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              {/* Left Column: Details */}
              <motion.div className="lg:col-span-2 space-y-8" variants={slideInRight}>
                {/* Quick Info */}
                <motion.div
                  className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700"
                  variants={scaleIn}
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <MdKingBed className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
                      <p className="text-2xl font-bold text-white">{villa.bedrooms}</p>
                      <p className="text-gray-400 text-sm">Bedrooms</p>
                    </div>
                    <div>
                      <MdBathroom className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
                      <p className="text-2xl font-bold text-white">{villa.bathrooms}</p>
                      <p className="text-gray-400 text-sm">Bathrooms</p>
                    </div>
                    <div>
                      <FiUsers className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
                      <p className="text-2xl font-bold text-white">{villa.guests || villa.bedrooms * 2}</p>
                      <p className="text-gray-400 text-sm">Max Guests</p>
                    </div>
                    <div>
                      <BsTextareaResize className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
                      <p className="text-2xl font-bold text-white">{villa.area}</p>
                      <p className="text-gray-400 text-sm">sq ft</p>
                    </div>
                  </div>
                  
                  {/* Guest Capacity Highlight */}
                  <motion.div 
                    className="mt-4 pt-4 border-t border-gray-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center justify-center gap-2 text-emerald-400">
                      <FiUsers className="w-5 h-5" />
                      <span className="font-semibold">
                        Accommodates up to {villa.guests || villa.bedrooms * 2} {(villa.guests || villa.bedrooms * 2) === 1 ? 'guest' : 'guests'}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Description */}
                <motion.div
                  className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700"
                  variants={scaleIn}
                >
                  <h2 className="text-2xl font-bold text-white mb-4">About This Villa</h2>
                  <p className="text-gray-300 leading-relaxed">{villa.description}</p>
                </motion.div>

                {/* Amenities */}
                <motion.div
                  className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700"
                  variants={scaleIn}
                >
                  <h2 className="text-2xl font-bold text-white mb-4">Amenities</h2>
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {Object.entries(villa.amenities)
                      .filter(([, value]) => value)
                      .map(([key]) => {
                        const amenity = amenityIconMap[key];
                        return amenity ? (
                          <motion.div key={key} variants={scaleIn}>
                            <AmenityItem icon={amenity.icon} text={amenity.label} />
                          </motion.div>
                        ) : null;
                      })}
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Right Column: Booking or Host Controls */}
              <div className="space-y-6">
                {isHost ? (
                  <HostControls
                    villa={villa}
                    onEditClick={() => setIsEditing(true)}
                    onAvailabilityUpdate={setVilla}
                  />
                ) : (
                  <BookingWidget villa={villa} />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}