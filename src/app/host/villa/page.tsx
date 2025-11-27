'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
    FiUpload, FiArrowRight, FiX, FiCheck 
} from 'react-icons/fi';
import { 
    MdVilla, MdLocationOn, MdKingBed, MdPeople, MdPool, 
    MdFitnessCenter, MdSpa, MdTheaters, MdBathroom, MdOutlineAttachMoney
} from "react-icons/md";
import { BsTextareaResize } from "react-icons/bs";
import { FaUmbrellaBeach } from "react-icons/fa";
import Navbar from '@/app/components/navbar';
import { useAppSelector } from '@/app/store/Hooks';
import api from '@/utils/axiosInstance';
import { isAxiosError } from 'axios';

// --- VISUAL COMPONENTS ---

const LightTrail = ({ delay }: { delay: number }) => (
    <motion.div
        className="absolute top-0 left-0 w-1.5 h-1.5 bg-orange-300 rounded-full blur-[2px]"
        style={{ opacity: 0 }}
        animate={{
            x: [0, Math.random() * 600 - 300, 0],
            y: [0, Math.random() * 900 - 450, 0],
            opacity: [0, 0.6, 0],
            scale: [1, 2, 1],
        }}
        transition={{
            duration: 12 + Math.random() * 8,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay,
        }}
    />
);

// --- ROUTE GUARD ---

const HostRouteGuard = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        let redirectTimer: NodeJS.Timeout;
        let mounted = true;

        const checkAccess = () => {
            if (loading) return;
            
            if (!isAuthenticated) {
                router.replace('/');
                return;
            }

            if (user?.userType !== 'host') {
                redirectTimer = setTimeout(() => {
                    if (mounted && user?.userType !== 'host') {
                        router.replace('/welcome');
                    }
                }, 300);
            } else {
                setIsChecking(false);
            }
        };

        checkAccess();

        return () => {
            mounted = false;
            if (redirectTimer) clearTimeout(redirectTimer);
        };
    }, [isAuthenticated, user, loading, router]);

    if (loading || isChecking || !isAuthenticated || user?.userType !== 'host') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d1a2e] text-slate-200">
                <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-medium tracking-wider uppercase opacity-70">Verifying Host Access</p>
            </div>
        );
    }

    return <>{children}</>;
};

// --- FORM CONTENT ---

