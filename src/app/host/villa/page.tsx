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
        className="absolute top-0 left-0 w-1.5 h-1.5 bg-orange-400 rounded-full blur-[2px]"
        style={{ opacity: 0 }}
        animate={{
            x: [0, Math.random() * 600 - 300, 0],
            y: [0, Math.random() * 900 - 450, 0],
            opacity: [0, 0.4, 0],
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
            // Optional: Show a nice success modal here instead of alert
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
        { name: 'wifi', label: 'Wi-Fi', icon: <MdPool size={20} /> }, // Using generic icons as placeholders if specifics aren't imported
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
            <div className="relative min-h-screen w-full flex items-center justify-center p-4 lg:p-8 overflow-hidden bg-[#0a111f]">
                {/* Background Atmosphere */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-[#0d1a2e] to-black" />
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
                </div>

                <motion.div 
                    className="relative z-10 w-full max-w-6xl bg-[#131d33]/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 text-slate-200 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {/* Decorative Top Border */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
                    
                    {[...Array(6)].map((_, i) => <LightTrail key={i} delay={i * 2} />)}

                    <form onSubmit={handleSubmit} className="p-6 md:p-12">
                        <div className="text-center mb-10">
                            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-200 via-orange-400 to-amber-500 mb-3">
                                List Your Property
                            </h1>
                            <p className="text-slate-400">Share your villa with the world and start hosting.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            
                            {/* LEFT COLUMN: DETAILS */}
                            <div className="space-y-8">
                                <SectionHeader title="Essentials" />
                                
                                <div className="space-y-5">
                                    <InputWithIcon 
                                        icon={<MdVilla size={20} />} 
                                        name="villaName" 
                                        placeholder="Villa Name (e.g. Sunset Paradise)" 
                                        value={formData.villaName} 
                                        onChange={handleChange}
                                        required
                                    />
                                    
                                    <InputWithIcon 
                                        icon={<MdLocationOn size={20} />} 
                                        name="location" 
                                        placeholder="Location (e.g. Bali, Indonesia)" 
                                        value={formData.location} 
                                        onChange={handleChange}
                                        required
                                    />
                                    
                                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-1 relative group focus-within:border-orange-500/50 focus-within:bg-slate-800 transition-all">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-orange-400">
                                            <MdOutlineAttachMoney size={22} />
                                        </div>
                                        <input 
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            placeholder="Price per night"
                                            required
                                            min="1"
                                            className="w-full p-4 pl-12 bg-transparent outline-none text-lg placeholder:text-slate-500 font-medium" 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <CounterInput 
                                        label="Bedrooms" 
                                        icon={<MdKingBed className="text-blue-400" />} 
                                        name="bedrooms" 
                                        value={formData.bedrooms} 
                                        onChange={handleChange}
                                    />
                                    <CounterInput 
                                        label="Bathrooms" 
                                        icon={<MdBathroom className="text-blue-400" />} 
                                        name="bathrooms" 
                                        value={formData.bathrooms} 
                                        onChange={handleChange}
                                    />
                                    <CounterInput 
                                        label="Area (sqft)" 
                                        icon={<BsTextareaResize className="text-emerald-400" />} 
                                        name="area" 
                                        value={formData.area} 
                                        onChange={handleChange}
                                        step={50}
                                    />
                                    <CounterInput 
                                        label="Guests" 
                                        icon={<MdPeople className="text-orange-400" />} 
                                        name="maxGuests" 
                                        value={formData.maxGuests} 
                                        onChange={handleChange}
                                        max={50}
                                    />
                                </div>

                                <div className="pt-2">
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Amenities</h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {amenitiesList.map(item => (
                                            <motion.button 
                                                type="button" 
                                                key={item.name} 
                                                onClick={() => toggleAmenity(item.name)} 
                                                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 overflow-hidden ${
                                                    amenities[item.name] 
                                                        ? 'bg-orange-500/10 border-orange-500/50 text-orange-200 shadow-[0_0_15px_rgba(249,115,22,0.15)]' 
                                                        : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                                                }`}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {amenities[item.name] && (
                                                    <div className="absolute top-1 right-1 text-orange-500">
                                                        <FiCheck size={10} />
                                                    </div>
                                                )}
                                                <div className={`mb-1 ${amenities[item.name] ? 'text-orange-400' : 'text-slate-500'}`}>
                                                    {item.icon}
                                                </div>
                                                <span className="text-[10px] font-medium">{item.label}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: MEDIA */}
                            <div className="space-y-8">
                                <SectionHeader title="Gallery & Description" />
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Description</label>
                                    <textarea 
                                        name="description" 
                                        value={formData.description} 
                                        onChange={handleChange} 
                                        placeholder="Tell guests what makes your place special..." 
                                        rows={6} 
                                        required
                                        className="w-full p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all placeholder:text-slate-600 resize-none text-slate-200" 
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <label className="text-sm font-medium text-slate-400 ml-1">Photos</label>
                                        <span className="text-xs text-slate-500">{formData.photos.length}/10 uploaded</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {/* Upload Button */}
                                        <label 
                                            htmlFor="photos" 
                                            className="aspect-square flex flex-col items-center justify-center bg-slate-800/30 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:bg-slate-800 hover:border-orange-400 hover:text-orange-400 transition-all group"
                                        >
                                            <FiUpload className="w-6 h-6 text-slate-500 group-hover:text-orange-400 mb-2 transition-colors" />
                                            <span className="text-[10px] uppercase font-bold text-slate-500 group-hover:text-orange-400">Add</span>
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
                                                    key={index} // Ideally use a unique ID, index is fallback
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                    className="relative aspect-square group rounded-xl overflow-hidden shadow-lg border border-slate-700/50"
                                                >
                                                    <Image 
                                                        src={URL.createObjectURL(file)} 
                                                        alt="preview" 
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110" 
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removePhoto(index)} 
                                                            className="bg-red-500/90 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors transform hover:scale-110"
                                                        >
                                                            <FiX size={14} />
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
                                    className="mt-8 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-200 justify-center"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <FiX className="shrink-0" />
                                    <p className="text-sm font-medium">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* SUBMIT BUTTON */}
                        <div className="mt-10 flex justify-center">
                            <motion.button 
                                type="submit" 
                                disabled={submitting} 
                                className="group relative flex items-center justify-center w-full max-w-sm py-4 px-8 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-full shadow-lg shadow-orange-900/20 hover:shadow-orange-600/30 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transition-all"
                                whileHover={{ scale: submitting ? 1 : 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                {submitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Publishing...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span>PUBLISH LISTING</span>
                                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </motion.button>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-slate-500">
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
    <div className="flex items-center gap-4 mb-2">
        <h2 className="text-xl font-bold text-slate-100 tracking-wide uppercase">{title}</h2>
        <div className="h-[1px] bg-slate-700 flex-grow" />
    </div>
);

const InputWithIcon = ({ icon, ...props }: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-400 transition-colors">
            {icon}
        </div>
        <input 
            {...props} 
            className="w-full p-4 pl-12 bg-slate-800/50 border border-slate-700/50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all placeholder:text-slate-600 text-slate-200" 
        />
    </div>
);

const CounterInput = ({ label, icon, ...props }: { label: string; icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-colors group">
        <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5 mb-1 group-hover:text-slate-400 transition-colors">
            {icon} {label}
        </label>
        <input 
            type="number" 
            {...props} 
            className="w-full bg-transparent text-2xl font-bold text-slate-200 outline-none placeholder:text-slate-700" 
        />
    </div>
);

export default HostVillaPage;