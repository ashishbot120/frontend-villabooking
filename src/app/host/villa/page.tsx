'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
    FiUpload, FiArrowRight, FiX 
} from 'react-icons/fi';
import { 
    MdVilla, MdLocationOn, MdKingBed, MdPeople, MdPool, 
    MdFitnessCenter, MdSpa, MdTheaters, MdBathroom
} from "react-icons/md";
import { BsTextareaResize } from "react-icons/bs";
import { FaUmbrellaBeach } from "react-icons/fa";
import Navbar from '../../components/navbar';
import { useAppSelector } from '@/app/store/Hooks';

// Component for the animated light trails effect
const LightTrail = ({ delay }: { delay: number }) => (
    <motion.div
        className="absolute top-0 left-0 w-1 h-1 bg-orange-300 rounded-full"
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

// ROUTE GUARD - Protects the host page
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
            <div className="flex items-center justify-center min-h-screen bg-[#0d1a2e]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-white/70 text-sm">Verifying access...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

// MAIN PAGE CONTENT
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
        
        // Validation
        if (formData.photos.length < 1) {
            setError("Please upload at least one photo of the villa.");
            return;
        }
        if (!formData.price || Number(formData.price) <= 0) {
            setError("Please enter a valid price for the villa.");
            return;
        }
        if (!formData.maxGuests || Number(formData.maxGuests) < 1) {
            setError("Please specify the maximum number of guests (minimum 1).");
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
        submissionData.append('guests', String(formData.maxGuests)); // ← CRITICAL: Send guests field
        submissionData.append('amenities', JSON.stringify(amenities));
        
        formData.photos.forEach(photo => {
            submissionData.append('photos', photo);
        });
        
        try {
            const response = await fetch('/villas', {
                method: 'POST',
                credentials: 'include',
                body: submissionData,
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || 'Something went wrong during submission.');
            }
            
            alert('Villa listed successfully!');
            router.push('/');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
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
                className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.pexels.com/photos/221457/pexels-photo-221457.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}
            >
                <motion.div 
                    className="relative w-full max-w-6xl h-auto bg-blue-900/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 text-white overflow-hidden"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
                >
                    {[...Array(5)].map((_, i) => <LightTrail key={i} delay={i * 3} />)}

                    <form onSubmit={handleSubmit} className="p-8 md:p-12">
                        <h1 className="text-4xl font-bold text-center text-orange-300 mb-8">List Your Villa</h1>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Column 1: VILLA ESSENTIALS */}
                            <div className="flex flex-col space-y-6">
                                <h2 className="font-bold text-2xl text-orange-300 tracking-wider uppercase">Villa Details</h2>
                                
                                <InputWithIcon 
                                    icon={<MdVilla />} 
                                    name="villaName" 
                                    placeholder="Villa Name" 
                                    value={formData.villaName} 
                                    onChange={handleChange}
                                    required
                                />
                                
                                <InputWithIcon 
                                    icon={<MdLocationOn />} 
                                    name="location" 
                                    placeholder="Location" 
                                    value={formData.location} 
                                    onChange={handleChange}
                                    required
                                />
                                
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Price Per Night</h3>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 text-orange-400 font-bold text-xl pointer-events-none">₹</div>
                                        <input 
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            placeholder="2500"
                                            required
                                            min="1"
                                            className="w-full p-4 pl-10 bg-black/20 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all placeholder-white/50 text-xl" 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <EssentialInput 
                                        label="Bedrooms" 
                                        icon={<MdKingBed />} 
                                        name="bedrooms" 
                                        value={formData.bedrooms} 
                                        onChange={handleChange}
                                        min={1}
                                    />
                                    <EssentialInput 
                                        label="Bathrooms" 
                                        icon={<MdBathroom />} 
                                        name="bathrooms" 
                                        value={formData.bathrooms} 
                                        onChange={handleChange}
                                        min={1}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <EssentialInput 
                                        label="Area (sqft)" 
                                        icon={<BsTextareaResize />} 
                                        name="area" 
                                        value={formData.area} 
                                        onChange={handleChange}
                                        min={1}
                                    />
                                    <EssentialInput 
                                        label="Max Guests" 
                                        icon={<MdPeople />} 
                                        name="maxGuests" 
                                        value={formData.maxGuests} 
                                        onChange={handleChange}
                                        min={1}
                                        max={50}
                                    />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Amenities</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {amenitiesList.map(item => (
                                            <motion.button 
                                                type="button" 
                                                key={item.name} 
                                                onClick={() => toggleAmenity(item.name)} 
                                                className={`flex flex-col items-center justify-center p-3 aspect-square rounded-lg border-2 transition-all duration-300 ${
                                                    amenities[item.name] 
                                                        ? 'border-orange-400 bg-orange-500/20' 
                                                        : 'border-white/20 bg-black/20 hover:border-white/50'
                                                }`} 
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <div className={`transition-colors ${amenities[item.name] ? 'text-orange-300' : 'text-white/70'}`}>
                                                    {item.icon}
                                                </div>
                                                <span className="text-xs mt-1">{item.label}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: PHOTOS & DESCRIPTION */}
                            <div className="flex flex-col space-y-6">
                                <h2 className="font-bold text-2xl text-orange-300 tracking-wider uppercase">Photos & Description</h2>
                                
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Villa Description</h3>
                                    <textarea 
                                        name="description" 
                                        value={formData.description} 
                                        onChange={handleChange} 
                                        placeholder="Describe your villa's unique features, amenities, and surroundings..." 
                                        rows={6} 
                                        required
                                        className="w-full p-4 bg-black/20 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all placeholder-white/50" 
                                    />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Villa Photos</h3>
                                    <label 
                                        htmlFor="photos" 
                                        className="w-full text-center py-4 bg-black/20 border-2 border-dashed border-white/30 rounded-lg cursor-pointer hover:bg-white/10 hover:border-orange-400 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FiUpload className="w-5 h-5" />
                                        <span>Upload Photos (Max 10)</span>
                                    </label>
                                    <input 
                                        type="file" 
                                        id="photos" 
                                        className="hidden" 
                                        multiple 
                                        accept="image/*" 
                                        onChange={handleFileChange} 
                                    />
                                    
                                    <div className="grid grid-cols-3 gap-3 mt-4 max-h-64 overflow-y-auto pr-2">
                                        {formData.photos.length > 0 ? (
                                            formData.photos.map((file, index) => (
                                                <div key={index} className="relative group aspect-square">
                                                    <Image 
                                                        src={URL.createObjectURL(file)} 
                                                        alt={`Villa preview ${index + 1}`} 
                                                        fill
                                                        className="object-cover rounded-md" 
                                                    />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removePhoto(index)} 
                                                        className="absolute top-1 right-1 bg-red-600/90 rounded-full p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                                    >
                                                        <FiX className="w-4 h-4" />
                                                    </button>
                                                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-3 text-center text-white/50 py-8">
                                                No photos uploaded yet
                                            </div>
                                        )}
                                    </div>
                                    
                                    {formData.photos.length > 0 && (
                                        <p className="text-sm text-white/70 mt-2">
                                            {formData.photos.length} / 10 photos uploaded
                                        </p>
                                    )}
                                </div>

                                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                                    <h4 className="font-semibold text-orange-300 mb-2 flex items-center gap-2">
                                        <MdPeople className="w-5 h-5" />
                                        Guest Capacity
                                    </h4>
                                    <p className="text-sm text-white/70">
                                        You&apos;ve set the maximum guest capacity to <strong className="text-white">{formData.maxGuests}</strong>. 
                                        This will be enforced during bookings.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {error && (
                            <motion.div 
                                className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-lg"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <p className="text-red-300 text-center">{error}</p>
                            </motion.div>
                        )}

                        <div className="mt-8 flex justify-center">
                            <motion.button 
                                type="submit" 
                                disabled={submitting} 
                                className="flex items-center justify-center w-full max-w-md px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shadow-lg transition-all duration-300 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed" 
                                whileHover={{ scale: submitting ? 1 : 1.05, boxShadow: submitting ? "none" : "0px 0px 20px 0px rgba(249, 115, 22, 0.7)" }} 
                                whileTap={{ scale: submitting ? 1 : 0.98 }}
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        LIST YOUR VILLA
                                        <FiArrowRight className="ml-3" />
                                    </>
                                )}
                            </motion.button>
                        </div>

                        <div className="mt-6 text-center text-sm text-white/50">
                            <p>By listing your villa, you agree to our terms and conditions</p>
                        </div>
                    </form>
                </motion.div>
            </div>
        </>
    );
};

// WRAPPER - Wraps content with route guard
const HostVillaPage = () => {
    return (
        <HostRouteGuard>
            <HostVillaPageContent />
        </HostRouteGuard>
    );
};

const InputWithIcon = ({ icon, ...props }: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="relative flex items-center">
        <div className="absolute left-4 text-orange-400 pointer-events-none">{icon}</div>
        <input 
            {...props} 
            className="w-full p-4 pl-12 bg-black/20 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all placeholder-white/50" 
        />
    </div>
);

const EssentialInput = ({ label, icon, ...props }: { label: string; icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="p-3 bg-black/20 border border-white/20 rounded-lg">
        <label className="text-xs font-semibold text-white/70 flex items-center gap-2">
            {icon} {label}
        </label>
        <input 
            type="number" 
            {...props} 
            className="w-full mt-2 bg-transparent text-2xl font-bold outline-none placeholder-white/50" 
        />
    </div>
);

export default HostVillaPage;