const HostVillaPageContent = () => {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        villaName: '',
        location: '',
        price: '',
        bedrooms: 2,
        bathrooms: 1,
        area: 500,
        maxGuests: 4,
        description: '',
        photos: [] as File[],
    });
    
    const [amenities, setAmenities] = useState<Record<string, boolean>>({
        wifi: true,
        pool: true,
        kitchen: false,
        ac: true,
        parking: true,
        tv: false,
        garden: false,
        bbq: false,
        gym: false,
        spa: false,
        privateBeach: false,
        cinema: false,
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);
        setFormData(prev => ({ 
            ...prev, 
            photos: [...prev.photos, ...newFiles].slice(0, 10)
        }));
    };

    const removePhoto = (index: number) => {
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index),
        }));
    };

    const toggleAmenity = (name: string) => {
        setAmenities(prev => ({ ...prev, [name]: !prev[name] }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.photos.length < 1) {
            setError("Please upload at least one photo of the villa.");
            return;
        }
        if (!formData.price || Number(formData.price) <= 0) {
            setError("Please enter a valid price.");
            return;
        }
        if (!formData.maxGuests || Number(formData.maxGuests) < 1) {
            setError("Please specify at least one guest.");
            return;
        }
        
        setSubmitting(true);
        setError(null);

        const submissionData = new FormData();
        submissionData.append('title', formData.villaName);
        submissionData.append('description', formData.description);
        submissionData.append('address', formData.location);
        submissionData.append('price', String(formData.price));
        submissionData.append('bedrooms', String(formData.bedrooms));
        submissionData.append('bathrooms', String(formData.bathrooms));
        submissionData.append('area', String(formData.area));
        submissionData.append('guests', String(formData.maxGuests));
        submissionData.append('amenities', JSON.stringify(amenities));
        
        formData.photos.forEach(photo => {
            submissionData.append('photos', photo);
        });
        
        try {
            await api.post('/villas', submissionData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Villa listed successfully!');
            router.push('/');
        } catch (err: unknown) {
            console.error("Villa submission error:", err);
            let errorMessage = 'An unexpected error occurred';
            if (isAxiosError(err)) {
                errorMessage = err.response?.data?.message || err.message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };
    
    const amenitiesList = [
        { name: 'wifi', label: 'Wi-Fi', icon: <MdPool size={20} /> },
        { name: 'pool', label: 'Pool', icon: <MdPool size={20} /> },
        { name: 'kitchen', label: 'Kitchen', icon: <MdPool size={20} /> },
        { name: 'ac', label: 'AC', icon: <MdPool size={20} /> },
        { name: 'parking', label: 'Parking', icon: <MdPool size={20} /> },
        { name: 'tv', label: 'TV', icon: <MdPool size={20} /> },
        { name: 'garden', label: 'Garden', icon: <MdPool size={20} /> },
        { name: 'bbq', label: 'BBQ', icon: <MdPool size={20} /> },
        { name: 'gym', label: 'Gym', icon: <MdFitnessCenter size={20} /> },
        { name: 'spa', label: 'Spa', icon: <MdSpa size={20} /> },
        { name: 'privateBeach', label: 'Beach', icon: <FaUmbrellaBeach size={20} /> },
        { name: 'cinema', label: 'Cinema', icon: <MdTheaters size={20} /> },
    ];

    return (
        <>
            <Navbar />
            <div 
                className="min-h-screen w-full flex items-center justify-center p-4 lg:p-8 bg-cover bg-center bg-fixed overflow-x-hidden"
                style={{ backgroundImage: "url('https://images.pexels.com/photos/221457/pexels-photo-221457.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}
            >
                {/* Dark Overlay to make text readable */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-0"></div>

                <motion.div 
                    /* CHANGED: Switched from bg-blue-900/40 to bg-slate-900/95 for consistent dark background */
                    className="relative z-10 w-full max-w-6xl bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 text-white overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {/* Animated Light Trails */}
                    {[...Array(6)].map((_, i) => <LightTrail key={i} delay={i * 2} />)}

                    <form onSubmit={handleSubmit} className="p-6 md:p-12 relative z-20">
                        <div className="text-center mb-10">
                            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-200 via-orange-400 to-amber-500 mb-3">
                                List Your Property
                            </h1>
                            <p className="text-white/70 text-lg">Share your villa with the world and start hosting.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            
                            {/* LEFT COLUMN: DETAILS */}
                            <div className="space-y-8">
                                <SectionHeader title="Essentials" />
                                
                                <div className="space-y-5">
                                    <InputWithIcon 
                                        icon={<MdVilla size={22} />} 
                                        name="villaName" 
                                        placeholder="Villa Name (e.g. Sunset Paradise)" 
                                        value={formData.villaName} 
                                        onChange={handleChange}
                                        required
                                    />
                                    
                                    <InputWithIcon 
                                        icon={<MdLocationOn size={22} />} 
                                        name="location" 
                                        placeholder="Location (e.g. Bali, Indonesia)" 
                                        value={formData.location} 
                                        onChange={handleChange}
                                        required
                                    />
                                    
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-orange-400">
                                            <MdOutlineAttachMoney size={24} />
                                        </div>
                                        <input 
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            placeholder="Price per night"
                                            required
                                            min="1"
                                            className="w-full p-4 pl-12 bg-black/40 border border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-orange-400/80 focus:border-orange-400 transition-all placeholder:text-white/40 text-white text-lg font-medium" 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <CounterInput 
                                        label="Bedrooms" 
                                        icon={<MdKingBed className="text-blue-300" />} 
                                        name="bedrooms" 
                                        value={formData.bedrooms} 
                                        onChange={handleChange}
                                    />
                                    <CounterInput 
                                        label="Bathrooms" 
                                        icon={<MdBathroom className="text-blue-300" />} 
                                        name="bathrooms" 
                                        value={formData.bathrooms} 
                                        onChange={handleChange}
                                    />
                                    <CounterInput 
                                        label="Area (sqft)" 
                                        icon={<BsTextareaResize className="text-emerald-300" />} 
                                        name="area" 
                                        value={formData.area} 
                                        onChange={handleChange}
                                        step={50}
                                    />
                                    <CounterInput 
                                        label="Guests" 
                                        icon={<MdPeople className="text-orange-300" />} 
                                        name="maxGuests" 
                                        value={formData.maxGuests} 
                                        onChange={handleChange}
                                        max={50}
                                    />
                                </div>

                                <div className="pt-4">
                                    <h3 className="text-sm font-bold text-orange-200 uppercase tracking-wider mb-4">Amenities</h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {amenitiesList.map(item => (
                                            <motion.button 
                                                type="button" 
                                                key={item.name} 
                                                onClick={() => toggleAmenity(item.name)} 
                                                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 overflow-hidden ${
                                                    amenities[item.name] 
                                                        ? 'bg-orange-500/20 border-orange-400 text-orange-100 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                                                        : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/30'
                                                }`}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {amenities[item.name] && (
                                                    <div className="absolute top-1 right-1 text-orange-400">
                                                        <FiCheck size={12} />
                                                    </div>
                                                )}
                                                <div className={`mb-1 ${amenities[item.name] ? 'text-orange-300' : 'text-white/50'}`}>
                                                    {item.icon}
                                                </div>
                                                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: MEDIA */}
                            <div className="space-y-8">
                                <SectionHeader title="Gallery & Description" />
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-orange-200 uppercase tracking-wider ml-1">Description</label>
                                    <textarea 
                                        name="description" 
                                        value={formData.description} 
                                        onChange={handleChange} 
                                        placeholder="Tell guests what makes your place special..." 
                                        rows={6} 
                                        required
                                        className="w-full p-4 bg-black/40 border border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-orange-400/80 focus:border-orange-400 transition-all placeholder:text-white/40 resize-none text-white text-base" 
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                        <label className="text-sm font-bold text-orange-200 uppercase tracking-wider">Photos</label>
                                        <span className="text-xs text-white/60 font-mono bg-black/30 px-2 py-1 rounded">{formData.photos.length}/10</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {/* Upload Button */}
                                        <label 
                                            htmlFor="photos" 
                                            className="aspect-square flex flex-col items-center justify-center bg-white/5 border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:bg-white/10 hover:border-orange-400 hover:text-orange-300 transition-all group"
                                        >
                                            <FiUpload className="w-6 h-6 text-white/50 group-hover:text-orange-400 mb-2 transition-colors" />
                                            <span className="text-[10px] uppercase font-bold text-white/50 group-hover:text-orange-300">Add</span>
                                        </label>
                                        <input 
                                            type="file" 
                                            id="photos" 
                                            className="hidden" 
                                            multiple 
                                            accept="image/*" 
                                            onChange={handleFileChange} 
                                        />

                                        {/* Photo Previews */}
                                        <AnimatePresence>
                                            {formData.photos.map((file, index) => (
                                                <motion.div 
                                                    key={index}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                    className="relative aspect-square group rounded-xl overflow-hidden shadow-lg border border-white/20"
                                                >
                                                    <Image 
                                                        src={URL.createObjectURL(file)} 
                                                        alt="preview" 
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110" 
                                                    />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removePhoto(index)} 
                                                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors transform hover:scale-110 shadow-lg"
                                                        >
                                                            <FiX size={16} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* ERROR MESSAGE */}
                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    className="mt-8 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200 justify-center backdrop-blur-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="p-1 bg-red-500 rounded-full"><FiX className="text-white w-3 h-3" /></div>
                                    <p className="text-sm font-medium">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* SUBMIT BUTTON */}
                        <div className="mt-12 flex justify-center">
                            <motion.button 
                                type="submit" 
                                disabled={submitting} 
                                className="group relative flex items-center justify-center w-full max-w-md py-4 px-8 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-lg rounded-full shadow-lg shadow-orange-900/40 hover:shadow-orange-600/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transition-all border border-white/20"
                                whileHover={{ scale: submitting ? 1 : 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                {submitting ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Publishing Listing...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 relative z-10">
                                        <span>PUBLISH LISTING</span>
                                        <FiArrowRight className="group-hover:translate-x-1 transition-transform w-5 h-5" />
                                    </div>
                                )}
                            </motion.button>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-white/40">
                                By proceeding, you agree to our Terms of Service & Host Guidelines.
                            </p>
                        </div>
                    </form>
                </motion.div>
            </div>
        </>
    );
};

// --- WRAPPER ---

const HostVillaPage = () => {
    return (
        <HostRouteGuard>
            <HostVillaPageContent />
        </HostRouteGuard>
    );
};

// --- HELPER COMPONENTS ---

const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-4 mb-4">
        <h2 className="text-xl font-bold text-orange-300 tracking-wider uppercase drop-shadow-md">{title}</h2>
        <div className="h-[1px] bg-gradient-to-r from-orange-500/50 to-transparent flex-grow" />
    </div>
);

const InputWithIcon = ({ icon, ...props }: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/50 group-focus-within:text-orange-400 transition-colors">
            {icon}
        </div>
        <input 
            {...props} 
            // CHANGED: Increased input background darkness slightly for contrast
            className="w-full p-4 pl-12 bg-black/40 border border-white/20 rounded-xl outline-none focus:ring-2 focus:ring-orange-400/80 focus:border-orange-400 transition-all placeholder:text-white/40 text-white" 
        />
    </div>
);

const CounterInput = ({ label, icon, ...props }: { label: string; icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) => (
    // CHANGED: Increased input background darkness slightly for contrast
    <div className="p-3 bg-black/40 border border-white/20 rounded-xl hover:border-white/40 transition-colors group">
        <label className="text-[10px] uppercase font-bold text-white/60 flex items-center gap-1.5 mb-1 group-hover:text-white/80 transition-colors">
            {icon} {label}
        </label>
        <input 
            type="number" 
            {...props} 
            className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-white/20" 
        />
    </div>
);

export default HostVillaPage;